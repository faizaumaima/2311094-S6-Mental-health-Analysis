ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS failed_login_count integer NOT NULL DEFAULT 0;