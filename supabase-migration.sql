-- GoPay - Supabase Migration
-- Execute this SQL in the Supabase SQL Editor (https://supabase.com/dashboard/project/wnjpzsxrwwrskakrhfgg/sql/new)

-- 1. Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- 2. Gateway credentials
CREATE TABLE IF NOT EXISTS public.gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  gateway_type TEXT NOT NULL CHECK (gateway_type IN ('krypt', 'pixgo', 'abacate')),
  credentials JSONB NOT NULL DEFAULT '{}',
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gateways"
  ON public.gateways FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- 3. Payment links
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT DEFAULT '',
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  expiration TEXT DEFAULT 'never',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  transaction_id TEXT,
  qr_code_base64 TEXT,
  copy_paste TEXT,
  payment_link TEXT,
  views INTEGER DEFAULT 0,
  payments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  gateway_type TEXT
);

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own links"
  ON public.payment_links FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- 4. Transactions / payments received
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL,
  gateway_type TEXT NOT NULL,
  transaction_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'refunded')),
  payer_name TEXT,
  payer_document TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- 5. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'link_created', 'link_expired', 'gateway_connected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- Enable realtime for notifications and transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_gateways_user_id ON public.gateways(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON public.payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
