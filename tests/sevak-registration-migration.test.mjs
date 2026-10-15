import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migration = await readFile(new URL('../supabase/migrations/20261016_sevak_self_registration_id_default.sql', import.meta.url), 'utf8');
const registrationMigration = await readFile(new URL('../supabase/migrations/20261012_sevak_self_registration_approval.sql', import.meta.url), 'utf8');
const registrationPage = await readFile(new URL('../src/components/SevakSelfRegistrationPage.tsx', import.meta.url), 'utf8');
const adminPage = await readFile(new URL('../src/components/SevakAttendancePage.tsx', import.meta.url), 'utf8');

test('self-registration IDs have a database default and a BEFORE INSERT guard', () => {
  assert.match(migration, /ALTER COLUMN sevak_id SET DEFAULT\s*\('SELF-' \|\| upper\(replace\(gen_random_uuid\(\)::TEXT, '-', ''\)\)\)/);
  assert.match(migration, /NEW\.sevak_id := 'SELF-' \|\| upper\(replace\(gen_random_uuid\(\)::TEXT, '-', ''\)\)/);
  assert.match(migration, /BEFORE INSERT ON public\.sevak_profiles/);
});

test('migration preserves existing profile values and administrator-supplied IDs', () => {
  assert.doesNotMatch(migration, /\bUPDATE\s+public\.sevak_profiles\b/i);
  assert.match(migration, /NOT COALESCE\(public\.has_sevak_admin_role\(\), false\)/);
  assert.match(adminPage, /sevak_id: newProfile\.sevak_id\.trim\(\)/);
});

test('ID and profile guards run in alphabetical BEFORE INSERT trigger order', () => {
  const idTrigger = migration.match(/CREATE TRIGGER (assign_self_sevak_id_trigger)\s+BEFORE INSERT ON public\.sevak_profiles/);
  const profileTrigger = registrationMigration.match(/CREATE TRIGGER (prepare_sevak_self_registration_trigger)\s+BEFORE INSERT OR UPDATE ON public\.sevak_profiles/);
  assert.ok(idTrigger, 'expected the ID guard trigger');
  assert.ok(profileTrigger, 'expected the profile validation trigger');
  assert.ok(idTrigger[1] < profileTrigger[1], 'the ID guard must run before profile validation');
});

test('self-registration leaves ID generation to the database', () => {
  assert.match(registrationPage, /\.insert\(\{ \.\.\.fields, department_id: form\.department_id, auth_user_id: session\.user\.id \}\)/);
  assert.doesNotMatch(registrationPage, /\.insert\(\{[^}]*sevak_id\s*:/s);
});

test('new profile submissions explicitly bind ownership to the current authenticated user', () => {
  assert.match(registrationPage, /\.insert\(\{ \.\.\.fields, department_id: form\.department_id, auth_user_id: session\.user\.id \}\)/);
  assert.match(registrationMigration, /NEW\.auth_user_id := acting_user/);
  assert.match(registrationMigration, /auth_user_id = auth\.uid\(\)/);
});

test('My Profile loads the owner RPC result and shows a create link when none exists', () => {
  assert.match(registrationPage, /supabase\.rpc\('get_my_sevak_profile'\)/);
  assert.doesNotMatch(registrationPage, /page === 'my-profile' && !ownedProfile[\s\S]{0,100}location\.replace/);
  assert.match(registrationPage, /page === 'my-profile' \?\s*\([\s\S]*?No Sevak profile found for this account[\s\S]*?href="\/sevak\/create-profile"/);
  assert.match(registrationMigration, /WHERE profile\.auth_user_id = auth\.uid\(\)/);
});

test('profile states remain visible and optional photo failure is a separate success notice', () => {
  assert.match(registrationPage, /profile\.approval_status === 'pending'[^]*awaiting review/);
  assert.match(registrationPage, /profile\.approval_status === 'approved'[^]*profile is approved/);
  assert.match(registrationPage, /profile\.approval_status === 'rejected'[^]*Admin feedback/);
  assert.match(registrationPage, /setPhotoNotice\(photoWarning\)/);
  assert.match(registrationPage, /Your profile was saved successfully\./);
  assert.doesNotMatch(registrationPage, /setErrorMessage\(photoWarning\)/);
});
