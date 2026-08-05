-- Corrige conquistas "presas": quando alguém ajuda a completar uma meta
-- compartilhada por convite (goal_members), a conquista é registrada com o
-- space_id da meta (do dono), não do contribuidor. A policy antiga só
-- permitia ver conquistas via is_space_member/is_goal_member, e como o
-- contribuidor normalmente já não é mais goal_member depois de completar
-- (ou a query do app filtra por space_id próprio), a medalha ficava invisível
-- pra quem ajudou. Agora: o dono da conquista sempre pode ver a própria linha,
-- independente de space/goal membership.

drop policy if exists "achievements_select_member" on public.achievements;

create policy "achievements_select_member" on public.achievements
  for select using (
    user_id = auth.uid()
    or public.is_space_member(space_id)
    or public.is_goal_member(goal_id)
  );
