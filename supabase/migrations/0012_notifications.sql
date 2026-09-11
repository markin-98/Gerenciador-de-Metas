-- ============================================================================
-- Notificações in-app + push.
--
-- Cada meta pertence ao space pessoal de quem a criou (goals.space_id); outras
-- pessoas só participam via goal_members, populado quando o dono aprova um
-- goal_join_requests (ver 0011). Não existe "owner" em goal_members — por
-- isso os participantes de uma meta são: dono do space da meta ∪ goal_members.
-- goal_participant_ids() centraliza essa união para os triggers abaixo.
-- ============================================================================

create extension if not exists pg_net;

-- ----------------------------------------------------------------------------
-- Tabela de notificações
-- ----------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('join_requested', 'join_resolved', 'deposit_marked', 'goal_completed')),
  title text not null,
  body text not null,
  goal_id uuid references public.goals(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

-- Só o destinatário lê e marca como lida; sem policy de insert para clientes
-- (as inserções vêm exclusivamente das funções security definer abaixo).
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

alter publication supabase_realtime add table public.notifications;

-- ----------------------------------------------------------------------------
-- push_subscriptions: endpoints Web Push por usuário
-- ----------------------------------------------------------------------------

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index idx_push_subscriptions_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (user_id = auth.uid());

create policy "push_subscriptions_insert_own" on public.push_subscriptions
  for insert with check (user_id = auth.uid());

create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Função auxiliar: participantes de uma meta
-- ----------------------------------------------------------------------------

create or replace function public.goal_participant_ids(p_goal_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select s.owner_id
  from public.goals g
  join public.spaces s on s.id = g.space_id
  where g.id = p_goal_id
  union
  select gm.user_id
  from public.goal_members gm
  where gm.goal_id = p_goal_id;
$$;

-- ----------------------------------------------------------------------------
-- Trigger: pedido de entrada criado -> notifica os participantes da meta
-- ----------------------------------------------------------------------------

create or replace function public.notify_join_requested()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_name text;
  goal_name text;
begin
  select name into requester_name from public.profiles where id = new.user_id;
  select name into goal_name from public.goals where id = new.goal_id;

  insert into public.notifications (user_id, type, title, body, goal_id, actor_id)
  select p.id, 'join_requested', 'Pedido para participar',
         coalesce(requester_name, 'Alguém') || ' quer entrar na meta "' || coalesce(goal_name, '') || '".',
         new.goal_id, new.user_id
  from public.goal_participant_ids(new.goal_id) p
  where p.id <> new.user_id;

  return new;
end;
$$;

create trigger on_join_request_created
  after insert on public.goal_join_requests
  for each row execute function public.notify_join_requested();

-- Estende o trigger de resolução (0011) para também notificar quem pediu.
create or replace function public.handle_join_request_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  goal_name text;
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    insert into public.goal_members (goal_id, user_id, role)
    values (new.goal_id, new.user_id, 'member')
    on conflict (goal_id, user_id) do nothing;
  end if;
  if new.resolved_at is null and new.status <> 'pending' then
    new.resolved_at := now();
  end if;

  if new.status in ('approved', 'rejected') and (old.status is distinct from new.status) then
    select name into goal_name from public.goals where id = new.goal_id;

    insert into public.notifications (user_id, type, title, body, goal_id, actor_id)
    values (
      new.user_id,
      'join_resolved',
      case when new.status = 'approved' then 'Pedido aprovado' else 'Pedido recusado' end,
      case when new.status = 'approved'
        then 'Você agora faz parte da meta "' || coalesce(goal_name, '') || '".'
        else 'Seu pedido para entrar na meta "' || coalesce(goal_name, '') || '" foi recusado.'
      end,
      new.goal_id,
      new.resolved_by
    );
  end if;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Trigger: depósito marcado como pago -> notifica os demais participantes
-- ----------------------------------------------------------------------------

create or replace function public.notify_deposit_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_name text;
  goal_name text;
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') and new.completed_by is not null then
    select name into actor_name from public.profiles where id = new.completed_by;
    select name into goal_name from public.goals where id = new.goal_id;

    insert into public.notifications (user_id, type, title, body, goal_id, actor_id)
    select p.id, 'deposit_marked', 'Depósito marcado',
           coalesce(actor_name, 'Alguém') || ' marcou um depósito na meta "' || coalesce(goal_name, '') || '".',
           new.goal_id, new.completed_by
    from public.goal_participant_ids(new.goal_id) p
    where p.id <> new.completed_by;
  end if;

  return new;
end;
$$;

create trigger on_deposit_completed_notify
  after update on public.deposits
  for each row execute function public.notify_deposit_completed();

-- ----------------------------------------------------------------------------
-- Trigger: meta concluída -> notifica todos os participantes
-- ----------------------------------------------------------------------------

create or replace function public.notify_goal_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    insert into public.notifications (user_id, type, title, body, goal_id)
    select p.id, 'goal_completed', 'Meta concluída! 🎉',
           'A meta "' || new.name || '" foi 100% concluída.',
           new.id
    from public.goal_participant_ids(new.id) p;
  end if;

  return new;
end;
$$;

create trigger on_goal_completed_notify
  after update on public.goals
  for each row execute function public.notify_goal_completed();

-- ----------------------------------------------------------------------------
-- Trigger: ao inserir uma notificação, dispara a Edge Function de push
-- (pg_net faz a chamada HTTP de forma assíncrona, sem bloquear a transação).
-- A URL/API key da function ficam em Vault (configuradas manualmente após o
-- deploy, via `select vault.create_secret(...)`) para não expor segredos em
-- migration versionada.
-- ----------------------------------------------------------------------------

create or replace function public.trigger_send_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  function_url text;
  service_key text;
begin
  select decrypted_secret into function_url
  from vault.decrypted_secrets where name = 'send_push_function_url';
  select decrypted_secret into service_key
  from vault.decrypted_secrets where name = 'send_push_service_role_key';

  if function_url is not null and service_key is not null then
    perform net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'id', new.id,
        'user_id', new.user_id,
        'type', new.type,
        'title', new.title,
        'body', new.body,
        'goal_id', new.goal_id
      )
    );
  end if;

  return new;
end;
$$;

create trigger on_notification_created_send_push
  after insert on public.notifications
  for each row execute function public.trigger_send_push();
