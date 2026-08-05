-- Corrige bug: handle_new_user inseria o owner em space_members manualmente,
-- mas a trigger on_space_created (handle_new_space) já faz isso ao inserir o
-- espaço, causando "duplicate key value violates unique constraint
-- space_members_space_id_user_id_key" em todo cadastro novo.

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
  -- space_members automaticamente; não repetir aqui.

  return new;
end;
$$;
