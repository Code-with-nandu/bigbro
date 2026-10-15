export const LEGACY_SAMPLE_PHOTO_PATH = /^\/sample-sevak\/[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:jpe?g|png|webp)$/i;

export function isLegacySamplePhotoPath(photoPath) {
  return LEGACY_SAMPLE_PHOTO_PATH.test(photoPath);
}

export async function resolveSevakProfilePhotoUrl(storage, photoPath, expiresIn = 3600) {
  if (isLegacySamplePhotoPath(photoPath)) return photoPath;

  const { data, error } = await storage.from('sevak-profiles').createSignedUrl(photoPath, expiresIn);
  if (error) throw new Error(error.message || 'Supabase could not create a signed profile photo URL.');
  if (!data?.signedUrl) throw new Error('Supabase returned no signed profile photo URL.');
  return data.signedUrl;
}
