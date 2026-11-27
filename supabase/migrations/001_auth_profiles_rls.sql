-- ============================================================================
-- MAQSYMA — Supabase Auth + Roles (RBAC) + RLS + Datos de Registro
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================================

-- 1. Tabla de perfiles vinculada a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text default '',
  last_name text default '',
  full_name text default '',
  document_type text default '',
  document_number text default '',
  phone text default '',
  company text default '',
  accepted_privacy boolean not null default false,
  accepted_privacy_at timestamp with time zone,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Si la tabla ya existía de una versión anterior, agrega las columnas nuevas sin perder datos
alter table public.profiles add column if not exists first_name text default '';
alter table public.profiles add column if not exists last_name text default '';
alter table public.profiles add column if not exists document_type text default '';
alter table public.profiles add column if not exists document_number text default '';
alter table public.profiles add column if not exists phone text default '';
alter table public.profiles add column if not exists accepted_privacy boolean not null default false;
alter table public.profiles add column if not exists accepted_privacy_at timestamp with time zone;

alter table public.profiles enable row level security;

-- 2. Función helper para verificar si el usuario autenticado es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- 3. Trigger para crear perfil automáticamente al registrarse (email o Google OAuth)
--    (Siempre asigna rol 'customer'; nunca confía en metadata del cliente para el rol)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text;
  v_last text;
  v_full text;
  v_privacy boolean;
begin
  v_first := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'given_name',
    ''
  );
  v_last := coalesce(
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'family_name',
    ''
  );
  v_full := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    trim(v_first || ' ' || v_last)
  );
  v_privacy := coalesce((new.raw_user_meta_data ->> 'accepted_privacy')::boolean, false);

  insert into public.profiles (
    id, email, first_name, last_name, full_name,
    document_type, document_number, phone, company,
    accepted_privacy, accepted_privacy_at, role
  )
  values (
    new.id,
    new.email,
    v_first,
    v_last,
    v_full,
    coalesce(new.raw_user_meta_data ->> 'document_type', ''),
    coalesce(new.raw_user_meta_data ->> 'document_number', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'company', ''),
    v_privacy,
    case when v_privacy then timezone('utc'::text, now()) else null end,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Políticas RLS para public.profiles
drop policy if exists "Ver perfil propio o admin" on public.profiles;
create policy "Ver perfil propio o admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Actualizar perfil propio sin cambiar rol" on public.profiles;
create policy "Actualizar perfil propio sin cambiar rol"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- 5. Políticas RLS para public.products (si la tabla existe)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'products'
  ) then
    alter table public.products enable row level security;

    drop policy if exists "Permitir lectura publica de productos" on public.products;
    create policy "Permitir lectura publica de productos"
      on public.products for select
      using (true);

    drop policy if exists "Solo admin inserta productos" on public.products;
    create policy "Solo admin inserta productos"
      on public.products for insert
      with check (public.is_admin());

    drop policy if exists "Solo admin actualiza productos" on public.products;
    create policy "Solo admin actualiza productos"
      on public.products for update
      using (public.is_admin())
      with check (public.is_admin());

    drop policy if exists "Solo admin elimina productos" on public.products;
    create policy "Solo admin elimina productos"
      on public.products for delete
      using (public.is_admin());
  end if;
end $$;

-- ============================================================================
-- Para promover un usuario existente a Administrador, ejecuta:
-- update public.profiles set role = 'admin' where email = 'tu_correo@maqsyma.com';
-- ============================================================================
