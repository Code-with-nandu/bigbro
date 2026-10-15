import { randomUUID } from 'node:crypto';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function createSevakPhotoRouter({ supabaseUrl, publishableKey, clientFactory = createClient }) {
  const router = express.Router();
  router.use((req, res, next) => {
    if (req.path === '/api/sevak-profile-photo') {
      console.info('[sevak-photo] request received');
      res.once('finish', () => console.info(`[sevak-photo] response status=${res.statusCode}`));
    }
    next();
  });
  router.post('/api/sevak-profile-photo', express.raw({ type: 'image/jpeg', limit: MAX_PHOTO_BYTES }), async (req, res) => {
    try {
    const authorization = req.get('authorization') ?? '';
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    const profileId = req.get('x-sevak-profile-id');
    if (!token || !profileId || !/^[0-9a-f-]{36}$/i.test(profileId)) {
      return res.status(401).json({ error: 'Sign in and select a valid Sevak profile.' });
    }
    if (!supabaseUrl || !publishableKey) return res.status(503).json({ error: 'Supabase server configuration is missing.' });
    if (!req.is('image/jpeg') || !Buffer.isBuffer(req.body) || req.body.length < 4 || req.body.length > MAX_PHOTO_BYTES || req.body[0] !== 0xff || req.body[1] !== 0xd8 || req.body.at(-2) !== 0xff || req.body.at(-1) !== 0xd9) {
      return res.status(415).json({ error: 'Upload a valid JPEG image no larger than 5 MiB.' });
    }

    const client = clientFactory(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: authData, error: authError } = await client.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: 'Your Supabase session is invalid or expired. Sign in again.' });
    const { data: isAdmin, error: roleError } = await client.rpc('has_sevak_admin_role');
    if (roleError) return res.status(403).json({ error: `Could not verify the trusted Sevak admin role: ${roleError.message}` });
    if (isAdmin !== true) return res.status(403).json({ error: 'Only an authorized Sevak administrator can save profile photos.' });

    const { data: profile, error: profileError } = await client.from('sevak_profiles').select('id, sevak_id').eq('id', profileId).single();
    if (profileError || !profile) return res.status(404).json({ error: `Could not load the Sevak profile: ${profileError?.message ?? 'profile not found'}` });

    const sevakId = String(profile.sevak_id ?? '');
    if (!sevakId || sevakId === '.' || sevakId === '..' || /[\\/\u0000-\u001f]/.test(sevakId)) {
      return res.status(400).json({ error: 'This Sevak profile has an invalid storage folder identifier.' });
    }
    const photoPath = `${sevakId}/profile-${randomUUID()}.jpg`;
    const storage = client.storage.from('sevak-profiles');
    const { error: uploadError } = await storage.upload(photoPath, req.body, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (uploadError) return res.status(502).json({ error: `Could not upload the photo to private Storage: ${uploadError.message}` });

    const { data: updatedProfile, error: updateError } = await client.from('sevak_profiles').update({ profile_picture: photoPath }).eq('id', profile.id).select('id').maybeSingle();
    if (updateError || !updatedProfile) {
      const { error: cleanupError } = await storage.remove([photoPath]);
      if (cleanupError) console.error('[sevak-photo] unattached upload cleanup failed', { code: cleanupError.name ?? 'unknown' });
      return res.status(403).json({ error: `Photo was uploaded but not attached to the profile: ${updateError?.message ?? 'Row Level Security did not allow the update.'}${cleanupError ? ' The unattached private object could not be removed.' : ''}` });
    }
    return res.status(201).json({ profile_picture: photoPath });
    } catch (error) {
      console.error('[sevak-photo] request processing failed', { code: error?.code ?? 'unknown', name: error?.name ?? 'Error' });
      if (!res.headersSent) return res.status(500).json({ error: 'The profile photo could not be saved because of a server error.' });
      return res.end();
    }
  });
  router.use((error, _req, res, _next) => {
    if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'Photo must be no larger than 5 MiB.' });
    return res.status(400).json({ error: 'Could not read the uploaded JPEG photo.' });
  });
  return router;
}
