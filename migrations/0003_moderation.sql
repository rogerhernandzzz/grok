alter table profiles add column if not exists last_seen_at timestamptz;
alter table profiles add column if not exists last_ip text;
alter table profiles add column if not exists ip_history jsonb;
alter table profiles add column if not exists muted boolean not null default false;
alter table profiles add column if not exists stars integer not null default 0;

create table if not exists expenses (
  id          serial primary key,
  amount      numeric(12, 2) not null check (amount > 0),
  concept     text not null,
  note        text,
  recorded_by text not null,
  created_at  timestamptz not null default now()
);

create table if not exists dm_messages (
  id          serial primary key,
  from_user   text not null,
  to_user     text not null,
  author_name text not null,
  body        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists visitors (
  id           text primary key,
  user_id      text,
  display_name text,
  last_ip      text,
  ip_history   jsonb,
  last_path    text,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create table if not exists bot_keys (
  id         serial primary key,
  name       text not null default 'grok',
  token_hash text not null,
  prefix     text not null,
  created_at timestamptz not null default now()
);

create table if not exists trader_state (
  user_id    text primary key,
  balance    numeric(14, 2) not null default 10000,
  holdings   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id         serial primary key,
  user_id    text not null,
  title      text not null,
  body       text not null,
  href       text,
  kind       text not null default 'info',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
