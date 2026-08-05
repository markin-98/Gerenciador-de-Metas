-- ============================================================================
-- Gerenciador de Metas - schema inicial
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tabelas
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.space_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (space_id, user_id)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  token text not null unique default gen_random_uuid()::text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  name text not null,
  type text not null check (type in ('challenge', 'target')),
  total_amount_cents bigint not null check (total_amount_cents > 0),
  deposits_count int not null check (deposits_count > 0),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  sequence int not null,
  amount_cents bigint not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_by uuid references public.profiles(id),
  completed_at timestamptz,
  unique (goal_id, sequence)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (goal_id, user_id)
);

create index idx_space_members_user on public.space_members(user_id);
create index idx_space_members_space on public.space_members(space_id);
create index idx_goals_space on public.goals(space_id);
create index idx_deposits_goal on public.deposits(goal_id);
create index idx_achievements_user on public.achievements(user_id);

-- ----------------------------------------------------------------------------
-- Função auxiliar: usuário participa do espaço?
-- ----------------------------------------------------------------------------

create or replace function public.is_space_member(target_space_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.space_members
    where space_id = target_space_id and user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- Trigger: cadastro de usuário -> cria profile + Espaço "Minha Conta"
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_space_id uuid;
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.spaces (name, owner_id)
  values ('Minha Conta', new.id)
  returning id into new_space_id;

  -- A trigger on_space_created (handle_new_space) já insere o owner em
  -- space_members automaticamente; não repetir aqui para evitar violar a
  -- constraint UNIQUE(space_id, user_id).

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: ao criar um espaço, o criador vira membro/owner automaticamente
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_space()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.space_members (space_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (space_id, user_id) do nothing;
  return new;
end;
$$;

create trigger on_space_created
  after insert on public.spaces
  for each row execute function public.handle_new_space();

-- ----------------------------------------------------------------------------
-- Trigger: ao marcar depósito como completed, verifica se a meta foi concluída
-- e concede conquistas a todos os participantes que contribuíram
-- ----------------------------------------------------------------------------

create or replace function public.handle_deposit_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_count int;
  goal_space_id uuid;
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    select count(*) into remaining_count
    from public.deposits
    where goal_id = new.goal_id and status = 'pending';

    if remaining_count = 0 then
      select space_id into goal_space_id from public.goals where id = new.goal_id;

      update public.goals
      set status = 'completed', completed_at = now()
      where id = new.goal_id and status = 'active';

      insert into public.achievements (goal_id, space_id, user_id)
      select distinct new.goal_id, goal_space_id, d.completed_by
      from public.deposits d
      where d.goal_id = new.goal_id and d.completed_by is not null
      on conflict (goal_id, user_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

create trigger on_deposit_completed
  after update on public.deposits
  for each row execute function public.handle_deposit_completed();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.invites enable row level security;
alter table public.goals enable row level security;
alter table public.deposits enable row level security;
alter table public.achievements enable row level security;

-- profiles: qualquer usuário autenticado pode ler perfis (necessário para exibir
-- nome/avatar de colaboradores); só o próprio usuário edita seu perfil.
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

-- spaces: membros veem os espaços dos quais participam
create policy "spaces_select_member" on public.spaces
  for select using (public.is_space_member(id));

create policy "spaces_insert_own" on public.spaces
  for insert with check (owner_id = auth.uid());

create policy "spaces_update_owner" on public.spaces
  for update using (owner_id = auth.uid());

create policy "spaces_delete_owner" on public.spaces
  for delete using (owner_id = auth.uid());

-- space_members: membros do espaço veem a lista de membros
create policy "space_members_select_member" on public.space_members
  for select using (public.is_space_member(space_id));

create policy "space_members_insert_self" on public.space_members
  for insert with check (user_id = auth.uid());

create policy "space_members_delete_self_or_owner" on public.space_members
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.spaces s
      where s.id = space_id and s.owner_id = auth.uid()
    )
  );

-- invites: membros do espaço podem criar/ver convites; qualquer autenticado
-- pode ler um convite específico pelo token para poder entrar no espaço.
create policy "invites_select_token" on public.invites
  for select using (auth.role() = 'authenticated');

create policy "invites_insert_member" on public.invites
  for insert with check (public.is_space_member(space_id) and created_by = auth.uid());

create policy "invites_delete_member" on public.invites
  for delete using (public.is_space_member(space_id));

-- goals: escopadas por membership do espaço
create policy "goals_select_member" on public.goals
  for select using (public.is_space_member(space_id));

create policy "goals_insert_member" on public.goals
  for insert with check (public.is_space_member(space_id) and created_by = auth.uid());

create policy "goals_update_member" on public.goals
  for update using (public.is_space_member(space_id));

create policy "goals_delete_member" on public.goals
  for delete using (public.is_space_member(space_id));

-- deposits: escopados via goal -> space membership
create policy "deposits_select_member" on public.deposits
  for select using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

create policy "deposits_insert_member" on public.deposits
  for insert with check (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

create policy "deposits_update_member" on public.deposits
  for update using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

-- achievements: visíveis a todos os membros do espaço; usuário só vê as suas
-- via tela "Minhas Conquistas", mas o histórico/galeria do espaço é compartilhado.
create policy "achievements_select_member" on public.achievements
  for select using (public.is_space_member(space_id));

-- ----------------------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------------------

alter publication supabase_realtime add table public.deposits;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.achievements;
