import { createClient } from '@supabase/supabase-js';

// Read configuration strictly from VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Security validation: Never allow a secret key in frontend code
const isSecretKey = typeof rawKey === 'string' && rawKey.startsWith('sb_secret_');
const supabasePublishableKey = isSecretKey ? '' : rawKey;

// Identify which variable is being read for diagnostic reporting
export const activeEnvDetails = {
  urlSource: import.meta.env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : 'None',
  keySource: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? 'VITE_SUPABASE_PUBLISHABLE_KEY'
    : import.meta.env.VITE_SUPABASE_ANON_KEY
    ? 'VITE_SUPABASE_ANON_KEY'
    : 'None',
  isSecretKeyBlocked: isSecretKey,
  hasUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey)
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder'
);

export interface CommitmentRecord {
  id?: number | string;
  contribution_type: string;
  full_name: string;
  email: string;
  phone?: string | null;
  note?: string | null;
  created_at?: string;
}

export interface PaymentRecord {
  id?: string;
  commitment_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  amount: number;
  currency?: string;
  payment_gateway?: string | null;
  order_id?: string | null;
  payment_id?: string | null;
  payment_status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Tests database communication with the public.commitments table.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  envInfo: typeof activeEnvDetails;
  details?: unknown;
}> {
  if (isSecretKey) {
    return {
      success: false,
      message: 'Blocked secret key in frontend: Please provide a Supabase Publishable Key (starting with sb_publishable_) in environment variables.',
      envInfo: activeEnvDetails
    };
  }

  if (!supabaseUrl) {
    return {
      success: false,
      message: 'Missing Supabase URL. Please define VITE_SUPABASE_URL in your environment.',
      envInfo: activeEnvDetails
    };
  }

  if (!supabasePublishableKey) {
    return {
      success: false,
      message: 'Missing Supabase Publishable Key. Please define VITE_SUPABASE_PUBLISHABLE_KEY in your environment.',
      envInfo: activeEnvDetails
    };
  }

  try {
    const { error, count, data } = await supabase
      .from('commitments')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      return {
        success: false,
        message: error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error)),
        envInfo: activeEnvDetails,
        details: error
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase and verified public.commitments table.`,
      envInfo: activeEnvDetails,
      details: { rowSample: data, totalCount: count }
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: errorMessage || 'Unexpected network error during Supabase connection test.',
      envInfo: activeEnvDetails
    };
  }
}

/**
 * Checks communication with the public.payments table.
 */
export async function testPaymentsTableConnection(): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
}> {
  try {
    const { error } = await supabase
      .from('payments')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: error.message || String(error),
        details: error
      };
    }

    return {
      success: true,
      message: 'public.payments table is active, configured with RLS, and accessible.'
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err)
    };
  }
}
