-- Convites agora expiram em 30 dias por padrão (evita links "eternos" que
-- ficam valendo para sempre). A função de resolução por token já passa a
-- ignorar convites expirados.

alter table public.invites
  add column expires_at timestamptz not null default (now() + interval '30 days');

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
  where i.token = p_token
    and i.expires_at > now();
$$;
