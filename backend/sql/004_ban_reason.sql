ALTER TABLE app_user
ADD COLUMN IF NOT EXISTS ban_reason text;
