-- ─────────────────────────────────────────────────────────────────────────────
--  RenoCred — Initial Database Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Users (synced from Clerk via webhook or client-side upsert)
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,           -- Clerk user ID
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  salary        INTEGER DEFAULT 0,          -- Annual salary in INR
  credit_score  INTEGER DEFAULT 700,        -- CIBIL score (300-900)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Credit Cards Master Dataset
CREATE TABLE IF NOT EXISTS cards (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  bank            TEXT NOT NULL,
  network         TEXT NOT NULL,             -- Visa, Mastercard, Amex, RuPay
  annual_fee      INTEGER DEFAULT 0,         -- INR
  fee_waiver_spend INTEGER,                  -- Spend threshold for fee waiver
  min_income      INTEGER DEFAULT 0,         -- Minimum annual income in INR
  min_cibil       INTEGER DEFAULT 650,
  welcome_bonus   TEXT,
  lounge_access   INTEGER DEFAULT 0,         -- Complimentary visits/year
  base_reward_rate DECIMAL(4,2) DEFAULT 0.5,
  rewards         JSONB DEFAULT '[]'::jsonb, -- Category-specific reward rates
  highlights      JSONB DEFAULT '[]'::jsonb, -- Key selling points
  gradient_from   TEXT,                      -- Card gradient start color
  gradient_to     TEXT,                      -- Card gradient end color
  apply_url       TEXT,                      -- Bank application URL
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User's Wallet — cards they own
CREATE TABLE IF NOT EXISTS user_cards (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id         TEXT NOT NULL REFERENCES cards(id),
  last_4_digits   TEXT,
  cardholder_name TEXT,
  expiry          TEXT,                       -- MM/YY format
  credit_limit    INTEGER DEFAULT 0,          -- In paise (cents)
  status          TEXT DEFAULT 'active',      -- active, blocked, expired
  added_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, card_id)                   -- One card per user
);

-- 4. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id     TEXT,
  merchant    TEXT NOT NULL,
  amount      INTEGER NOT NULL,               -- In paise
  category    TEXT NOT NULL,                   -- dining, travel, groceries, etc.
  type        TEXT DEFAULT 'debit',            -- debit, credit, refund
  is_pending  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Affiliate Click Tracking
CREATE TABLE IF NOT EXISTS apply_clicks (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT REFERENCES users(id),
  card_id     TEXT NOT NULL REFERENCES cards(id),
  utm_source  TEXT,
  utm_medium  TEXT,
  clicked_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CIBIL Score History
CREATE TABLE IF NOT EXISTS score_history (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL CHECK (score >= 300 AND score <= 900),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Smart Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                   -- warning, milestone, tip, insight
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
--  INDEXES — for query performance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_cards_user ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apply_clicks_card ON apply_clicks(card_id);
CREATE INDEX IF NOT EXISTS idx_apply_clicks_user ON apply_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_score_history_user ON score_history(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_bank ON cards(bank);
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(is_active) WHERE is_active = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
--  Users can only read/write their own data
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE apply_clicks ENABLE ROW LEVEL SECURITY;

-- Cards are publicly readable (no RLS needed for reads)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cards are publicly readable" ON cards FOR SELECT USING (true);

-- Users can read/update only their own profile
CREATE POLICY "Users can view own profile"  ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- User cards: own data only
CREATE POLICY "Own cards only" ON user_cards FOR ALL USING (auth.uid()::text = user_id);

-- Transactions: own data only
CREATE POLICY "Own transactions only" ON transactions FOR ALL USING (auth.uid()::text = user_id);

-- Score history: own data only
CREATE POLICY "Own score history only" ON score_history FOR ALL USING (auth.uid()::text = user_id);

-- Notifications: own data only
CREATE POLICY "Own notifications only" ON notifications FOR ALL USING (auth.uid()::text = user_id);

-- Apply clicks: users can insert their own, admins can read all
CREATE POLICY "Users can log own clicks" ON apply_clicks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view own clicks" ON apply_clicks FOR SELECT USING (auth.uid()::text = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
--  AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
