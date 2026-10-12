import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface SevakDepartment {
  id: string;
  name: string;
  is_active: boolean;
}

interface OwnedSevakProfile {
  id: string;
  sevak_id: string;
  name: string;
  mobile: string;
  department: string;
  department_id: string;
  profile_picture: string | null;
  status: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

const inputClass = 'mt-1 block w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none focus:border-amber-400/60';
const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
const PROFILE_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function normalizeMobile(value: string) {
  return value.trim().replace(/[\s().-]/g, '');
}

async function removeOwnProfilePhoto(path: string) {
  try {
    const { error } = await supabase.storage.from('sevak-profiles').remove([path]);
    if (error) logSupabaseError('profile photo cleanup', error);
    return Boolean(error);
  } catch (error) {
    if (error instanceof Error) logSupabaseError('profile photo cleanup', error);
    return true;
  }
}

function logSupabaseError(stage: string, error: {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}) {
  if (import.meta.env.DEV) {
    // Keep diagnostics useful without logging Auth sessions, profile values, or
    // the full Supabase error object (which may contain row details).
    console.error(`[Sevak Registration] ${stage}`, {
      code: error.code ?? 'NO_ERROR_CODE',
      message: error.message,
      details: error.details ?? null,
      hint: error.hint ?? null,
    });
  }
}

function friendlyProfileError(message: string, code?: string) {
  if (code === '23505' && /auth_user_id_uidx/i.test(message)) return 'This signed-in account is already linked to a Sevak profile. Open My Profile or contact an administrator if it is not yours.';
  if (code === '23505') return 'A duplicate profile value already exists. If you already submitted a profile, open My Profile; otherwise contact an administrator.';
  if (code === '23502') return 'A required profile field was not accepted by the database. Check your name and department, then retry; if this continues, contact an administrator.';
  if (code === '23503') return 'The selected department is no longer available. Reload the page and choose an active department.';
  if (code === '23514' || code === '22023') return 'The database rejected one of the profile values. Check your name, mobile number, and active department, then retry.';
  if (code === '42501' || /row-level security|permission denied/i.test(message)) return 'Supabase did not allow this profile change. Confirm the self-registration migration is applied and try again.';
  if (code === 'PGRST202' || code === 'PGRST204' || /could not find the function|column .* does not exist|schema cache/i.test(message)) return 'The self-registration database migration is not applied yet. Ask an administrator to apply the new migration.';
  return 'The profile could not be saved. Check the required fields and try again.';
}

interface SevakSelfRegistrationPageProps {
  page: 'create-profile' | 'my-profile';
}

export default function SevakSelfRegistrationPage({ page }: SevakSelfRegistrationPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [departments, setDepartments] = useState<SevakDepartment[]>([]);
  const [profile, setProfile] = useState<OwnedSevakProfile | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '', department_id: '' });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [savedPhotoUrl, setSavedPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [removeSavedPhoto, setRemoveSavedPhoto] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const cameraStream = useRef<MediaStream | null>(null);
  const cameraVideo = useRef<HTMLVideoElement>(null);
  const cameraMounted = useRef(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoRefreshAttempted = useRef(false);

  const stopCamera = () => {
    cameraStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = null;
    setCameraOpen(false);
  };

  useEffect(() => {
    cameraMounted.current = true;
    return () => {
      cameraMounted.current = false;
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      cameraStream.current = null;
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraVideo.current || !cameraStream.current) return;
    cameraVideo.current.srcObject = cameraStream.current;
    void cameraVideo.current.play().catch(() => {
      setCameraError('Camera preview could not start. Check browser camera permissions and try again.');
    });
  }, [cameraOpen]);

  const openCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is unavailable in this browser or page context. Use HTTPS or choose an existing photo.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (!cameraMounted.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraStream.current = stream;
      setCameraOpen(true);
    } catch (error) {
      const cameraException = error as DOMException;
      if (cameraException.name === 'NotAllowedError' || cameraException.name === 'SecurityError') {
        setCameraError('Camera access was denied. Allow camera access in your browser settings, or choose an existing photo.');
      } else if (cameraException.name === 'NotFoundError' || cameraException.name === 'DevicesNotFoundError') {
        setCameraError('No camera is available on this device. Choose an existing photo instead.');
      } else {
        setCameraError(`Unable to open the camera${cameraException.message ? `: ${cameraException.message}` : '. Choose an existing photo instead.'}`);
      }
    }
  };

  const capturePhoto = () => {
    const video = cameraVideo.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera preview is not ready yet. Wait a moment and try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Unable to capture the camera image. Please try again or choose an existing photo.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Unable to create a JPEG from the camera image. Please try again.');
        return;
      }
      if (!blob.size || blob.size > MAX_PROFILE_PHOTO_BYTES) {
        setCameraError('The captured image is larger than 2 MB. Try again or choose a smaller photo.');
        return;
      }
      setSelectedPhoto(new File([blob], `sevak-photo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      setRemoveSavedPhoto(false);
      setCameraError('');
      stopCamera();
    }, 'image/jpeg', 0.85);
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobileDuplicateNotice, setMobileDuplicateNotice] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreviewUrl('');
      return;
    }
    const preview = URL.createObjectURL(selectedPhoto);
    setPhotoPreviewUrl(preview);
    return () => URL.revokeObjectURL(preview);
  }, [selectedPhoto]);

  useEffect(() => {
    let active = true;
    setSavedPhotoUrl('');
    setPhotoError('');
    photoRefreshAttempted.current = false;
    const photoPath = profile?.profile_picture;
    if (!photoPath || !session) return;
    void supabase.storage.from('sevak-profiles').createSignedUrl(photoPath, 3600).then(({ data, error }) => {
      if (!active) return;
      if (error || !data?.signedUrl) {
        setPhotoError('Your saved profile photo could not be loaded. You can still submit profile details.');
        return;
      }
      setSavedPhotoUrl(data.signedUrl);
    });
    return () => { active = false; };
  }, [profile?.profile_picture, session]);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setAuthReady(true);
      }
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setAuthReady(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      setLoading(false);
      setProfile(null);
      return;
    }
    let active = true;
    setLoading(true);
    setErrorMessage('');
    void Promise.all([
      supabase.from('sevak_departments').select('id, name, is_active').eq('is_active', true).order('name'),
      supabase.rpc('get_my_sevak_profile'),
    ]).then(([departmentResult, profileResult]) => {
      if (!active) return;
      if (departmentResult.error || profileResult.error) {
        const err = departmentResult.error ?? profileResult.error!;
        setErrorMessage(friendlyProfileError(err.message, err.code));
        setLoading(false);
        return;
      }
      const loadedDepartments = (departmentResult.data ?? []) as SevakDepartment[];
      const ownedProfile = ((profileResult.data as OwnedSevakProfile[] | null) ?? [])[0] ?? null;
      setDepartments(loadedDepartments);
      setProfile(ownedProfile);
      if (page === 'my-profile' && !ownedProfile) {
        window.location.replace('/sevak/create-profile');
        return;
      }
      if (page === 'create-profile' && ownedProfile && ownedProfile.approval_status !== 'rejected') {
        window.location.replace('/sevak/my-profile');
        return;
      }
      if (ownedProfile) {
        setForm({
          name: ownedProfile.name,
          mobile: ownedProfile.mobile,
          department_id: ownedProfile.department_id,
        });
      } else {
        setForm((current) => ({ ...current, department_id: current.department_id || loadedDepartments[0]?.id || '' }));
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setErrorMessage('Could not load registration data. Check your connection and retry.');
      setLoading(false);
    });
    return () => { active = false; };
  }, [authReady, session, retryKey, page]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;
    const mobile = normalizeMobile(form.mobile);
    if (!/^\+?[1-9][0-9]{6,14}$/.test(mobile)) {
      setErrorMessage('Enter a valid mobile number with 7 to 15 digits, optionally starting with + and a country code.');
      return;
    }
    if (!departments.some((department) => department.id === form.department_id)) {
      setErrorMessage('Choose an active department from the list.');
      return;
    }
    if (selectedPhoto && (!PROFILE_PHOTO_TYPES[selectedPhoto.type] || selectedPhoto.size > MAX_PROFILE_PHOTO_BYTES || selectedPhoto.size === 0)) {
      setErrorMessage('Choose a JPEG, PNG, or WebP image no larger than 2 MB.');
      return;
    }

    let mobileQuery = supabase.from('sevak_profiles').select('id', { count: 'exact', head: true }).eq('mobile', mobile);
    if (profile) mobileQuery = mobileQuery.neq('id', profile.id);
    const { count: matchingMobiles, error: mobileCheckError } = await mobileQuery;
    setMobileDuplicateNotice(mobileCheckError
      ? 'A duplicate mobile check was unavailable. Shared numbers are permitted, so you may continue.'
      : (matchingMobiles ?? 0) > 0
      ? 'Another visible profile uses this mobile number. Shared numbers are allowed; confirm this is correct.'
      : '');

    setSaving(true);
    setErrorMessage('');
    const fields = {
      name: form.name.trim(),
      mobile,
      status: 'inactive',
    };
    const operation = profile ? 'profile update' : 'profile insert';
    const result = profile
      ? await supabase.from('sevak_profiles').update(fields).eq('id', profile.id)
        .select('id, sevak_id, name, mobile, department, department_id, profile_picture, status, approval_status, rejection_reason').single()
      : await supabase.from('sevak_profiles').insert({ ...fields, department_id: form.department_id })
        .select('id, sevak_id, name, mobile, department, department_id, profile_picture, status, approval_status, rejection_reason').single();
    if (result.error) {
      logSupabaseError(operation, result.error);
      setSaving(false);
      setErrorMessage(friendlyProfileError(result.error.message, result.error.code));
      return;
    }
    const savedProfile = result.data as OwnedSevakProfile;
    let nextPhotoPath = savedProfile.profile_picture;
    let photoWarning = '';
    if (selectedPhoto) {
      const extension = PROFILE_PHOTO_TYPES[selectedPhoto.type];
      const photoPath = `${savedProfile.sevak_id}/profile-${crypto.randomUUID()}.${extension}`;
      try {
        const upload = await supabase.storage.from('sevak-profiles').upload(photoPath, selectedPhoto, {
          cacheControl: '3600',
          contentType: selectedPhoto.type,
          upsert: false,
        });
        if (upload.error) {
          logSupabaseError('profile photo upload', upload.error);
          photoWarning = 'Your profile was submitted, but the optional photo upload failed. You can continue without a photo and retry with an administrator later.';
        } else {
          const photoUpdate = await supabase.from('sevak_profiles').update({ profile_picture: photoPath })
            .eq('id', savedProfile.id).select('profile_picture').single();
          if (photoUpdate.error) {
            logSupabaseError('profile photo path update', photoUpdate.error);
            const cleanupError = await removeOwnProfilePhoto(photoPath);
            photoWarning = `Your profile was submitted, but the optional photo could not be attached.${cleanupError ? ' The temporary upload could not be removed; contact an administrator.' : ''}`;
          } else {
            nextPhotoPath = photoUpdate.data.profile_picture;
            if (savedProfile.profile_picture && savedProfile.profile_picture !== nextPhotoPath) {
              const cleanupError = await removeOwnProfilePhoto(savedProfile.profile_picture);
              if (cleanupError) photoWarning = 'Your new photo was saved, but the previous private photo could not be removed.';
            }
          }
        }
      } catch (error) {
        const cleanupError = await removeOwnProfilePhoto(photoPath);
        photoWarning = `Your profile was submitted, but the photo could not be saved: ${error instanceof Error ? error.message : 'Storage request failed.'}${cleanupError ? ' A partial upload may remain in private Storage; contact an administrator if it appears later.' : ''}`;
      }
    } else if (removeSavedPhoto && savedProfile.profile_picture) {
      const oldPhotoPath = savedProfile.profile_picture;
      const photoUpdate = await supabase.from('sevak_profiles').update({ profile_picture: null })
        .eq('id', savedProfile.id).select('profile_picture').single();
      if (photoUpdate.error) {
        logSupabaseError('profile photo removal update', photoUpdate.error);
        photoWarning = 'Your profile was submitted, but the saved photo could not be unlinked.';
      } else {
        nextPhotoPath = null;
        if (await removeOwnProfilePhoto(oldPhotoPath)) photoWarning = 'Your profile photo was unlinked, but its private Storage file could not be removed.';
      }
    }
    setSaving(false);
    setProfile({ ...savedProfile, profile_picture: nextPhotoPath });
    if (photoWarning) {
      setErrorMessage(photoWarning);
      return;
    }
    window.location.assign('/sevak/my-profile');
  };

  const handlePhotoSelected = (file?: File) => {
    stopCamera();
    setCameraError('');
    setPhotoError('');
    setErrorMessage('');
    if (!file) return;
    if (!PROFILE_PHOTO_TYPES[file.type]) {
      setSelectedPhoto(null);
      setPhotoError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size === 0 || file.size > MAX_PROFILE_PHOTO_BYTES) {
      setSelectedPhoto(null);
      setPhotoError('The image must be no larger than 2 MB.');
      return;
    }
    setSelectedPhoto(file);
    setRemoveSavedPhoto(false);
  };

  const refreshSavedPhoto = async () => {
    if (!profile?.profile_picture || photoRefreshAttempted.current) {
      setPhotoError('The saved profile photo is unavailable.');
      return;
    }
    photoRefreshAttempted.current = true;
    const { data, error } = await supabase.storage.from('sevak-profiles').createSignedUrl(profile.profile_picture, 3600);
    if (error || !data?.signedUrl) {
      setSavedPhotoUrl('');
      setPhotoError('The profile photo link expired and could not be refreshed.');
      return;
    }
    setSavedPhotoUrl(data.signedUrl);
  };

  const authNext = encodeURIComponent(page === 'my-profile' ? '/sevak/my-profile' : '/sevak/create-profile');

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] px-4 pb-16 pt-10 font-sans text-white selection:bg-amber-500/30 selection:text-amber-200 sm:px-8 sm:pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.09),transparent_48%)]" />
      <div className="relative mx-auto max-w-3xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <a href="/sevak/register" className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">BigBro · Sevak Portal</a>
          <nav className="flex gap-4 text-xs text-neutral-400">
            <a href="/sevak/create-profile" className="transition hover:text-white">Create profile</a>
            <a href="/sevak/my-profile" className="transition hover:text-white">My profile</a>
          </nav>
        </header>
        <section className="rounded-2xl border border-white/10 bg-[#0d0e14]/95 p-5 shadow-xl shadow-black/20 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">{page === 'my-profile' ? 'My Sevak Profile' : 'Profile Application'}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{page === 'my-profile' ? 'Profile status' : 'Create my Sevak profile'}</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">{page === 'my-profile' ? 'Review your submitted profile and its administrator approval status.' : 'Submit your details for review. Only an authorized Sevak administrator can approve a profile.'}</p>

        {!authReady || loading ? <p role="status" className="mt-6 text-sm text-neutral-300">Loading your registration…</p> : !session ? (
          <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
            <p className="text-sm text-neutral-200">Sign in or create a BigBro account to register. Your profile will be linked to that signed-in account.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-neutral-950" href={`/signup?next=${authNext}`}>Create account</a>
              <a className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white" href={`/login?next=${authNext}`}>Sign in</a>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-6">
            <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{errorMessage}</p>
            <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-3 rounded-lg border border-white/15 px-3 py-2 text-xs text-white">Retry</button>
          </div>
        ) : page === 'my-profile' && profile ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6" role="status">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${profile.approval_status === 'approved' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-200' : profile.approval_status === 'rejected' ? 'border-rose-300/25 bg-rose-300/10 text-rose-200' : 'border-amber-300/25 bg-amber-300/10 text-amber-200'}`}>
              {profile.approval_status === 'approved' ? 'Approved' : profile.approval_status === 'rejected' ? 'Rejected' : 'Pending'}
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-neutral-500">Name</dt><dd className="mt-1 text-white">{profile.name}</dd></div>
              <div><dt className="text-neutral-500">Sevak ID</dt><dd className="mt-1 text-white">{profile.sevak_id}</dd></div>
              <div><dt className="text-neutral-500">Mobile</dt><dd className="mt-1 text-white">{profile.mobile}</dd></div>
              <div><dt className="text-neutral-500">Department</dt><dd className="mt-1 text-white">{profile.department}</dd></div>
            </dl>
            <div className="mt-5">
              {savedPhotoUrl ? <img src={savedPhotoUrl} alt={`${profile.name}'s profile`} onError={() => void refreshSavedPhoto()} className="h-28 w-28 rounded-xl border border-white/10 object-cover" /> : profile.profile_picture ? <p className="text-xs text-amber-200">Loading saved profile photo…</p> : <p className="text-xs text-neutral-500">No profile photo has been added.</p>}
              {photoError && <p role="status" className="mt-2 text-xs text-amber-200">{photoError}</p>}
            </div>
            {profile.approval_status === 'pending' && <p className="mt-5 text-sm leading-6 text-neutral-300">Your profile is awaiting review by an authorized Sevak administrator.</p>}
            {profile.approval_status === 'approved' && <p className="mt-5 text-sm leading-6 text-neutral-300">Your profile is approved. Attendance and management access still follows the project&apos;s existing role policies.</p>}
            {profile.approval_status === 'rejected' && <div className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/5 p-4">
              <p className="text-sm font-semibold text-rose-200">Admin feedback</p>
              <p className="mt-2 text-sm text-neutral-300">{profile.rejection_reason || 'Please contact an administrator for details.'}</p>
              <a href="/sevak/create-profile" className="mt-4 inline-flex rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-neutral-950">Correct and resubmit</a>
            </div>}
          </div>
        ) : page === 'create-profile' && profile && profile.approval_status !== 'rejected' ? (
          <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4" role="status">
            <h2 className="font-semibold text-amber-200">You already have a profile</h2>
            <p className="mt-2 text-sm text-neutral-300">Open My Profile to review its current status.</p>
            <a href="/sevak/my-profile" className="mt-4 inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white">View My Profile</a>
          </div>
        ) : (
          <>
            {profile?.approval_status === 'rejected' && <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4">
              <h2 className="font-semibold text-rose-200">Profile needs correction</h2>
              <p className="mt-2 text-sm text-rose-100">Admin reason: {profile.rejection_reason || 'No reason was provided. Contact an administrator.'}</p>
              <p className="mt-2 text-xs text-neutral-300">Correct the details below to resubmit for approval.</p>
            </div>}
            <form onSubmit={(event) => void saveProfile(event)} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-neutral-300 sm:col-span-2">Full name
                <input required maxLength={120} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} />
              </label>
              <label className="text-sm text-neutral-300">Mobile number
                <input required type="tel" autoComplete="tel" maxLength={24} placeholder="+91 98765 43210" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} className={inputClass} />
                <span className="mt-1 block text-xs text-neutral-500">Shared household numbers are allowed; the duplicate warning only covers profiles visible under your existing RLS scope.</span>
              </label>
              {mobileDuplicateNotice && <p role="status" className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs text-amber-100 sm:col-span-2">{mobileDuplicateNotice}</p>}
              <label className="text-sm text-neutral-300 sm:col-span-2">{profile ? 'Department (contact an administrator to change it)' : 'Department'}
                <select required disabled={Boolean(profile)} value={form.department_id} onChange={(event) => setForm({ ...form, department_id: event.target.value })} className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <option value="">Choose an active department</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </label>
              <div className="sm:col-span-2">
                <span className="text-sm text-neutral-300">Profile photo (optional)</span>
                <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { handlePhotoSelected(event.target.files?.[0]); event.currentTarget.value = ''; }} className="sr-only" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" disabled={saving || cameraOpen} onClick={() => photoInput.current?.click()} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-50">{selectedPhoto || profile?.profile_picture ? 'Choose a different photo' : 'Choose photo'}</button>
                  <button type="button" disabled={saving || cameraOpen} onClick={() => void openCamera()} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-50">Take Photo</button>
                </div>
                <p className="mt-1 text-xs text-neutral-500">JPEG, PNG, or WebP; maximum 2 MB. Photos remain private.</p>
                {cameraError && <p role="status" className="mt-2 text-xs text-amber-200">{cameraError}</p>}
                {cameraOpen && <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 sm:max-w-xl"><video ref={cameraVideo} autoPlay muted playsInline aria-label="Live camera preview" className="aspect-video w-full rounded-lg bg-black object-cover" /><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={capturePhoto} className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-semibold text-neutral-950">Capture Photo</button><button type="button" onClick={stopCamera} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white">Close Camera</button></div></div>}
                {photoPreviewUrl && <div className="mt-3 flex flex-wrap items-center gap-3"><img src={photoPreviewUrl} alt="Selected profile preview" className="h-24 w-24 rounded-xl border border-white/10 object-cover" /><button type="button" disabled={saving} onClick={() => void openCamera()} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white disabled:opacity-50">Retake</button><button type="button" disabled={saving} onClick={() => photoInput.current?.click()} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white disabled:opacity-50">Replace photo</button><button type="button" disabled={saving} onClick={() => setSelectedPhoto(null)} className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-200 disabled:opacity-50">Remove selected photo</button></div>}
                {!photoPreviewUrl && profile?.profile_picture && !removeSavedPhoto && <div className="mt-3 flex flex-wrap items-center gap-3">{savedPhotoUrl ? <img src={savedPhotoUrl} alt="Current saved profile" onError={() => void refreshSavedPhoto()} className="h-24 w-24 rounded-xl border border-white/10 object-cover" /> : <p className="text-xs text-amber-200">{photoError || 'Saved photo preview unavailable.'}</p>}<button type="button" onClick={() => { setSelectedPhoto(null); setRemoveSavedPhoto(true); }} className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-200">Remove saved photo</button></div>}
                {!photoPreviewUrl && savedPhotoUrl && removeSavedPhoto && <div className="mt-3 flex items-center gap-3"><p className="text-xs text-neutral-400">The saved photo will be removed when you submit.</p><button type="button" onClick={() => setRemoveSavedPhoto(false)} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white">Undo</button></div>}
                {photoError && <p role="status" className="mt-2 text-xs text-amber-200">{photoError}</p>}
              </div>
              {errorMessage && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200 sm:col-span-2">{errorMessage}</p>}
              <button type="submit" disabled={saving || departments.length === 0} className="rounded-lg bg-amber-300 px-4 py-3 text-sm font-semibold text-neutral-950 disabled:opacity-50 sm:col-span-2">
                {saving ? 'Submitting…' : profile?.approval_status === 'rejected' ? 'Correct and resubmit' : 'Submit for Admin approval'}
              </button>
              {departments.length === 0 && <p className="text-xs text-rose-200 sm:col-span-2">No active departments are available. Contact an administrator.</p>}
            </form>
          </>
        )}
        </section>
        <a href="/sevak/register" className="mt-6 block text-center text-xs text-neutral-500 transition hover:text-white">Back to Sevak Portal</a>
      </div>
    </main>
  );
}
