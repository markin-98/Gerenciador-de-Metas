-- Corrige usuários que ficaram sem nenhum espaço (ex: saíram do "Minha Conta"
-- pela extinta tela de gestão de Espaço e travaram sem conseguir criar metas).
-- Recria o espaço pessoal "Minha Conta" para qualquer profile sem space_members.

do $$
declare
  orphan record;
  new_space_id uuid;
begin
  for orphan in
    select p.id
    from public.profiles p
    where not exists (
      select 1 from public.space_members sm where sm.user_id = p.id
    )
  loop
    insert into public.spaces (name, owner_id)
    values ('Minha Conta', orphan.id)
    returning id into new_space_id;

    insert into public.space_members (space_id, user_id, role)
    values (new_space_id, orphan.id, 'owner')
    on conflict (space_id, user_id) do nothing;
  end loop;
end $$;
