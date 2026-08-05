-- Corrige falha de segurança: a policy "invites_select_token" permitia que
-- QUALQUER usuário autenticado listasse a tabela invites inteira (todos os
-- tokens de todos os espaços/metas do sistema), bastando fazer
-- `select * from invites` pelo client — sem nunca ter recebido o link.
--
-- A partir de agora, select direto na tabela só é permitido para quem já
-- participa do espaço/meta do convite (ex: tela de configurações vendo seus
-- próprios convites). O fluxo de "entrar via link" passa a usar uma função seca
-- (security definer) que resolve só o convite pedido pelo token exato — o
-- token continua sendo o segredo necessário para entrar, mas não dá mais para
-- descobrir tokens de outras pessoas.

drop policy if exists "invites_select_token" on public.invites;

create policy "invites_select_member" on public.invites
  for select using (
    created_by = auth.uid()
    or public.is_space_member(space_id)
    or (goal_id is not null and public.is_goal_member(goal_id))
  );

create or replace function public.get_invite_by_token(p_token text)
returns table (
  id uuid,
  space_id uuid,
  goal_id uuid,
  created_by uuid,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select i.id, i.space_id, i.goal_id, i.created_by, i.created_at
  from public.invites i
  where i.token = p_token;
$$;

grant execute on function public.get_invite_by_token(text) to authenticated;
