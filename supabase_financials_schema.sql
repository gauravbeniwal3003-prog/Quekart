-- ==============================================================================
-- QUEKART PRODUCTION DATABASE SCHEMA FOR VENDOR PAYOUTS, LEDGER & USER WALLET
-- ==============================================================================
-- Run this in Supabase SQL Editor to provision tables, indexes, and constraints safely.

-- 1. VENDOR BALANCES & MASTER FINANCIAL SUMMARY
CREATE TABLE IF NOT EXISTS vendor_balances (
    vendor_id TEXT PRIMARY KEY,
    available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (available_balance >= 0),
    pending_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0),
    total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_refunded NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    bank_account_number TEXT,
    bank_ifsc_code TEXT,
    bank_holder_name TEXT,
    bank_name TEXT,
    upi_id TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VENDOR PAYOUT REQUESTS TABLE (Bank & UPI Withdrawals)
CREATE TABLE IF NOT EXISTS vendor_payout_requests (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('bank', 'upi')),
    account_number TEXT,
    ifsc_code TEXT,
    account_holder_name TEXT,
    bank_name TEXT,
    upi_id TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'Processing' CHECK (status IN ('Processing', 'Completed', 'Rejected')),
    reference_id TEXT NOT NULL UNIQUE,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    utr_number TEXT,
    notes TEXT,
    data JSONB
);

-- 3. VENDOR WALLET LEDGER / FINANCIAL STATEMENT PASSBOOK (Every single credit/debit with running balance)
CREATE TABLE IF NOT EXISTS vendor_wallet_ledger (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('order_credit', 'payout_withdrawal', 'return_deduction', 'opening_balance', 'bonus_credit')),
    type_label TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    order_id TEXT,
    product_title TEXT,
    quantity INTEGER DEFAULT 1,
    description TEXT NOT NULL,
    credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    running_balance NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Settled' CHECK (status IN ('Settled', 'Processing', 'Completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB
);

-- 4. USER QUEKART WALLET (For Refunds & Instant Wallet Payments)
CREATE TABLE IF NOT EXISTS user_wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    phone TEXT NOT NULL UNIQUE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    total_refunds NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cashback NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. USER WALLET TRANSACTIONS LEDGER (Detailed passbook for customer refunds and payments)
CREATE TABLE IF NOT EXISTS user_wallet_transactions (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    user_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('refund_credit', 'order_payment', 'referral_bonus', 'cashback')),
    title TEXT NOT NULL,
    order_id TEXT,
    credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    running_balance NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data JSONB
);

-- -------------------------------------------------------------
-- PERFORMANCE OPTIMIZATION INDEXES
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vendor_id ON vendor_wallet_ledger (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_created_at ON vendor_wallet_ledger (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_ref ON vendor_wallet_ledger (reference_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor_id ON vendor_payout_requests (vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_created_at ON vendor_payout_requests (requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_wallets_phone ON user_wallets (phone);
CREATE INDEX IF NOT EXISTS idx_user_wallet_txns_phone ON user_wallet_transactions (phone);
CREATE INDEX IF NOT EXISTS idx_user_wallet_txns_created_at ON user_wallet_transactions (created_at DESC);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------
ALTER TABLE vendor_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public / service read-write access (or customize with specific JWT auth policies)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Vendor Balances' AND tablename = 'vendor_balances') THEN
        CREATE POLICY "Public Access Vendor Balances" ON vendor_balances FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Payout Requests' AND tablename = 'vendor_payout_requests') THEN
        CREATE POLICY "Public Access Payout Requests" ON vendor_payout_requests FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Vendor Ledger' AND tablename = 'vendor_wallet_ledger') THEN
        CREATE POLICY "Public Access Vendor Ledger" ON vendor_wallet_ledger FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access User Wallets' AND tablename = 'user_wallets') THEN
        CREATE POLICY "Public Access User Wallets" ON user_wallets FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access User Wallet Transactions' AND tablename = 'user_wallet_transactions') THEN
        CREATE POLICY "Public Access User Wallet Transactions" ON user_wallet_transactions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;
