-- Ejecuta este archivo una sola vez en Supabase > SQL Editor.
-- La aplicación escribe y consulta únicamente desde sus APIs del servidor.

create extension if not exists pgcrypto;

create table if not exists public.opinions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('sugerencia', 'reconocimiento', 'denuncia')),
  message text not null check (char_length(message) between 15 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists opinions_created_at_idx
  on public.opinions (created_at desc);

create index if not exists opinions_type_created_at_idx
  on public.opinions (type, created_at desc);

alter table public.opinions enable row level security;

-- No se crean políticas públicas. La llave secreta permanece únicamente
-- en las funciones del servidor, nunca en el navegador.
