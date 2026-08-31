alter table luz_ledger drop constraint if exists luz_ledger_kind_check;
alter table luz_ledger add constraint luz_ledger_kind_check
  check (kind in ('emit', 'transfer', 'return'));

create table if not exists luz_token (
  id               integer primary key default 1,
  name             text not null default 'Luz',
  symbol           text not null default 'LUZ',
  decimals         integer not null default 2,
  contract_address text,
  chain            text
);
insert into luz_token (id) values (1) on conflict (id) do nothing;
