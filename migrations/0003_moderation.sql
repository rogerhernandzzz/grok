alter table profiles add column if not exists last_seen_at timestamptz;
alter table profiles add column if not exists last_ip text;
alter table profiles add column if not exists ip_history jsonb;
alter table profiles add column if not exists muted boolean not null default false;
alter table profiles add column if not exists stars integer not null default 0;
