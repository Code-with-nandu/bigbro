import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

// Temporary local portraits for the five test rows only. These do not update
// `profile_picture` or replace profile data stored in Supabase.
const SAMPLE_PROFILE_IMAGES: Record<string, string> = {
  'TEST-SEVAK-001': '/sample-sevak/rahul.jpg',
  'TEST-SEVAK-002': '/sample-sevak/amit.png',
  'TEST-SEVAK-003': '/sample-sevak/priya.jpg',
  'TEST-SEVAK-004': '/sample-sevak/suman.jpg',
  'TEST-SEVAK-005': '/sample-sevak/anil.png',
};

const sessions = [
  {
    type: 'MORNING_SADHANA',
    title: '🌅 Morning Sadhana',
    description: 'Record attendance for the morning sadhana session.',
    accent: 'from-orange-400/15 to-amber-400/5',
  },
  {
    type: 'SEVA',
    title: '🛠️ Seva — Department-wise',
    description: 'Department-wise attendance for seva activities.',
    accent: 'from-cyan-400/15 to-blue-400/5',
  },
  {
    type: 'SATSANG',
    title: '🎶 Night Satsang',
    description: 'Record attendance for satsang.',
    accent: 'from-violet-400/15 to-fuchsia-400/5',
  },
] as const;

type AttendanceType = typeof sessions[number]['type'];
const PROFILE_PAGE_SIZE = 500;
const PROFILE_COLUMNS = 'id, sevak_id, name, mobile, profile_picture, department, department_id, status, approval_status, rejection_reason';

async function loadAllSevakProfiles() {
  const firstPage = await supabase.from('sevak_profiles')
    .select(PROFILE_COLUMNS, { count: 'exact' })
    .order('sevak_id')
    .range(0, PROFILE_PAGE_SIZE - 1);
  if (firstPage.error) return { data: null, error: firstPage.error };
  const total = firstPage.count ?? firstPage.data.length;
  if (total <= PROFILE_PAGE_SIZE) return { data: firstPage.data, error: null };

  const remainingPages = await Promise.all(Array.from(
    { length: Math.ceil((total - PROFILE_PAGE_SIZE) / PROFILE_PAGE_SIZE) },
    (_, index) => {
      const start = (index + 1) * PROFILE_PAGE_SIZE;
      return supabase.from('sevak_profiles')
        .select(PROFILE_COLUMNS)
        .order('sevak_id')
        .range(start, start + PROFILE_PAGE_SIZE - 1);
    },
  ));
  const failedPage = remainingPages.find((page) => page.error);
  if (failedPage?.error) return { data: null, error: failedPage.error };
  return { data: [...firstPage.data, ...remainingPages.flatMap((page) => page.data ?? [])], error: null };
}

interface SevakProfile {
  id: string;
  sevak_id: string;
  name: string;
  mobile: string;
  profile_picture: string | null;
  department: string;
  department_id: string;
  status: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

interface SevakDepartment {
  id: string;
  name: string;
  is_active: boolean;
}

interface AttendanceRecord {
  id: string;
  sevak_id: string;
  attendance_date: string;
  attendance_type: AttendanceType;
  department: string | null;
  status: string;
  check_in_time: string | null;
  profiles?: { name: string; sevak_id: string } | null;
}

function todayInIndia() {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => values.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-2 break-words text-sm text-neutral-200">{value || '—'}</p>
    </div>
  );
}

function errorMessage(error: { message: string; code?: string }) {
  if (error.code === '23505') return 'Attendance is already recorded for this Sevak, date, session, and department.';
  if (error.code === 'PGRST204' || /column .* does not exist|schema cache/i.test(error.message)) return 'Apply the Sevak self-registration and approval migration, then retry.';
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message)) {
    return `Supabase denied this operation under Row Level Security: ${error.message}`;
  }
  return error.message;
}

export default function SevakAttendancePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profiles, setProfiles] = useState<SevakProfile[]>([]);
  const [departments, setDepartments] = useState<SevakDepartment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leaderDepartmentIds, setLeaderDepartmentIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryPage, setDirectoryPage] = useState(0);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendancePage, setAttendancePage] = useState(0);
  const [attendanceDate, setAttendanceDate] = useState(todayInIndia);
  const [reportMonth, setReportMonth] = useState(() => todayInIndia().slice(0, 7));
  const [attendanceStatus, setAttendanceStatus] = useState('PRESENT');
  const [manualAttendanceType, setManualAttendanceType] = useState<AttendanceType>('MORNING_SADHANA');
  const [sevaDepartment, setSevaDepartment] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newProfile, setNewProfile] = useState({ sevak_id: '', name: '', mobile: '', department_id: '', status: 'active' });
  const [approvalSearch, setApprovalSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [approvalPage, setApprovalPage] = useState(0);
  const [rejectingProfileId, setRejectingProfileId] = useState('');
  const [rejectionReasonDraft, setRejectionReasonDraft] = useState('');
  const [transferDepartmentId, setTransferDepartmentId] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoSource, setProfilePhotoSource] = useState<'camera' | 'file' | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraPhotoPreview, setCameraPhotoPreview] = useState('');
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraComponentMountedRef = useRef(false);
  const [savingManagement, setSavingManagement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingType, setSavingType] = useState<AttendanceType | null>(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageError, setProfileImageError] = useState('');
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [profileImageRetryKey, setProfileImageRetryKey] = useState(0);
  const profileImageIdentityRef = useRef('');
  const profileImageAutoRetriesRef = useRef(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId)
    ?? profiles.find((profile) => profile.approval_status === 'approved' && profile.status.toLowerCase() === 'active');
  const DIRECTORY_PAGE_SIZE = 25;
  const directoryMatches = profiles.filter((profile) => {
    if (profile.approval_status !== 'approved' || profile.status.toLowerCase() !== 'active') return false;
    const query = directorySearch.trim().toLowerCase();
    return !query || [profile.name, profile.mobile, profile.sevak_id, profile.department].some((value) => value.toLowerCase().includes(query));
  });
  const directoryProfiles = directoryMatches.slice(directoryPage * DIRECTORY_PAGE_SIZE, (directoryPage + 1) * DIRECTORY_PAGE_SIZE);
  const activeAttendanceMatches = profiles.filter((profile) => {
    if (profile.approval_status !== 'approved' || profile.status.toLowerCase() !== 'active') return false;
    const query = attendanceSearch.trim().toLowerCase();
    return !query || [profile.name, profile.mobile, profile.sevak_id].some((value) => value.toLowerCase().includes(query));
  });
  const attendanceProfiles = activeAttendanceMatches.slice(attendancePage * DIRECTORY_PAGE_SIZE, (attendancePage + 1) * DIRECTORY_PAGE_SIZE);
  const attendanceSelectableProfiles = selectedProfile?.approval_status === 'approved'
    && selectedProfile.status.toLowerCase() === 'active'
    && !attendanceProfiles.some((profile) => profile.id === selectedProfile.id)
    ? [selectedProfile, ...attendanceProfiles]
    : attendanceProfiles;
  const approvalMatches = profiles.filter((profile) => {
    const matchesStatus = approvalFilter === 'all' || profile.approval_status === approvalFilter;
    const query = approvalSearch.trim().toLowerCase();
    const matchesSearch = !query || [profile.name, profile.mobile, profile.department].some((value) => value.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });
  const filteredApprovalProfiles = approvalMatches.slice(approvalPage * DIRECTORY_PAGE_SIZE, (approvalPage + 1) * DIRECTORY_PAGE_SIZE);
  const selectedSampleImage = selectedProfile && !selectedProfile.profile_picture
    ? SAMPLE_PROFILE_IMAGES[selectedProfile.sevak_id]
    : undefined;

  const stopCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    cameraComponentMountedRef.current = true;
    return () => {
      cameraComponentMountedRef.current = false;
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!cameraOpen || !cameraVideoRef.current || !cameraStreamRef.current) return;
    cameraVideoRef.current.srcObject = cameraStreamRef.current;
    void cameraVideoRef.current.play().catch(() => {
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
      if (!cameraComponentMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      cameraStreamRef.current = stream;
      if (cameraPhotoPreview) setProfilePhoto(null);
      setCameraPhotoPreview('');
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
    const video = cameraVideoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
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
      setProfilePhoto(new File([blob], `sevak-photo-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      setProfilePhotoSource('camera');
      setCameraPhotoPreview(canvas.toDataURL('image/jpeg', 0.85));
      setCameraError('');
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  const cancelCamera = () => {
    stopCamera();
    if (cameraPhotoPreview) setProfilePhoto(null);
    setCameraPhotoPreview('');
    setCameraError('');
  };

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setAuthReady(true);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setAuthReady(true);
      if (error) setLoadError(error.message);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      setProfiles([]);
      setAttendance([]);
      setMonthlyAttendance([]);
      setLoading(false);
      setLoadError('Sign in with an authenticated Supabase account to load test Sevak data. Row Level Security blocks anonymous access.');
      return;
    }

    let active = true;
    setLoading(true);
    setLoadError('');
    Promise.all([
      supabase.rpc('has_sevak_admin_role'),
      supabase.from('sevak_role_assignments').select('department_id').eq('role', 'group_leader'),
      supabase.from('sevak_departments').select('id, name, is_active').order('name'),
      loadAllSevakProfiles(),
    ]).then(async ([adminResult, rolesResult, departmentResult, profileResult]) => {
      if (!active) return;
      if (adminResult.error) {
        setLoadError(`Unable to check trusted Sevak role. Apply the Sevak management migration first: ${adminResult.error.message}`);
        setProfiles([]);
        setLoading(false);
        return;
      }
      const admin = Boolean(adminResult.data);
      setIsAdmin(admin);
      const leaderIds = rolesResult.error ? [] : (rolesResult.data ?? []).map((row) => row.department_id).filter(Boolean) as string[];
      setLeaderDepartmentIds(leaderIds);
      if (rolesResult.error) {
        setLoadError(`Unable to load Group Leader scope: ${rolesResult.error.message}`);
        setProfiles([]);
        setLoading(false);
        return;
      }
      if (departmentResult.error) {
        setLoadError(errorMessage(departmentResult.error));
        setProfiles([]);
        setLoading(false);
        return;
      }
      const loadedDepartments = (departmentResult.data ?? []) as SevakDepartment[];
      setDepartments(loadedDepartments);
      setNewProfile((current) => ({ ...current, department_id: current.department_id || loadedDepartments.find((item) => item.is_active)?.id || '' }));
      if (profileResult.error) {
        setLoadError(errorMessage(profileResult.error));
        setProfiles([]);
        setAttendance([]);
        setMonthlyAttendance([]);
        setLoading(false);
        return;
      }
      const loadedProfiles = (profileResult.data ?? []) as SevakProfile[];
      setProfiles(loadedProfiles);
      setSelectedProfileId((current) => loadedProfiles.some((profile) => profile.id === current && profile.status.toLowerCase() === 'active' && profile.approval_status === 'approved')
        ? current
        : loadedProfiles.find((profile) => profile.status.toLowerCase() === 'active' && profile.approval_status === 'approved')?.id ?? '');
      setSevaDepartment((current) => current || loadedDepartments.find((item) => item.id === loadedProfiles[0]?.department_id)?.id || '');
      if (loadedProfiles.length === 0) {
        setAttendance([]);
        setMonthlyAttendance([]);
        setLoadError('No Sevak profiles are visible for this account under the current trusted roles and Row Level Security policies.');
        setLoading(false);
        return;
      }

      const [attendanceResult, monthlyResult] = await Promise.all([
        supabase
          .from('sevak_attendance')
          .select('id, sevak_id, attendance_date, attendance_type, department, status, check_in_time')
          .eq('attendance_date', attendanceDate)
          .order('attendance_type')
          .order('department'),
        supabase
          .from('sevak_attendance')
          .select('id, sevak_id, attendance_date, attendance_type, department, status, check_in_time')
          .gte('attendance_date', `${reportMonth}-01`)
          .lte('attendance_date', `${reportMonth}-${new Date(Number(reportMonth.slice(0, 4)), Number(reportMonth.slice(5, 7)), 0).getDate().toString().padStart(2, '0')}`),
      ]);
      if (!active) return;
      if (attendanceResult.error) {
        setAttendance([]);
        setLoadError(errorMessage(attendanceResult.error));
      } else {
        setAttendance((attendanceResult.data ?? []) as AttendanceRecord[]);
      }
      if (monthlyResult.error) {
        setMonthlyAttendance([]);
        setLoadError((current) => current || errorMessage(monthlyResult.error));
      } else {
        setMonthlyAttendance((monthlyResult.data ?? []) as AttendanceRecord[]);
      }
      setLoading(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setLoadError(error instanceof Error ? error.message : 'Unable to load Sevak data from Supabase.');
      setLoading(false);
    });

    return () => { active = false; };
  }, [authReady, session, attendanceDate, reportMonth, refreshKey]);

  useEffect(() => {
    let active = true;
    let refreshTimer: number | undefined;
    setProfileImageUrl('');
    setProfileImageError('');
    if (!selectedProfile?.profile_picture) {
      setProfileImageLoading(false);
      return;
    }
    if (selectedProfile.profile_picture.startsWith('/sample-sevak/')) {
      setProfileImageUrl(selectedProfile.profile_picture);
      setProfileImageLoading(false);
      return;
    }
    if (!session) {
      setProfileImageLoading(false);
      setProfileImageError('Sign in to view this private profile picture.');
      return;
    }
    const profileImageIdentity = `${selectedProfile.id}:${selectedProfile.profile_picture}`;
    if (profileImageIdentityRef.current !== profileImageIdentity) {
      profileImageIdentityRef.current = profileImageIdentity;
      profileImageAutoRetriesRef.current = 0;
    }
    setProfileImageLoading(true);
    supabase.storage.from('sevak-profiles').createSignedUrl(selectedProfile.profile_picture, 3600)
      .then(({ data, error }) => {
        if (!active) return;
        setProfileImageLoading(false);
        if (error) setProfileImageError(`Could not create a private photo link: ${error.message}`);
        else if (!data?.signedUrl) setProfileImageError('Could not create a private photo link: Supabase returned no signed URL.');
        else {
          setProfileImageError('');
          setProfileImageUrl(data.signedUrl);
          refreshTimer = window.setTimeout(() => setProfileImageRetryKey((key) => key + 1), 55 * 60 * 1000);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setProfileImageLoading(false);
        setProfileImageError(`Could not create a private photo link: ${error instanceof Error ? error.message : String(error)}`);
      });
    return () => {
      active = false;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [session, selectedProfile?.id, selectedProfile?.profile_picture, profileImageRetryKey]);

  const attendanceByType = useMemo(() => {
    return sessions.map((item) => ({
      ...item,
      records: attendance.filter((record) => record.attendance_type === item.type),
    }));
  }, [attendance]);

  const monthlySummary = useMemo(() => sessions.map((item) => ({
    ...item,
    count: monthlyAttendance.filter((record) => record.attendance_type === item.type).length,
    present: monthlyAttendance.filter((record) => record.attendance_type === item.type && record.status.toUpperCase() === 'PRESENT').length,
  })), [monthlyAttendance]);

  const refreshAttendance = useCallback(() => setRefreshKey((key) => key + 1), []);

  const refreshAll = () => setRefreshKey((key) => key + 1);

  const createProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !session) return;
    stopCamera();
    setSavingManagement(true);
    setActionError('');
    setMessage('');
    const { data, error } = await supabase.from('sevak_profiles').insert({
      sevak_id: newProfile.sevak_id.trim(),
      name: newProfile.name.trim(),
      mobile: newProfile.mobile.trim(),
      department_id: newProfile.department_id,
      status: newProfile.status,
      approval_status: 'approved',
      approved_by: session.user.id,
      approved_at: new Date().toISOString(),
    }).select('id, sevak_id').single();
    if (error) {
      setActionError(errorMessage(error));
      setSavingManagement(false);
      return;
    }
    setSelectedProfileId(data.id);
    setProfileImageUrl('');
    let savedProfilePicture: string | null = null;
    if (profilePhoto) {
      if (profilePhotoSource === 'camera') {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession?.access_token) throw new Error('Your Supabase session expired. Sign in again.');
          const photoEndpoint = new URL('/api/sevak-profile-photo', window.location.origin);
          const response = await fetch(photoEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${currentSession.access_token}`,
              'Content-Type': 'image/jpeg',
              'X-Sevak-Profile-Id': data.id,
            },
            body: profilePhoto,
          });
          const responseText = await response.text();
          let result: { profile_picture?: string; error?: string };
          try {
            result = JSON.parse(responseText) as { profile_picture?: string; error?: string };
          } catch {
            result = { error: `Photo endpoint returned HTTP ${response.status} with an unreadable response.` };
          }
          if (!response.ok || !result.profile_picture) throw new Error(result.error || `Photo save failed (${response.status}).`);
          savedProfilePicture = result.profile_picture;
        } catch (error) {
          setActionError(`Profile created, but the camera photo could not be saved: ${error instanceof Error ? error.message : String(error)}`);
          setSavingManagement(false);
          refreshAll();
          return;
        }
      } else {
      const extension = profilePhoto.type === 'image/png' ? 'png' : profilePhoto.type === 'image/webp' ? 'webp' : 'jpg';
      const objectPath = `${data.sevak_id}/profile.${extension}`;
      const upload = await supabase.storage.from('sevak-profiles').upload(objectPath, profilePhoto, {
        upsert: true,
        contentType: profilePhoto.type,
      });
      if (upload.error) {
        setActionError(`Profile created, but the private image upload failed: ${upload.error.message}`);
        setSavingManagement(false);
        refreshAll();
        return;
      }
      const pictureUpdate = await supabase.from('sevak_profiles').update({ profile_picture: objectPath }).eq('id', data.id).select('id, profile_picture').single();
      if (pictureUpdate.error) {
        setActionError(`Profile and image uploaded, but saving the Storage path failed: ${pictureUpdate.error.message}`);
        setSavingManagement(false);
        refreshAll();
        return;
      }
      savedProfilePicture = pictureUpdate.data.profile_picture;
      }
    }
    const createdProfile: SevakProfile = {
      id: data.id,
      sevak_id: data.sevak_id,
      name: newProfile.name.trim(),
      mobile: newProfile.mobile.trim(),
      profile_picture: savedProfilePicture,
      department: departments.find((item) => item.id === newProfile.department_id)?.name ?? '',
      department_id: newProfile.department_id,
      status: newProfile.status,
      approval_status: 'approved',
      rejection_reason: null,
    };
    setProfiles((current) => [...current.filter((profile) => profile.id !== createdProfile.id), createdProfile]
      .sort((left, right) => left.sevak_id.localeCompare(right.sevak_id)));
    setSelectedProfileId(createdProfile.id);
    if (savedProfilePicture?.startsWith('/sample-sevak/')) setProfileImageUrl(savedProfilePicture);
    setMessage(`Sevak profile ${data.sevak_id} created.`);
    setNewProfile({ sevak_id: '', name: '', mobile: '', department_id: departments.find((item) => item.is_active)?.id ?? '', status: 'active' });
    setProfilePhoto(null);
    setProfilePhotoSource(null);
    setCameraPhotoPreview('');
    setSavingManagement(false);
    refreshAll();
  };

  const setProfileApproval = async (profile: SevakProfile, approvalStatus: 'approved' | 'rejected') => {
    if (!isAdmin || !session) return;
    const reason = rejectionReasonDraft.trim();
    if (approvalStatus === 'rejected' && !reason) {
      setActionError('Enter a rejection reason so the Sevak can correct and resubmit the profile.');
      return;
    }
    setSavingManagement(true);
    setActionError('');
    setMessage('');
    const changes = approvalStatus === 'approved'
      ? { approval_status: 'approved', status: 'active', rejection_reason: null, approved_by: session.user.id, approved_at: new Date().toISOString() }
      : { approval_status: 'rejected', status: 'inactive', rejection_reason: reason, approved_by: null, approved_at: null };
    const { data, error } = await supabase.from('sevak_profiles').update(changes).eq('id', profile.id).select('id').maybeSingle();
    setSavingManagement(false);
    if (error || !data) {
      setActionError(error ? errorMessage(error) : 'The profile was not updated. Confirm your trusted administrator role and retry.');
      return;
    }
    setMessage(approvalStatus === 'approved' ? `${profile.name} approved and activated.` : `${profile.name} rejected. The reason is available to the profile owner.`);
    setRejectingProfileId('');
    setRejectionReasonDraft('');
    refreshAll();
  };

  const createDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !session) return;
    setSavingManagement(true);
    setActionError('');
    const { error } = await supabase.from('sevak_departments').insert({ name: newDepartmentName.trim(), is_active: true });
    setSavingManagement(false);
    if (error) setActionError(errorMessage(error));
    else {
      setMessage(`Department “${newDepartmentName.trim()}” added.`);
      setNewDepartmentName('');
      refreshAll();
    }
  };

  const updateDepartment = async (department: SevakDepartment, changes: Partial<Pick<SevakDepartment, 'name' | 'is_active'>>) => {
    if (!isAdmin || !session) return;
    setSavingManagement(true);
    setActionError('');
    const { error } = await supabase.from('sevak_departments').update(changes).eq('id', department.id);
    setSavingManagement(false);
    if (error) setActionError(errorMessage(error));
    else {
      setMessage(`Department ${changes.name ? 'renamed' : (changes.is_active ? 'activated' : 'deactivated')}. Historical Seva department values remain unchanged.`);
      refreshAll();
    }
  };

  const transferSelectedProfile = async () => {
    if (!isAdmin || !session || !selectedProfile || !transferDepartmentId || transferDepartmentId === selectedProfile.department_id) return;
    const nextDepartment = departments.find((department) => department.id === transferDepartmentId);
    if (!nextDepartment) return;
    const confirmed = window.confirm(`Transfer ${selectedProfile.name} from ${selectedProfile.department} to ${nextDepartment.name}? Past Seva attendance will keep its recorded department.`);
    if (!confirmed) return;
    setSavingManagement(true);
    setActionError('');
    const { error } = await supabase.from('sevak_profiles').update({ department_id: nextDepartment.id }).eq('id', selectedProfile.id);
    setSavingManagement(false);
    if (error) setActionError(errorMessage(error));
    else {
      setMessage(`${selectedProfile.name} transferred to ${nextDepartment.name}. Historical Seva records were preserved.`);
      setTransferDepartmentId('');
      refreshAll();
    }
  };

  const saveAttendance = async (type: AttendanceType) => {
    if (!session) {
      setActionError('Sign in with an authenticated Supabase account before saving attendance.');
      return;
    }
    const attendanceProfile = profiles.find((profile) => profile.id === selectedProfileId && profile.status.toLowerCase() === 'active' && profile.approval_status === 'approved');
    if (!attendanceProfile) {
      setActionError('Select an active Sevak profile before saving attendance.');
      return;
    }
    if (type === 'SEVA' && !sevaDepartment.trim()) {
      setActionError('Choose a department for Seva attendance.');
      return;
    }
    const selectedSevaDepartment = departments.find((department) => department.id === sevaDepartment);
    if (type === 'SEVA' && !selectedSevaDepartment) {
      setActionError('Choose an active department loaded from Supabase.');
      return;
    }

    setSavingType(type);
    setMessage('');
    setActionError('');
    const { error } = await supabase.from('sevak_attendance').insert({
      sevak_id: attendanceProfile.id,
      attendance_date: attendanceDate,
      attendance_type: type,
      department: type === 'SEVA' ? selectedSevaDepartment?.name : null,
      status: attendanceStatus,
    });
    setSavingType(null);
    if (error) {
      setActionError(errorMessage(error));
      return;
    }
    setMessage(`${type.replaceAll('_', ' ')} attendance saved for ${attendanceProfile.name}.`);
    refreshAttendance();
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Sevak Attendance System</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Sevak Attendance</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400 sm:text-base">
          Profile details and attendance sections for the three daily sessions.
        </p>
        {session && !loading && <p className="mt-3 text-xs text-neutral-500">{isAdmin ? 'Trusted role: Administrator' : leaderDepartmentIds.length ? `Trusted role: Group Leader (${leaderDepartmentIds.length} department scope${leaderDepartmentIds.length === 1 ? '' : 's'})` : 'No Sevak management role assigned to this account.'}</p>}
      </header>

      {loadError && <p role="alert" className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{loadError}</p>}
      {message && <p role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
      {actionError && <p role="alert" className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{actionError}</p>}

      {isAdmin && (
        <section aria-labelledby="sevak-approval-heading" className="mb-5 rounded-2xl border border-amber-300/20 bg-[#0d0e14] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Trusted administrator review</p>
              <h2 id="sevak-approval-heading" className="mt-2 text-lg font-semibold">Sevak profile approvals</h2>
              <p className="mt-1 text-xs text-neutral-500">Select a profile to inspect its photo and details in the panel below.</p>
            </div>
            <span className="text-xs text-amber-200">{profiles.filter((profile) => profile.approval_status === 'pending').length} pending</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input value={approvalSearch} onChange={(event) => { setApprovalSearch(event.target.value); setApprovalPage(0); }} placeholder="Search name, mobile, or department" aria-label="Search Sevak profiles" className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
            <select value={approvalFilter} onChange={(event) => { setApprovalFilter(event.target.value as typeof approvalFilter); setApprovalPage(0); }} aria-label="Filter Sevak profiles by approval status" className="rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
              <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All statuses</option>
            </select>
          </div>
          <div className="mt-3 space-y-2">
            {filteredApprovalProfiles.map((profile) => (
              <div key={profile.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={() => { setSelectedProfileId(profile.id); setTransferDepartmentId(''); setActionError(''); }} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-semibold text-white">{profile.name} <span className="font-normal text-neutral-500">· {profile.sevak_id}</span></span>
                    <span className="mt-1 block text-xs text-neutral-400">{profile.mobile} · {profile.department}</span>
                  </button>
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${profile.approval_status === 'approved' ? 'bg-emerald-400/10 text-emerald-200' : profile.approval_status === 'rejected' ? 'bg-rose-400/10 text-rose-200' : 'bg-amber-300/10 text-amber-200'}`}>{profile.approval_status}</span>
                  {profile.approval_status === 'pending' && <div className="flex gap-2">
                    <button type="button" disabled={savingManagement} onClick={() => void setProfileApproval(profile, 'approved')} className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50">Approve</button>
                    <button type="button" disabled={savingManagement} onClick={() => { setRejectingProfileId(rejectingProfileId === profile.id ? '' : profile.id); setRejectionReasonDraft(''); }} className="rounded-lg border border-rose-300/30 px-3 py-2 text-xs font-semibold text-rose-100 disabled:opacity-50">Reject</button>
                  </div>}
                </div>
                {profile.approval_status === 'rejected' && <p className="mt-2 text-xs text-rose-200">Reason: {profile.rejection_reason}</p>}
                {rejectingProfileId === profile.id && <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <textarea required maxLength={1000} value={rejectionReasonDraft} onChange={(event) => setRejectionReasonDraft(event.target.value)} placeholder="Explain what needs correction" className="min-h-20 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
                  <button type="button" disabled={savingManagement || !rejectionReasonDraft.trim()} onClick={() => void setProfileApproval(profile, 'rejected')} className="self-end rounded-lg bg-rose-300 px-3 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50">Confirm rejection</button>
                </div>}
              </div>
            ))}
            {filteredApprovalProfiles.length === 0 && <p className="rounded-lg border border-white/10 p-3 text-sm text-neutral-500">No profiles match this search and approval filter.</p>}
          </div>
          {approvalMatches.length > DIRECTORY_PAGE_SIZE && <div className="mt-3 flex items-center justify-end gap-2 text-xs text-neutral-400">
            <button type="button" disabled={approvalPage === 0} onClick={() => setApprovalPage((page) => page - 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Previous</button>
            <span>Page {approvalPage + 1} of {Math.ceil(approvalMatches.length / DIRECTORY_PAGE_SIZE)}</span>
            <button type="button" disabled={(approvalPage + 1) * DIRECTORY_PAGE_SIZE >= approvalMatches.length} onClick={() => setApprovalPage((page) => page + 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Next</button>
          </div>}
        </section>
      )}

      <section aria-labelledby="profile-heading" className="rounded-2xl border border-white/10 bg-[#0d0e14] p-5 shadow-xl shadow-black/20 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="profile-heading" className="text-lg font-semibold text-white">Sevak Profile</h2>
          <span className="text-xs text-neutral-500">{loading ? 'Loading profiles…' : `${directoryMatches.length} approved Sevak profiles`}</span>
        </div>
        <input value={directorySearch} onChange={(event) => { setDirectorySearch(event.target.value); setDirectoryPage(0); }} placeholder="Search approved profiles by name, mobile, ID, or department" aria-label="Search approved Sevak profiles" className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
        {directoryProfiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Approved active Sevak profiles">
            {directoryProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => { setSelectedProfileId(profile.id); setTransferDepartmentId(''); setActionError(''); }}
                aria-pressed={selectedProfile?.id === profile.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${selectedProfile?.id === profile.id ? 'border-amber-300/50 bg-amber-300/10 text-amber-100' : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/25'}`}
              >
                {profile.id === selectedProfile?.id && profileImageUrl ? (
                  <img src={profileImageUrl} alt={`${profile.name} private Supabase profile`} className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover" />
                ) : !profile.profile_picture && SAMPLE_PROFILE_IMAGES[profile.sevak_id] ? (
                  <img src={SAMPLE_PROFILE_IMAGES[profile.sevak_id]} alt={`${profile.name} temporary sample portrait`} className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover" />
                ) : null}
                <span>
                  <span className="block font-semibold">{profile.name}</span>
                  <span className="mt-1 block text-neutral-500">{profile.sevak_id}</span>
                  {!profile.profile_picture && SAMPLE_PROFILE_IMAGES[profile.sevak_id] && <span className="mt-1 block text-[10px] text-amber-300/80">Temporary sample image</span>}
                </span>
              </button>
            ))}
          </div>
        )}
        {directoryMatches.length > DIRECTORY_PAGE_SIZE && <div className="mt-3 flex items-center justify-end gap-2 text-xs text-neutral-400">
          <button type="button" disabled={directoryPage === 0} onClick={() => setDirectoryPage((page) => page - 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {directoryPage + 1} of {Math.ceil(directoryMatches.length / DIRECTORY_PAGE_SIZE)}</span>
          <button type="button" disabled={(directoryPage + 1) * DIRECTORY_PAGE_SIZE >= directoryMatches.length} onClick={() => setDirectoryPage((page) => page + 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Next</button>
        </div>}
        {isAdmin && (
          <details onToggle={(event) => { if (!event.currentTarget.open) cancelCamera(); }} className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-amber-200">Add Sevak profile</summary>
            <form onSubmit={(event) => void createProfile(event)} className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-neutral-400">Unique Sevak ID<input required value={newProfile.sevak_id} onChange={(event) => setNewProfile({ ...newProfile, sevak_id: event.target.value })} className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-neutral-400">Name<input required value={newProfile.name} onChange={(event) => setNewProfile({ ...newProfile, name: event.target.value })} className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-neutral-400">Mobile number<input required type="tel" value={newProfile.mobile} onChange={(event) => setNewProfile({ ...newProfile, mobile: event.target.value })} className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-neutral-400">Department<select required value={newProfile.department_id} onChange={(event) => setNewProfile({ ...newProfile, department_id: event.target.value })} className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white"><option value="">Choose department</option>{departments.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="text-xs text-neutral-400">Status<select value={newProfile.status} onChange={(event) => setNewProfile({ ...newProfile, status: event.target.value })} className="mt-1 block w-full rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <div className="text-xs text-neutral-400 sm:col-span-2">
                <label htmlFor="sevak-profile-photo" className="block">Profile photo</label>
                <p className="mt-1 text-[11px] text-neutral-500">Camera captures are saved with this app; selected files remain in private Supabase Storage.</p>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input id="sevak-profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { stopCamera(); setCameraPhotoPreview(''); setProfilePhoto(event.target.files?.[0] ?? null); setProfilePhotoSource(event.target.files?.[0] ? 'file' : null); }} className="min-w-0 flex-1 text-xs text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white" />
                  <button type="button" onClick={() => void openCamera()} disabled={cameraOpen} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50">Take Photo</button>
                </div>
                {profilePhoto && <p className="mt-1 text-[11px] text-neutral-500">Selected: {profilePhoto.name}</p>}
                {cameraError && <p role="alert" className="mt-2 rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-xs text-rose-200">{cameraError}</p>}
                {(cameraOpen || cameraPhotoPreview) && <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 sm:max-w-xl">
                  {cameraOpen ? <video ref={cameraVideoRef} autoPlay muted playsInline aria-label="Live camera preview" className="aspect-video w-full rounded-lg bg-black object-cover" /> : <img src={cameraPhotoPreview} alt="Captured Sevak profile photo preview" className="aspect-video w-full rounded-lg bg-black object-contain sm:max-h-80" />}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cameraOpen && <button type="button" onClick={capturePhoto} className="rounded-lg bg-amber-300 px-3 py-2 text-xs font-semibold text-neutral-950">Capture Photo</button>}
                    {cameraPhotoPreview && <button type="button" onClick={() => void openCamera()} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5">Retake</button>}
                    <button type="button" onClick={cancelCamera} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5">Cancel Camera</button>
                  </div>
                </div>}
              </div>
              <button disabled={savingManagement || !departments.some((item) => item.is_active)} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-50 sm:col-span-2">{savingManagement ? 'Saving…' : 'Create profile'}</button>
            </form>
          </details>
        )}
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          {profileImageUrl ? (
            <div className="shrink-0">
              <img src={profileImageUrl} alt={`${selectedProfile?.name ?? 'Sevak'} Supabase profile`} onError={() => {
                setProfileImageUrl('');
                setProfileImageLoading(false);
                if (profileImageAutoRetriesRef.current < 1) {
                  profileImageAutoRetriesRef.current += 1;
                  setProfileImageError('Private photo link failed; refreshing it…');
                  setProfileImageRetryKey((key) => key + 1);
                } else {
                  setProfileImageError('Profile picture not available: the saved Storage object could not be loaded. Check the saved path and private bucket access.');
                }
              }} className="h-24 w-24 rounded-2xl border border-white/10 object-cover" />
              <p className="mt-1 text-center text-[10px] text-emerald-300">Supabase profile picture</p>
            </div>
          ) : selectedProfile?.profile_picture ? (
            <div role={profileImageError ? 'alert' : undefined} className="flex min-h-24 w-40 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-3 py-2 text-center text-xs text-neutral-400">
              {profileImageLoading ? 'Loading private profile picture…' : profileImageError || 'Loading private profile picture…'}
              {!profileImageLoading && <button type="button" onClick={() => { profileImageAutoRetriesRef.current = 0; setProfileImageRetryKey((key) => key + 1); }} className="mt-2 rounded-md border border-white/15 px-2 py-1 text-[10px] text-white hover:bg-white/5">Refresh photo</button>}
            </div>
          ) : selectedSampleImage ? (
            <div className="shrink-0">
              <img src={selectedSampleImage} alt={`${selectedProfile?.name ?? 'Sevak'} temporary sample portrait`} className="h-24 w-24 rounded-2xl border border-amber-300/20 object-cover" />
              <p className="mt-1 text-center text-[10px] text-amber-300">Temporary sample image</p>
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-2 text-center text-xs text-neutral-500">
              Profile picture not available
            </div>
          )}
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <ProfileField label="Sevak Name" value={selectedProfile?.name ?? (loading ? 'Loading…' : '')} />
            <ProfileField label="Mobile Number" value={selectedProfile?.mobile ?? (loading ? 'Loading…' : '')} />
            <ProfileField label="Department" value={selectedProfile?.department ?? (loading ? 'Loading…' : '')} />
            <ProfileField label="Status" value={selectedProfile?.status ?? (loading ? 'Loading…' : '')} />
          </div>
        </div>
        {isAdmin && selectedProfile && (
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <label className="text-xs text-neutral-400">Transfer department
              <select value={transferDepartmentId || selectedProfile.department_id} onChange={(event) => setTransferDepartmentId(event.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
                {departments.filter((item) => item.is_active || item.id === selectedProfile.department_id).map((item) => <option key={item.id} value={item.id}>{item.name}{item.is_active ? '' : ' (inactive)'}</option>)}
              </select>
            </label>
            <button type="button" disabled={savingManagement || !(transferDepartmentId || selectedProfile.department_id) || (transferDepartmentId || selectedProfile.department_id) === selectedProfile.department_id} onClick={() => void transferSelectedProfile()} className="rounded-lg border border-amber-300/30 px-3 py-2 text-xs font-semibold text-amber-100 disabled:opacity-40">Confirm department transfer</button>
          </div>
        )}
      </section>

      {isAdmin && (
        <section aria-labelledby="department-management-heading" className="mt-5 rounded-2xl border border-white/10 bg-[#0d0e14] p-5 sm:p-7">
          <h2 id="department-management-heading" className="text-lg font-semibold text-white">Departments</h2>
          <form onSubmit={(event) => void createDepartment(event)} className="mt-4 flex flex-wrap gap-2">
            <input required value={newDepartmentName} onChange={(event) => setNewDepartmentName(event.target.value)} placeholder="New department name" className="min-w-56 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
            <button disabled={savingManagement} className="rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50">Add department</button>
          </form>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {departments.map((department) => (
              <div key={department.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input aria-label={`Department name ${department.name}`} value={department.name} onChange={(event) => setDepartments((current) => current.map((item) => item.id === department.id ? { ...item, name: event.target.value } : item))} className="min-w-32 flex-1 bg-transparent text-sm text-neutral-200 outline-none" />
                <span className={`text-[10px] uppercase ${department.is_active ? 'text-emerald-300' : 'text-neutral-500'}`}>{department.is_active ? 'Active' : 'Inactive'}</span>
                <button type="button" disabled={savingManagement} onClick={() => void updateDepartment(department, { name: department.name.trim() })} className="rounded border border-white/10 px-2 py-1 text-[10px] text-neutral-300 disabled:opacity-40">Rename</button>
                <button type="button" disabled={savingManagement} onClick={() => void updateDepartment(department, { is_active: !department.is_active })} className="rounded border border-white/10 px-2 py-1 text-[10px] text-neutral-300 disabled:opacity-40">{department.is_active ? 'Deactivate' : 'Activate'}</button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="attendance-heading" className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Manual entry</p>
            <h2 id="attendance-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white">Manual Attendance</h2>
          </div>
          <label className="text-xs text-neutral-400">
            Attendance date
            <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="ml-2 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white" />
          </label>
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <label className="text-xs text-neutral-400">Search name/mobile/ID
            <input value={attendanceSearch} onChange={(event) => { setAttendanceSearch(event.target.value); setAttendancePage(0); }} placeholder="Search approved active Sevaks" className="mt-1 block w-56 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white placeholder:text-neutral-600" />
          </label>
          <label className="text-xs text-neutral-400">Active Sevak
            <select required value={selectedProfileId} onChange={(event) => setSelectedProfileId(event.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
              <option value="">Choose a Sevak</option>
              {attendanceSelectableProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} - {profile.sevak_id}</option>)}
            </select>
          </label>
          {activeAttendanceMatches.length > DIRECTORY_PAGE_SIZE && <div className="flex items-center gap-2 text-xs text-neutral-400">
            <button type="button" disabled={attendancePage === 0} onClick={() => setAttendancePage((page) => page - 1)} className="rounded border border-white/10 px-2 py-2 disabled:opacity-40">Previous</button>
            <span>{attendancePage + 1}/{Math.ceil(activeAttendanceMatches.length / DIRECTORY_PAGE_SIZE)}</span>
            <button type="button" disabled={(attendancePage + 1) * DIRECTORY_PAGE_SIZE >= activeAttendanceMatches.length} onClick={() => setAttendancePage((page) => page + 1)} className="rounded border border-white/10 px-2 py-2 disabled:opacity-40">Next</button>
          </div>}
          <label className="text-xs text-neutral-400">Attendance type
            <select value={manualAttendanceType} onChange={(event) => setManualAttendanceType(event.target.value as AttendanceType)} className="mt-1 block rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
              <option value="MORNING_SADHANA">Morning Sadhana</option><option value="SEVA">Seva</option><option value="SATSANG">Satsang</option>
            </select>
          </label>
          <label className="text-xs text-neutral-400">
            Status
            <select value={attendanceStatus} onChange={(event) => setAttendanceStatus(event.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </label>
          {manualAttendanceType === 'SEVA' && <label className="text-xs text-neutral-400">
            Seva department
            <select value={sevaDepartment} onChange={(event) => setSevaDepartment(event.target.value)} className="mt-1 block rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white">
              <option value="">Choose department</option>
              {departments.filter((department) => department.is_active && (isAdmin || leaderDepartmentIds.includes(department.id))).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
          </label>}
          <button type="button" onClick={() => void saveAttendance(manualAttendanceType)} disabled={loading || !session || !selectedProfileId || savingType !== null || (manualAttendanceType === 'SEVA' && !sevaDepartment)} className="rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-neutral-950 disabled:opacity-50">{savingType ? 'Saving...' : 'Save attendance'}</button>
          <p className="pb-2 text-xs text-neutral-500">Records are read and written through your current Supabase session and database RLS.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {attendanceByType.map((item) => (
            <article key={item.type} className={`min-h-48 rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} p-5`}>
              <h3 className="text-lg font-semibold leading-7 text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{item.description}</p>
              <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs font-semibold text-neutral-300">{loading ? 'Loading saved attendance…' : `Saved for ${attendanceDate} (${item.records.length})`}</p>
                {item.records.length === 0 && !loading ? <p className="text-xs text-neutral-500">No saved records for this date.</p> : item.records.map((record) => {
                  const recordProfile = profiles.find((profile) => profile.id === record.sevak_id);
                  return (
                    <div key={record.id} className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-xs">
                      <p className="font-medium text-neutral-200">{recordProfile?.name ?? record.sevak_id}</p>
                      <p className="mt-1 text-neutral-400">{record.attendance_date} · {record.attendance_type.replaceAll('_', ' ')}{record.department ? ` · ${record.department}` : ''}</p>
                      <p className="mt-1 text-amber-200">{record.status} · Check-in: {record.check_in_time ? new Date(record.check_in_time).toLocaleString() : '—'}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d0e14] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Monthly report</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Attendance summary</h3>
            </div>
            <label className="text-xs text-neutral-400">Report month
              <input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} className="ml-2 rounded-lg border border-white/10 bg-[#0d0e14] px-3 py-2 text-sm text-white" />
            </label>
          </div>
          <p className="mt-2 text-xs text-neutral-500">Summary uses only records visible to your trusted role under Row Level Security.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {monthlySummary.map((item) => (
              <div key={item.type} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-sm font-medium text-neutral-200">{item.title}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{loading ? '…' : item.count}</p>
                <p className="mt-1 text-xs text-neutral-500">records · {item.present} marked present</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
