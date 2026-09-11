-- ============================================================================
-- Correções de segurança identificadas em revisão:
--
-- 1) "goal_members_insert_self" (0003) permitia que qualquer usuário
--    autenticado se inserisse em goal_members para QUALQUER goal_id, sem
--    passar pelo fluxo de pedido/aprovação (0011). Membership só deve ser
--    criada pela função security definer handle_join_request_resolved,
--    quando o dono aprova um goal_join_requests. Nenhum código do app insere
--    em goal_members diretamente — só via aprovação — então a policy pode
--    ser removida sem quebrar nada.
--
-- 2) "deposits_update_member" restringia quem pode dar UPDATE (membro da
--    meta), mas não quais colunas podem mudar. Qualquer participante podia
--    alterar amount_cents, sequence ou goal_id de um depósito, fraudando o
--    valor/progresso da meta compartilhada. Trigger abaixo trava esses
--    campos e garante que completed_by, ao marcar um depósito como pago,
--    seja sempre o próprio usuário autenticado (não se pode creditar/
--    incriminar outra pessoa pelo pagamento).
-- ============================================================================

drop policy if exists "goal_members_insert_self" on public.goal_members;

create or replace function public.enforce_deposit_update_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.amount_cents <> old.amount_cents
     or new.sequence <> old.sequence
     or new.goal_id <> old.goal_id then
    raise exception 'Alteração não permitida nesses campos do depósito.';
  end if;

  if new.status = 'completed' and old.status = 'pending' and new.completed_by is distinct from auth.uid() then
    raise exception 'completed_by deve ser o usuário autenticado que está marcando o depósito.';
  end if;

  return new;
end;
$$;

drop trigger if exists on_deposit_update_enforce_integrity on public.deposits;
create trigger on_deposit_update_enforce_integrity
  before update on public.deposits
  for each row execute function public.enforce_deposit_update_integrity();
