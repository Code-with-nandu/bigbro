import type { Router } from 'express';
export function createSevakPhotoRouter(options: {
  supabaseUrl: string;
  publishableKey: string;
  imageDirectory: string;
}): Router;
