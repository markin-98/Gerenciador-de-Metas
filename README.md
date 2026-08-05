# Gerenciador de Metas

PWA de metas financeiras individuais e compartilhadas. React 18 + Vite + TypeScript + Tailwind + Supabase (Postgres + Auth + Realtime).

## Setup

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode a migration `supabase/migrations/0001_init.sql` no SQL Editor do projeto (cria tabelas, RLS, triggers e habilita Realtime em `deposits`, `goals` e `achievements`).
3. Copie `.env.example` para `.env` e preencha com a URL e a anon key do seu projeto Supabase.
4. Instale as dependências e rode o app:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Estrutura

- `src/pages` — telas (Dashboard, GoalDetail, History, Achievements, SpaceSettings, Join, Login, Signup)
- `src/components` — componentes reutilizáveis (grid de depósitos, cards, toasts, etc.)
- `src/hooks` — hooks de dados/realtime (`useRealtimeGoal`, `useGoals`, `useSpaces`, etc.)
- `src/lib` — cliente Supabase e lógica de negócio (geração de sequências de depósitos)
- `src/contexts` — Auth e Toast
- `supabase/migrations` — schema do banco
