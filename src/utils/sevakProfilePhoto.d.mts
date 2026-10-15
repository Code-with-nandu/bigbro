import type { SupabaseClient } from '@supabase/supabase-js';

export const LEGACY_SAMPLE_PHOTO_PATH: RegExp;
export function isLegacySamplePhotoPath(photoPath: string): boolean;
export function resolveSevakProfilePhotoUrl(
  storage: SupabaseClient['storage'],
  photoPath: string,
  expiresIn?: number,
): Promise<string>;
