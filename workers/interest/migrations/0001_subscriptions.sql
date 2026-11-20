CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  list TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  created_at TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  confirmed_at TEXT,
  unsubscribed_at TEXT,
  source TEXT NOT NULL,
  confirm_token TEXT NOT NULL UNIQUE,
  unsub_token TEXT NOT NULL UNIQUE,
  last_sent_at TEXT,
  UNIQUE (list, email)
);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
