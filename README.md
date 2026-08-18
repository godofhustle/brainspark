# BrainSpark

AI-чат на базе моделей NVIDIA NIM (аналог OpenRouter для одного провайдера).

## Требования

- Node.js 20+
- Аккаунт NVIDIA Build для получения API-ключа NIM
- Проект Supabase (auth + хранение чатов и подписок)

## Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NIM_API_KEY=""
```

- `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` — параметры проекта Supabase.
- `NIM_API_KEY` — API-ключ NVIDIA NIM (`https://build.nvidia.com`).

## Запуск

```bash
npm install
npm run dev
```

## Как это работает

- Список доступных моделей запрашивается у NIM через `GET /v1/models` (маршрут `app/api/models/route.ts`).
- Чат-маршрут (`app/api/chat/route.ts`) стримит ответы выбранной модели через NVIDIA NIM.
- Чаты сохраняются в Supabase; подписки и профиль пользователей — в таблицах `chats` и `user_profiles`.

## База данных

```sql
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscription_type text not null default 'free',
  subscription_ends_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```