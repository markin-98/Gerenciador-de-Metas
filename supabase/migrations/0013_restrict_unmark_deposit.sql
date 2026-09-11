-- ============================================================================
-- Só quem marcou um depósito como pago pode desmarcá-lo.
--
-- A policy "deposits_update_member" (0003) permitia qualquer participante da
-- meta atualizar qualquer depósito, então qualquer um podia desmarcar um
-- depósito que outra pessoa tinha marcado. Marcar (pending -> completed)
-- continua liberado pra qualquer participante; desmarcar (completed ->
-- pending) só é permitido para quem está em completed_by.
-- ============================================================================

drop policy if exists "deposits_update_member" on public.deposits;
create policy "deposits_update_member" on public.deposits
  for update using (
    exists (
      select 1 from public.goals g
      where g.id = goal_id
        and (public.is_space_member(g.space_id) or public.is_goal_member(g.id))
    )
    and (status <> 'completed' or completed_by = auth.uid())
  )
  with check (
    exists (
      select 1 from public.goals g
      where g.id = goal_id
        and (public.is_space_member(g.space_id) or public.is_goal_member(g.id))
    )
  );
