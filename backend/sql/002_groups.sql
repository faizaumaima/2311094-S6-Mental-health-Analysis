CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_groups_name ON groups(name);
CREATE INDEX IF NOT EXISTS ix_groups_owner_id ON groups(owner_id);

CREATE TABLE IF NOT EXISTS group_membership (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES app_user(id),
    can_create BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    can_assign BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_membership_group_user
        UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_group_membership_group_id
    ON group_membership(group_id);

CREATE INDEX IF NOT EXISTS ix_group_membership_user_id
    ON group_membership(user_id);

CREATE TABLE IF NOT EXISTS group_record_assignment (
    id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES well_being_records(id),
    group_id INTEGER NOT NULL REFERENCES groups(id),
    assigned_to INTEGER NOT NULL REFERENCES app_user(id),
    assigned_by INTEGER NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_group_record_assignment_record_id
    ON group_record_assignment(record_id);

CREATE INDEX IF NOT EXISTS ix_group_record_assignment_group_id
    ON group_record_assignment(group_id);

ALTER TABLE well_being_records
    ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id);

CREATE INDEX IF NOT EXISTS ix_wbr_group
    ON well_being_records(group_id);