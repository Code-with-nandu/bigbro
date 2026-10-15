import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dashboard = await readFile(new URL('../src/components/SevakAttendancePage.tsx', import.meta.url), 'utf8');
const rolesMigration = await readFile(new URL('../supabase/migrations/20261010_sevak_management.sql', import.meta.url), 'utf8');
const registrationMigration = await readFile(new URL('../supabase/migrations/20261012_sevak_self_registration_approval.sql', import.meta.url), 'utf8');
const photoMigration = await readFile(new URL('../supabase/migrations/20261014_sevak_self_registration_profile_photos.sql', import.meta.url), 'utf8');

test('approval and rejection are trusted-admin-only and target only a still-pending profile', () => {
  const handler = dashboard.match(/const setProfileApproval = async[\s\S]*?\n  };/);
  assert.ok(handler, 'expected the existing dashboard approval handler');
  assert.match(handler[0], /if \(!isAdmin \|\| !session\) return/);
  assert.match(handler[0], /\.eq\('id', profile\.id\)[\s\S]*?\.eq\('approval_status', 'pending'\)/);
  assert.match(handler[0], /setSavingManagement\(true\)/);
  assert.match(handler[0], /setSavingManagement\(false\)/);
  assert.match(rolesMigration, /CREATE POLICY "Sevak administrators manage profiles"[\s\S]*?FOR ALL TO authenticated[\s\S]*?USING \(public\.has_sevak_admin_role\(\)\)[\s\S]*?WITH CHECK \(public\.has_sevak_admin_role\(\)\)/);
});

test('approval writes active state and audit fields; the database records trusted actor and time', () => {
  const handler = dashboard.match(/const setProfileApproval = async[\s\S]*?\n  };/)[0];
  assert.match(handler, /approval_status: 'approved', status: 'active', rejection_reason: null, approved_by: session\.user\.id, approved_at: new Date\(\)\.toISOString\(\)/);
  assert.match(photoMigration, /ELSIF NEW\.approval_status = 'approved' THEN[\s\S]*?NEW\.rejection_reason := NULL;[\s\S]*?NEW\.approved_by := acting_user;[\s\S]*?NEW\.approved_at := now\(\)/);
  assert.match(dashboard, /setMessage\(approvalStatus === 'approved' \? `\$\{profile\.name\} approved and activated\.`/);
  assert.match(handler, /setApprovalPage\(0\)[\s\S]*?refreshAll\(\)/);
});

test('rejection requires a nonblank reason and database policy enforces rejected inactive state', () => {
  const handler = dashboard.match(/const setProfileApproval = async[\s\S]*?\n  };/)[0];
  assert.match(handler, /const reason = rejectionReasonDraft\.trim\(\)/);
  assert.match(handler, /approvalStatus === 'rejected' && !reason/);
  assert.match(handler, /approval_status: 'rejected', status: 'inactive', rejection_reason: reason, approved_by: null, approved_at: null/);
  assert.match(photoMigration, /IF NEW\.approval_status = 'rejected' THEN[\s\S]*?NEW\.rejection_reason := NULLIF\(btrim\(NEW\.rejection_reason\), ''\)[\s\S]*?IF NEW\.rejection_reason IS NULL THEN[\s\S]*?RAISE EXCEPTION[\s\S]*?NEW\.status := 'inactive'/);
  assert.match(handler, /setMessage\(approvalStatus === 'approved'[\s\S]*?rejected\. The reason is available/);
});

test('database trigger prevents non-admin approval changes and RLS scopes admin writes', () => {
  assert.match(photoMigration, /trusted_admin BOOLEAN := COALESCE\(public\.has_sevak_admin_role\(\), false\)/);
  assert.match(photoMigration, /IF trusted_admin THEN[\s\S]*?RETURN NEW;[\s\S]*?NEW\.approval_status := 'pending';[\s\S]*?NEW\.status := 'inactive'/);
  assert.match(registrationMigration, /CREATE POLICY "Sevaks update their own profile for review"[\s\S]*?WITH CHECK \(auth_user_id = auth\.uid\(\) AND approval_status = 'pending'\)/);
  assert.match(rolesMigration, /CREATE POLICY "Sevak administrators manage profiles"[\s\S]*?USING \(public\.has_sevak_admin_role\(\)\)/);
});

test('approved active filtering excludes pending and rejected profiles from directory and attendance', () => {
  assert.match(dashboard, /if \(profile\.approval_status !== 'approved' \|\| profile\.status\.toLowerCase\(\) !== 'active'\) return false;/);
  assert.match(dashboard, /const directoryMatches = profiles\.filter/);
  assert.match(dashboard, /const activeAttendanceMatches = profiles\.filter/);
  assert.match(dashboard, /const attendanceSelectableProfiles = selectedProfile\?\.approval_status === 'approved'[\s\S]*?selectedProfile\.status\.toLowerCase\(\) === 'active'/);
  assert.match(dashboard, /profile\.approval_status === 'pending'\)\.length} pending/);
});

test('approval does not depend on a profile photo and the detail panel has a missing-photo fallback', () => {
  const handler = dashboard.match(/const setProfileApproval = async[\s\S]*?\n  };/)[0];
  assert.doesNotMatch(handler, /profile_picture|storage/);
  assert.match(dashboard, /Profile picture not available/);
  assert.match(dashboard, /Temporary sample image/);
  assert.match(dashboard, /Refresh photo/);
});
