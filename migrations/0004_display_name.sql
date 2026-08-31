-- Old profiles tables were created without display_name; CREATE TABLE IF NOT EXISTS
-- in 0002 does not add columns. Patch in place.
alter table profiles add column if not exists display_name text;
update profiles set display_name = 'Miembro' where display_name is null or btrim(display_name) = '';

alter table visitors add column if not exists display_name text;
