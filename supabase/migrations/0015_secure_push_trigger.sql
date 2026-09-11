-- ============================================================================
-- A Edge Function send-push é implantada com verify_jwt=false (o trigger a
-- chama via pg_net, não com um JWT de usuário), então sem mais nada qualquer
-- usuário autenticado podia chamá-la diretamente com um payload forjado
-- (user_id de outra pessoa) e mandar push arbitrário pro dispositivo dela.
-- Agora o trigger manda um segredo compartilhado (Vault: send_push_trigger_secret)
-- no header x-trigger-secret, que a function valida antes de processar.
-- ============================================================================

create or replace function public.trigger_send_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  function_url text;
  service_key text;
  trigger_secret text;
begin
  select decrypted_secret into function_url
  from vault.decrypted_secrets where name = 'send_push_function_url';
  select decrypted_secret into service_key
  from vault.decrypted_secrets where name = 'send_push_service_role_key';
  select decrypted_secret into trigger_secret
  from vault.decrypted_secrets where name = 'send_push_trigger_secret';

  if function_url is not null and service_key is not null and trigger_secret is not null then
    perform net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'x-trigger-secret', trigger_secret
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
