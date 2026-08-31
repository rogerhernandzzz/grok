alter table profiles add column if not exists luz numeric(18, 2) not null default 0;

create table if not exists luz_ledger (
  id         serial primary key,
  from_user  text,
  to_user    text not null,
  amount     numeric(18, 2) not null check (amount > 0),
  kind       text not null check (kind in ('emit', 'transfer')),
  note       text,
  created_at timestamptz not null default now()
);
