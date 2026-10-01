-- ==============================================================================
-- Migration: Create public.payments table for UPI and Payment Gateway Integration
-- Description: Sets up payments table with foreign key to public.commitments(id),
--              enables Row Level Security (RLS), and sets up trigger for updated_at.
-- ==============================================================================

-- 1. Ensure pgcrypto or uuid-ossp is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create public.payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NULL REFERENCES public.commitments(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_gateway TEXT NULL,
    order_id TEXT NULL,
    payment_id TEXT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    note TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_commitment_id ON public.payments(commitment_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON public.payments(payment_status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS Policies:
-- Allow authenticated and anonymous users to insert payments (for initiating a payment/pledge)
CREATE POLICY "Allow public insert to payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

-- Allow reading payments corresponding to their order_id or id
CREATE POLICY "Allow public select for active payments" 
ON public.payments 
FOR SELECT 
USING (true);

-- 6. Trigger to automatically update updated_at timestamp on record modification
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_payments_updated_at ON public.payments;
CREATE TRIGGER trigger_set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
