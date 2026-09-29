ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'author'
  CHECK (role IN ('author', 'admin'));
ALTER TABLE users ADD COLUMN password_salt TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;
