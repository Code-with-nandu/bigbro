import type { Router } from 'express';
import type { createClient } from '@supabase/supabase-js';
export function createSevakPhotoRouter(options: {
  supabaseUrl: string;
  publishableKey: string;
  clientFactory?: typeof createClient;
}): Router;
