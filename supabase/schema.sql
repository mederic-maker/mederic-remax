-- ============================================================
-- Médéric Souccar RE/MAX — Schéma Supabase
-- Coller dans l'éditeur SQL de ton projet Supabase
-- ============================================================

-- Extension UUID (déjà activée sur Supabase par défaut)
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- LISTINGS
-- ─────────────────────────────────────────────
create table listings (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  address     text not null,
  city        text not null default 'Gatineau',
  price       integer not null,
  status      text not null default 'actif'
              check (status in ('actif','vendu','sous_offre','retiré')),
  bedrooms    smallint not null default 3,
  bathrooms   numeric(3,1) not null default 2,
  sqft        integer not null default 1200,
  description text,
  photos      text[] not null default '{}',
  featured    boolean not null default false,
  mls_number  text
);

-- Accès public en lecture pour le site public
alter table listings enable row level security;
create policy "listings_public_read" on listings for select using (true);
create policy "listings_auth_write"  on listings for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- CLIENTS (CRM privé)
-- ─────────────────────────────────────────────
create table clients (
  id                 uuid primary key default uuid_generate_v4(),
  created_at         timestamptz not null default now(),
  first_name         text not null,
  last_name          text not null,
  email              text,
  phone              text,
  type               text not null default 'acheteur'
                     check (type in ('acheteur','vendeur','les_deux')),
  status             text not null default 'prospect'
                     check (status in ('prospect','actif','fermé','inactif')),
  notes              text,
  budget_min         integer,
  budget_max         integer,
  linked_listing_id  uuid references listings(id) on delete set null
);

alter table clients enable row level security;
create policy "clients_auth_only" on clients for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- INTERACTIONS (historique par client)
-- ─────────────────────────────────────────────
create table interactions (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  client_id  uuid not null references clients(id) on delete cascade,
  type       text not null default 'note'
             check (type in ('appel','courriel','visite','réunion','note')),
  notes      text not null,
  date       date not null default current_date
);

alter table interactions enable row level security;
create policy "interactions_auth_only" on interactions for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- LEADS (formulaire public)
-- ─────────────────────────────────────────────
create table leads (
  id                   uuid primary key default uuid_generate_v4(),
  created_at           timestamptz not null default now(),
  first_name           text not null,
  last_name            text not null,
  email                text not null,
  phone                text,
  message              text not null,
  listing_id           uuid references listings(id) on delete set null,
  converted            boolean not null default false,
  converted_client_id  uuid references clients(id) on delete set null
);

alter table leads enable row level security;
-- Le formulaire public peut INSERT via service_role (depuis l'API route)
create policy "leads_public_insert" on leads for insert with check (true);
create policy "leads_auth_read_update" on leads for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- PUSH SUBSCRIPTIONS (notifications PWA)
-- ─────────────────────────────────────────────
create table push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null
);

alter table push_subscriptions enable row level security;
create policy "push_service_only" on push_subscriptions for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- STORAGE — bucket listing-photos
-- ─────────────────────────────────────────────
-- Dans Supabase Dashboard > Storage > New bucket :
-- Nom : listing-photos
-- Public : OUI (pour accès URL directe)
--
-- Ou via SQL :
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "listing_photos_public_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

create policy "listing_photos_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
  );

create policy "listing_photos_auth_delete" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
  );

-- ─────────────────────────────────────────────
-- DONNÉES D'EXEMPLE (optionnel — à supprimer en prod)
-- ─────────────────────────────────────────────
insert into listings (address, city, price, status, bedrooms, bathrooms, sqft, featured)
values
  ('112 boul. Maloney Est', 'Gatineau', 299000, 'actif', 3, 2, 1450, true),
  ('45 rue Laval',          'Aylmer',   415000, 'actif', 4, 2, 1800, true),
  ('22 ch. Pink',           'Hull',     275000, 'vendu', 3, 1, 1200, false);
