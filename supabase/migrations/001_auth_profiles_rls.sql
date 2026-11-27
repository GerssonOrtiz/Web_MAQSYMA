-- ============================================================================
-- MAQSYMA — Supabase Auth + Roles (RBAC) + RLS
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================================

-- 1. Tabla de perfiles vinculada a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default '',
  company text default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

-- 3. Trigger para crear perfil automáticamente al registrarse un usuario
--    (Siempre asigna rol 'customer'; nunca confía en metadata del cliente)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company', ''),
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
