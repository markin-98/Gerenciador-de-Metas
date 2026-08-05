-- ============================================================================
-- Convites por meta: cada meta pode ter seu próprio convite, dando acesso
-- apenas àquela meta (sem misturar com as outras metas do espaço do dono).
-- ============================================================================

create table public.goal_members (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (goal_id, user_id)
);

create index idx_goal_members_user on public.goal_members(user_id);
create index idx_goal_members_goal on public.goal_members(goal_id);

alter table public.invites add column goal_id uuid references public.goals(id) on delete cascade;

-- ----------------------------------------------------------------------------
-- Função auxiliar: usuário participa da meta (via convite direto à meta)?
-- ----------------------------------------------------------------------------

create or replace function public.is_goal_member(target_goal_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.goal_members
    where goal_id = target_goal_id and user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- RLS: goal_members
-- ----------------------------------------------------------------------------

alter table public.goal_members enable row level security;

create policy "goal_members_select_participant" on public.goal_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.goals g
      where g.id = goal_id and public.is_space_member(g.space_id)
    )
  );

create policy "goal_members_insert_self" on public.goal_members
  for insert with check (user_id = auth.uid());

create policy "goal_members_delete_self_or_space_owner" on public.goal_members
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.goals g
      join public.spaces s on s.id = g.space_id
      where g.id = goal_id and s.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- RLS: estender acesso de goals/deposits/achievements a quem tem convite de meta
-- ----------------------------------------------------------------------------

drop policy if exists "goals_select_member" on public.goals;
create policy "goals_select_member" on public.goals
  for select using (public.is_space_member(space_id) or public.is_goal_member(id));

drop policy if exists "deposits_select_member" on public.deposits;
create policy "deposits_select_member" on public.deposits
  for select using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id
        and (public.is_space_member(g.space_id) or public.is_goal_member(g.id))
    )
  );

drop policy if exists "deposits_update_member" on public.deposits;
create policy "deposits_update_member" on public.deposits
  for update using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id
        and (public.is_space_member(g.space_id) or public.is_goal_member(g.id))
    )
  );

drop policy if exists "achievements_select_member" on public.achievements;
create policy "achievements_select_member" on public.achievements
  for select using (public.is_space_member(space_id) or public.is_goal_member(goal_id));

-- invites: permitir criar convite de meta para quem participa da meta (space
-- member do espaço dono, ou já convidado daquela meta)
drop policy if exists "invites_insert_member" on public.invites;
create policy "invites_insert_member" on public.invites
  for insert with check (
    created_by = auth.uid()
    and (
      public.is_space_member(space_id)
      or (goal_id is not null and public.is_goal_member(goal_id))
    )
  );

drop policy if exists "invites_delete_member" on public.invites;
create policy "invites_delete_member" on public.invites
  for delete using (
    public.is_space_member(space_id)
    or (goal_id is not null and public.is_goal_member(goal_id))
  );

alter publication supabase_realtime add table public.goal_members;
