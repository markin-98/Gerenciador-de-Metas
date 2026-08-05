-- ============================================================================
-- Convite único e permanente por meta + fluxo de aprovação pelo dono.
--
-- Antes: qualquer convite dava acesso imediato, e o link expirava em 30 dias
-- (girando o token). Agora: cada meta tem exatamente UM link, que nunca muda.
-- Quem clica no link vira um PEDIDO pendente, não entra direto — só o dono da
-- meta pode aprovar ou recusar. A validade do convite deixa de ser o
-- mecanismo de proteção; a aprovação manual é.
-- ============================================================================

-- Remove duplicados que possam existir de metas que já tiveram o link
-- renovado por expiração antiga, mantendo só o convite mais recente de cada
-- meta, antes de travar a unicidade.
delete from public.invites i
using public.invites newer
where i.goal_id is not null
  and i.goal_id = newer.goal_id
  and i.created_at < newer.created_at;

-- Garante um único convite por meta (independente de quem clicar em "gerar
-- link" — sempre reaproveita o mesmo registro).
create unique index invites_one_per_goal on public.invites (goal_id) where goal_id is not null;

-- ----------------------------------------------------------------------------
-- Tabela de pedidos de entrada
-- ----------------------------------------------------------------------------

create table public.goal_join_requests (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  unique (goal_id, user_id)
);

create index idx_goal_join_requests_goal on public.goal_join_requests(goal_id);
create index idx_goal_join_requests_user on public.goal_join_requests(user_id);

alter table public.goal_join_requests enable row level security;

-- Quem pediu vê o próprio pedido; o dono da meta (space member do espaço dela)
-- vê todos os pedidos daquela meta.
create policy "goal_join_requests_select" on public.goal_join_requests
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

-- Qualquer autenticado pode pedir pra entrar (pra si mesmo).
create policy "goal_join_requests_insert_self" on public.goal_join_requests
  for insert with check (user_id = auth.uid());

-- Só o dono da meta decide (aprova/recusa); o próprio solicitante pode
-- cancelar/desistir do pedido (delete via policy separada, se necessário).
create policy "goal_join_requests_update_owner" on public.goal_join_requests
  for update using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

create policy "goal_join_requests_delete_self_or_owner" on public.goal_join_requests
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

-- Ao aprovar um pedido, adiciona automaticamente em goal_members.
create or replace function public.handle_join_request_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    insert into public.goal_members (goal_id, user_id, role)
    values (new.goal_id, new.user_id, 'member')
    on conflict (goal_id, user_id) do nothing;
  end if;
  if new.resolved_at is null and new.status <> 'pending' then
    new.resolved_at := now();
  end if;
  return new;
end;
$$;

create trigger on_join_request_resolved
  before update on public.goal_join_requests
  for each row execute function public.handle_join_request_resolved();

alter publication supabase_realtime add table public.goal_join_requests;

-- ----------------------------------------------------------------------------
-- Resolução de convite por token: agora sem checar expiração, e já trazendo
-- o nome da meta (pra tela de "aguardando aprovação" poder mostrar algo sem
-- precisar de acesso à meta em si).
-- ----------------------------------------------------------------------------

drop function if exists public.get_invite_by_token(text);

create function public.get_invite_by_token(p_token text)
returns table (
  id uuid,
  space_id uuid,
  goal_id uuid,
  goal_name text,
  created_by uuid,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select i.id, i.space_id, i.goal_id, g.name, i.created_by, i.created_at
  from public.invites i
  left join public.goals g on g.id = i.goal_id
  where i.token = p_token;
$$;

-- Também expõe se o usuário atual já é membro/tem pedido pendente daquela
-- meta, pra Join.tsx decidir a tela certa sem precisar de acesso prévio.
create or replace function public.get_my_goal_status(p_goal_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select case
    when exists (select 1 from public.goal_members where goal_id = p_goal_id and user_id = auth.uid())
      then 'member'
    when exists (
      select 1 from public.goal_join_requests
      where goal_id = p_goal_id and user_id = auth.uid() and status = 'pending'
    )
      then 'pending'
    when exists (
      select 1 from public.goal_join_requests
      where goal_id = p_goal_id and user_id = auth.uid() and status = 'rejected'
    )
      then 'rejected'
    else 'none'
  end;
$$;

grant execute on function public.get_invite_by_token(text) to authenticated;
grant execute on function public.get_my_goal_status(uuid) to authenticated;
