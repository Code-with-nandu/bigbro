import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import express from 'express';
import { createSevakPhotoRouter } from '../server/photo-upload.mjs';
import { isLegacySamplePhotoPath, resolveSevakProfilePhotoUrl } from '../src/utils/sevakProfilePhoto.mjs';

const selfProfilePage = await readFile(new URL('../src/components/SevakSelfRegistrationPage.tsx', import.meta.url), 'utf8');
const attendancePage = await readFile(new URL('../src/components/SevakAttendancePage.tsx', import.meta.url), 'utf8');
const photoMigration = await readFile(new URL('../supabase/migrations/20261014_sevak_self_registration_profile_photos.sql', import.meta.url), 'utf8');
const compose = await readFile(new URL('../compose.yaml', import.meta.url), 'utf8');

function mockSupabase({ isAdmin = true, updateError = null } = {}) {
  const profile = { id: '123e4567-e89b-42d3-a456-426614174000', sevak_id: 'SELF-ABC123' };
  const calls = { uploads: [], removals: [], updates: [] };
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'admin-user' } }, error: null }) },
    rpc: async () => ({ data: isAdmin, error: null }),
    from: (table) => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: table === 'sevak_profiles' ? profile : null, error: null }) }) }),
      update: (values) => ({
        eq: (_column, id) => ({
          select: () => ({ maybeSingle: async () => {
            calls.updates.push({ id, values });
            return { data: updateError ? null : { id }, error: updateError };
          } }),
        }),
      }),
    }),
    storage: { from: (bucket) => ({
      upload: async (path, body, options) => { calls.uploads.push({ bucket, path, body, options }); return { error: null }; },
      remove: async (paths) => { calls.removals.push({ bucket, paths }); return { error: null }; },
    }) },
  };
  return { client, calls };
}

async function withPhotoServer(options, run) {
  const app = express();
  app.use(createSevakPhotoRouter(options));
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}/api/sevak-profile-photo`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('both profile pages recognize legacy sample paths and keep private paths signed', () => {
  assert.match(selfProfilePage, /resolveSevakProfilePhotoUrl\(supabase\.storage, photoPath\)/);
  assert.match(attendancePage, /const photoPath = selectedProfile\?\.profile_picture/);
  assert.match(attendancePage, /resolveSevakProfilePhotoUrl\(supabase\.storage, photoPath\)/);
  assert.match(attendancePage, /isLegacySamplePhotoPath\(photoPath\)/);
  assert.match(selfProfilePage, /isLegacySamplePhotoPath\(profile\.profile_picture\)/);
  assert.match(photoMigration, /WHERE id = 'sevak-profiles' AND public = false/);
});

test('valid legacy paths resolve directly and do not request Supabase Storage', async () => {
  const legacyPath = '/sample-sevak/t6-f642ca12-21b5-4423-aaa2-ab0480927648.jpg';
  let storageRequested = false;
  const storage = { from: () => { storageRequested = true; throw new Error('legacy path should not hit Storage'); } };
  assert.equal(isLegacySamplePhotoPath(legacyPath), true);
  assert.equal(await resolveSevakProfilePhotoUrl(storage, legacyPath), legacyPath);
  assert.equal(storageRequested, false);
  assert.equal(isLegacySamplePhotoPath('/sample-sevak/../private.jpg'), false);
});

test('private paths use the private bucket signed URL API and surface signing failures', async () => {
  let request;
  const storage = { from: (bucket) => ({ createSignedUrl: async (path, expiresIn) => {
    request = { bucket, path, expiresIn };
    return { data: { signedUrl: 'https://signed.example/private-photo' }, error: null };
  } }) };
  assert.equal(await resolveSevakProfilePhotoUrl(storage, 'SELF-123/profile-uuid.jpg'), 'https://signed.example/private-photo');
  assert.deepEqual(request, { bucket: 'sevak-profiles', path: 'SELF-123/profile-uuid.jpg', expiresIn: 3600 });
  await assert.rejects(
    resolveSevakProfilePhotoUrl({ from: () => ({ createSignedUrl: async () => ({ data: null, error: { message: 'RLS denied' } }) }) }, 'SELF-123/missing.jpg'),
    /RLS denied/,
  );
  await assert.rejects(
    resolveSevakProfilePhotoUrl({ from: () => ({ createSignedUrl: async () => ({ data: null, error: null }) }) }, 'SELF-123/missing.jpg'),
    /no signed profile photo URL/,
  );
});

test('pending owners can add a private photo without submitting profile or approval fields', () => {
  const saveStart = selfProfilePage.indexOf('const saveProfilePhoto = async () =>');
  const saveEnd = selfProfilePage.indexOf('const refreshSavedPhoto = async () =>', saveStart);
  assert.notEqual(saveStart, -1);
  assert.notEqual(saveEnd, -1);
  const savePhotoHandler = selfProfilePage.slice(saveStart, saveEnd);

  assert.match(savePhotoHandler, /profile\.approval_status !== 'pending'/);
  assert.match(savePhotoHandler, /storage\.from\('sevak-profiles'\)\.upload\(photoPath/);
  assert.match(savePhotoHandler, /update\(\{ profile_picture: photoPath \}\)/);
  assert.doesNotMatch(savePhotoHandler, /approval_status\s*:|status\s*:/);
  assert.match(selfProfilePage, /Add profile photo[\s\S]*Save photo/);
  assert.match(photoMigration, /CREATE POLICY "Sevaks upload their own profile photos"[\s\S]*profile\.auth_user_id = auth\.uid\(\)[\s\S]*profile\.sevak_id = \(storage\.foldername\(name\)\)\[1\]/);
  assert.match(photoMigration, /CREATE POLICY "Sevaks read their own profile photos"[\s\S]*profile\.auth_user_id = auth\.uid\(\)/);
});

test('Docker Compose bind-mount preserves the legacy photo directory', () => {
  assert.match(compose, /\.\/public\/sample-sevak:\/app\/public\/sample-sevak/);
});

test('admin camera endpoint stores new photos in private Storage and attaches the object path', async () => {
  const { client, calls } = mockSupabase();
  await withPhotoServer({ supabaseUrl: 'https://example.supabase.co', publishableKey: 'publishable-test', clientFactory: () => client }, async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
        'x-sevak-profile-id': '123e4567-e89b-42d3-a456-426614174000',
        'content-type': 'image/jpeg',
      },
      body: Buffer.from([0xff, 0xd8, 0x00, 0xff, 0xd9]),
    });
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.match(result.profile_picture, /^SELF-ABC123\/profile-[0-9a-f-]{36}\.jpg$/);
    assert.equal(calls.uploads.length, 1);
    assert.equal(calls.uploads[0].bucket, 'sevak-profiles');
    assert.equal(calls.uploads[0].options.contentType, 'image/jpeg');
    assert.deepEqual(calls.updates, [{ id: '123e4567-e89b-42d3-a456-426614174000', values: { profile_picture: result.profile_picture } }]);
  });
});

test('camera endpoint refuses non-admins before uploading and removes an unattached private object', async () => {
  const denied = mockSupabase({ isAdmin: false });
  await withPhotoServer({ supabaseUrl: 'https://example.supabase.co', publishableKey: 'publishable-test', clientFactory: () => denied.client }, async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'x-sevak-profile-id': '123e4567-e89b-42d3-a456-426614174000', 'content-type': 'image/jpeg' },
      body: Buffer.from([0xff, 0xd8, 0x00, 0xff, 0xd9]),
    });
    assert.equal(response.status, 403);
    assert.equal(denied.calls.uploads.length, 0);
  });

  const failedAttach = mockSupabase({ updateError: { message: 'blocked by RLS' } });
  await withPhotoServer({ supabaseUrl: 'https://example.supabase.co', publishableKey: 'publishable-test', clientFactory: () => failedAttach.client }, async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'x-sevak-profile-id': '123e4567-e89b-42d3-a456-426614174000', 'content-type': 'image/jpeg' },
      body: Buffer.from([0xff, 0xd8, 0x00, 0xff, 0xd9]),
    });
    assert.equal(response.status, 403);
    assert.equal(failedAttach.calls.removals.length, 1);
    assert.deepEqual(failedAttach.calls.removals[0].paths, [failedAttach.calls.uploads[0].path]);
  });
});

test('camera endpoint reports a failed private upload without changing the profile path', async () => {
  const { client, calls } = mockSupabase();
  client.storage.from = () => ({ upload: async () => ({ error: { message: 'storage denied' } }), remove: async () => ({ error: null }) });
  await withPhotoServer({ supabaseUrl: 'https://example.supabase.co', publishableKey: 'publishable-test', clientFactory: () => client }, async (url) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { authorization: 'Bearer test-token', 'x-sevak-profile-id': '123e4567-e89b-42d3-a456-426614174000', 'content-type': 'image/jpeg' },
      body: Buffer.from([0xff, 0xd8, 0x00, 0xff, 0xd9]),
    });
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /private Storage/);
    assert.equal(calls.updates.length, 0);
  });
});
