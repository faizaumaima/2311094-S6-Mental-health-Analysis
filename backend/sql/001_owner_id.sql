ALTER TABLE well_being_records
  ADD COLUMN IF NOT EXISTS owner_id integer REFERENCES app_user(id);

CREATE INDEX IF NOT EXISTS ix_wbr_owner
  ON well_being_records(owner_id);