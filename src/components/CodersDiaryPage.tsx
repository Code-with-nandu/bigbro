import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  Code2,
  ExternalLink,
  Globe2,
  Home,
  Image,
  Link as LinkIcon,
  List,
  MessageCircle,
  Play,
  Search,
  Send,
  Share2,
  Star,
  Tag,
  Terminal,
  ThumbsUp,
  TriangleAlert,
  UserRound,
  Video,
  X
} from 'lucide-react';

interface DiaryEntry {
  id: number;
  date: string;
  heading: string;
  description: string;
  videoLink: string;
  image: string;
  code: string;
  error: string;
  solution: string;
  learning: string;
  importantNote: string;
  tags: string[];
}

interface EntryForm {
  heading: string;
  description: string;
  videoLink: string;
  image: string;
  code: string;
  error: string;
  solution: string;
  learning: string;
  importantNote: string;
  tags: string;
}

const emptyForm: EntryForm = {
  heading: '',
  description: '',
  videoLink: '',
  image: '',
  code: '',
  error: '',
  solution: '',
  learning: '',
  importantNote: '',
  tags: ''
};

const sampleEntry: DiaryEntry = {
  id: 1,
  date: '2026-10-04T09:00:00.000Z',
  heading: '🐳 Docker Run Process in Ubuntu',
  description: 'Step-by-step process of checking Docker, pulling an image, creating a container, running it, checking the running container, and accessing the application from Ubuntu WSL.',
  videoLink: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
  image: '',
  code: 'docker --version\ndocker pull nginx\ndocker run -d --name my-first-container -p 8080:80 nginx\ndocker ps\ndocker logs my-first-container',
  error: 'Got permission denied while trying to connect to the Docker daemon socket.',
  solution: 'sudo usermod -aG docker $USER\nnewgrp docker\ndocker ps',
  learning: 'How to run and manage a Docker container from Ubuntu WSL2.',
  importantNote: 'Always check Docker permissions and container status when troubleshooting Docker.',
  tags: ['Docker', 'Ubuntu', 'WSL2', 'Linux', 'Nginx', 'DevOps']
};

const docLinks = [
  { label: 'PHP', href: 'https://www.php.net/docs.php' },
  { label: 'CodeIgniter', href: 'https://codeigniter.com/user_guide/' },
  { label: 'React', href: 'https://react.dev/' },
  { label: 'Docker', href: 'https://docs.docker.com/' },
  { label: 'Git', href: 'https://git-scm.com/doc' }
];

const popularTechnologies = ['PHP', 'CodeIgniter', 'React', 'Docker', 'Git', 'Supabase', 'AI'];
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

export default function CodersDiaryPage() {
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [entries, setEntries] = useState<DiaryEntry[]>([sampleEntry]);
  const [search, setSearch] = useState('');
  const [likedEntries, setLikedEntries] = useState<number[]>([]);
  const [comments, setComments] = useState<Record<number, string[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [shareStatus, setShareStatus] = useState<Record<number, string>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');
  const [imageInputKey, setImageInputKey] = useState(0);
  const [entryDetailsOpen, setEntryDetailsOpen] = useState(false);
  const headingRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLTextAreaElement>(null);
  const solutionRef = useRef<HTMLTextAreaElement>(null);

  const setField = (field: keyof EntryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setField('image', reader.result);
      else setImageError('Unable to read this image file.');
    };
    reader.onerror = () => setImageError('Unable to read this image file.');
    reader.readAsDataURL(file);
  };

  const addEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const videoLink = form.videoLink.trim();

    if (videoLink) {
      try {
        const parsedLink = new URL(videoLink);
        if (parsedLink.protocol !== 'http:' && parsedLink.protocol !== 'https:') {
          setFormError('Use a valid http or https video URL.');
          return;
        }
      } catch {
        setFormError('Use a valid http or https video URL.');
        return;
      }
    }

    const entry: DiaryEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      heading: form.heading.trim(),
      description: form.description.trim(),
      videoLink,
      image: form.image,
      code: form.code.trim(),
      error: form.error.trim(),
      solution: form.solution.trim(),
      learning: form.learning.trim(),
      importantNote: form.importantNote.trim(),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    };

    setEntries((current) => [entry, ...current]);
    setForm(emptyForm);
    setImageInputKey((key) => key + 1);
  };

  const filteredEntries = entries.filter((entry) => {
    const query = search.trim().toLowerCase();
    return [
      entry.heading,
      entry.description,
      entry.tags.join(' '),
      entry.error,
      entry.solution,
      entry.learning
    ].some((value) => value.toLowerCase().includes(query));
  });

  const toggleLike = (entryId: number) => {
    setLikedEntries((current) => current.includes(entryId)
      ? current.filter((id) => id !== entryId)
      : [...current, entryId]);
  };

  const addComment = (event: FormEvent<HTMLFormElement>, entryId: number) => {
    event.preventDefault();
    const comment = commentDrafts[entryId]?.trim();
    if (!comment) return;
    setComments((current) => ({ ...current, [entryId]: [...(current[entryId] ?? []), comment] }));
    setCommentDrafts((current) => ({ ...current, [entryId]: '' }));
  };

  const shareEntry = async (entry: DiaryEntry) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${entry.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.heading, text: entry.description, url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus((current) => ({ ...current, [entry.id]: 'Link copied' }));
    } catch {
      setShareStatus((current) => ({ ...current, [entry.id]: 'Copy this page link to share' }));
    }
  };

  const focusField = (field: HTMLInputElement | HTMLTextAreaElement | null) => {
    field?.focus();
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const openDetailsAndFocus = (field: HTMLInputElement | HTMLTextAreaElement | null) => {
    setEntryDetailsOpen(true);
    if (detailsRef.current) detailsRef.current.open = true;
    window.setTimeout(() => focusField(field), 0);
  };

  const quickActions = [
    { label: 'Photo / Screenshot', icon: <Image className="h-4 w-4 text-emerald-600" />, action: () => openDetailsAndFocus(imageRef.current) },
    { label: 'Video', icon: <Video className="h-4 w-4 text-rose-600" />, action: () => openDetailsAndFocus(videoRef.current) },
    { label: 'Code', icon: <Code2 className="h-4 w-4 text-violet-600" />, action: () => openDetailsAndFocus(codeRef.current) },
    { label: 'Error → Solution', icon: <TriangleAlert className="h-4 w-4 text-amber-600" />, action: () => openDetailsAndFocus(errorRef.current) },
    { label: 'Tags', icon: <Tag className="h-4 w-4 text-blue-600" />, action: () => openDetailsAndFocus(tagsRef.current) }
  ];

  return (
    <main className="min-h-screen bg-[#f0f2f5] pb-12 pt-28 text-slate-800 sm:pt-32">
      <div className="mx-auto max-w-[1440px] px-3 sm:px-5">
        <header className="relative z-10 mb-5 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <a href="/coders-diary" className="flex shrink-0 items-center gap-2 text-sm font-extrabold text-slate-800 sm:text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xl">🧑‍💻</span>
              <span className="hidden sm:inline">Coder&apos;s Diary</span>
              <span className="sm:hidden">Diary</span>
            </a>

            <label className="flex min-w-0 max-w-xl flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-2.5 text-slate-500 sm:px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Diary"
                aria-label="Search Diary"
                className="w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
              />
            </label>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" aria-label="Notifications" onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                <Bell className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Messages" onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                <MessageCircle className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">K</button>
            </div>
          </div>
          {(showNotifications || showMessages) && (
            <div className="absolute right-3 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl sm:right-5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                {showNotifications ? 'Notifications' : 'Messages'}
                <button type="button" onClick={() => { setShowNotifications(false); setShowMessages(false); }} aria-label="Close panel" className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-slate-500">{showNotifications ? 'You’re all caught up.' : 'Your messages will appear here.'}</p>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,650px)_280px] xl:justify-center">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-2">
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <Avatar />
                <div><p className="font-bold text-slate-800">Krishnendu</p><p className="text-xs text-slate-500">Developer profile</p></div>
              </div>
              <nav aria-label="Diary sections" className="space-y-1">
                <SidebarItem icon={<CalendarDays />} label="Coder's Diary" active />
                <SidebarItem icon={<UserRound />} label="My Profile" />
                <SidebarItem icon={<Home />} label="Home" />
                <SidebarItem icon={<List />} label="Daily Entries" />
                <SidebarItem icon={<Terminal />} label="Commands" />
                <SidebarItem icon={<BookOpen />} label="What I Learned" />
                <SidebarItem icon={<TriangleAlert />} label="Error → Solution" />
                <SidebarItem icon={<Image />} label="Images" />
                <SidebarItem icon={<Play />} label="Videos" />
                <SidebarItem icon={<LinkIcon />} label="Documentation" />
                <SidebarItem icon={<Star />} label="Important Notes" />
                <SidebarItem icon={<Tag />} label="Technologies" />
              </nav>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 px-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">🧑‍💻 Coder&apos;s Diary</h1>
              <p className="mt-1.5 text-sm text-slate-600 sm:text-base">My daily coding journey, problems, solutions, projects and learning.</p>
            </div>

            <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Create Diary Post</h2>
              <div className="flex items-center gap-3">
                <Avatar />
                <input ref={headingRef} required value={form.heading} onChange={(event) => setField('heading', event.target.value)} placeholder="What&apos;s happening in your coding journey?" className="min-h-11 min-w-0 flex-1 rounded-full bg-slate-100 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="my-4 border-t border-slate-100" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {quickActions.map((action) => (
                  <button key={action.label} type="button" onClick={action.action} className="flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:text-sm">
                    {action.icon}<span>{action.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={addEntry} className="mt-3 border-t border-slate-100 pt-3">
                <details
                  ref={detailsRef}
                  open={entryDetailsOpen}
                  onToggle={(event) => setEntryDetailsOpen(event.currentTarget.open)}
                  className="mb-3"
                >
                  <summary className="cursor-pointer list-none text-center text-xs font-semibold text-blue-700 hover:text-blue-800">
                    Add description, media, code and other details
                  </summary>
                  <div className="mt-4 space-y-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-bold text-slate-600">Small Description</span>
                      <textarea ref={descriptionRef} value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Write a short description..." rows={3} className={`${inputClass} resize-y`} />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Video Link</span>
                    <input ref={videoRef} type="url" value={form.videoLink} onChange={(event) => setField('videoLink', event.target.value)} placeholder="Paste video URL..." className={inputClass} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Project / Technology Tags</span>
                    <input ref={tagsRef} value={form.tags} onChange={(event) => setField('tags', event.target.value)} placeholder="PHP, React, Docker..." className={inputClass} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Image / Screenshot</span>
                    <input key={imageInputKey} ref={imageRef} type="file" accept="image/*" onChange={handleImageChange} className={`${inputClass} file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-blue-700`} />
                    {imageError && <span role="alert" className="block text-xs text-rose-600">{imageError}</span>}
                    {form.image && <img src={form.image} alt="Diary upload preview" className="mt-2 max-h-40 rounded-lg object-cover" />}
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Commands / Code</span>
                    <textarea ref={codeRef} value={form.code} onChange={(event) => setField('code', event.target.value)} placeholder="Enter commands or a code snippet..." rows={4} className={`${inputClass} resize-y font-mono`} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Error</span>
                    <textarea ref={errorRef} value={form.error} onChange={(event) => setField('error', event.target.value)} placeholder="What error did you face?" rows={3} className={`${inputClass} resize-y`} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Solution</span>
                    <textarea ref={solutionRef} value={form.solution} onChange={(event) => setField('solution', event.target.value)} placeholder="How did you solve it?" rows={3} className={`${inputClass} resize-y`} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">What I Learned</span>
                    <textarea value={form.learning} onChange={(event) => setField('learning', event.target.value)} placeholder="What did you learn?" rows={3} className={`${inputClass} resize-y`} />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-600">Important Note</span>
                    <textarea value={form.importantNote} onChange={(event) => setField('importantNote', event.target.value)} placeholder="Important note..." rows={3} className={`${inputClass} resize-y`} />
                  </label>
                    </div>
                  </div>
                </details>
                {formError && <p role="alert" className="mb-3 text-sm text-rose-600">{formError}</p>}
                <button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Post</button>
              </form>
            </section>

            <section aria-label="Recent diary moments" className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">Recent moments</h2>
                <span className="text-xs font-medium text-blue-700">Your learning snapshots</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                <button type="button" onClick={() => openDetailsAndFocus(imageRef.current)} className="flex h-36 min-w-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-3 text-center text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:min-w-28">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xl text-white">+</span>
                  Add moment
                </button>
                {[
                  { title: 'Docker setup', icon: <Terminal className="h-6 w-6" />, style: 'from-sky-500 to-blue-700' },
                  { title: 'Today’s lesson', icon: <BookOpen className="h-6 w-6" />, style: 'from-violet-500 to-fuchsia-600' },
                  { title: 'Code snippets', icon: <Code2 className="h-6 w-6" />, style: 'from-emerald-500 to-teal-700' }
                ].map((moment) => (
                  <div key={moment.title} className={`flex h-36 min-w-24 flex-col justify-between rounded-xl bg-gradient-to-br ${moment.style} p-3 text-white shadow-sm sm:min-w-28`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white/20">{moment.icon}</span>
                    <span className="text-xs font-bold">{moment.title}</span>
                  </div>
                ))}
              </div>
            </section>

            <div id="coding-journey" className="mb-4 flex items-center justify-between px-1">
              <h2 className="text-xl font-extrabold text-slate-800">Your Coding Journey</h2>
              <span className="text-xs font-medium text-slate-500">{filteredEntries.length} {filteredEntries.length === 1 ? 'post' : 'posts'}</span>
            </div>

            {filteredEntries.length ? (
              <div className="space-y-5">
                {filteredEntries.map((entry) => {
                  const liked = likedEntries.includes(entry.id);
                  const postComments = comments[entry.id] ?? [];
                  return (
                    <article id={`post-${entry.id}`} key={entry.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between p-4 sm:px-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar />
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-800">Krishnendu</h3>
                            <p className="flex items-center gap-1.5 text-xs text-slate-500">
                              <time dateTime={entry.date}>{new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(entry.date))}</time>
                              <span>·</span><Globe2 className="h-3 w-3" aria-label="Public" />
                            </p>
                          </div>
                        </div>
                        <button type="button" aria-label="More post options" className="rounded-full px-3 py-1 text-lg text-slate-500 hover:bg-slate-100">···</button>
                      </div>

                      <div className="px-4 pb-4 sm:px-5">
                        <h3 className="text-xl font-extrabold leading-snug text-slate-900">{entry.heading}</h3>
                        {entry.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{entry.description}</p>}

                        {entry.image && <img src={entry.image} alt={`Screenshot for ${entry.heading}`} className="mt-4 max-h-[480px] w-full rounded-xl border border-slate-100 object-cover" />}
                        {entry.code && <FeedBlock icon={<Code2 className="h-4 w-4" />} title="Commands" color="emerald"><pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6"><code>{entry.code}</code></pre></FeedBlock>}
                        {entry.error && <FeedBlock icon={<TriangleAlert className="h-4 w-4" />} title="Error" color="rose"><p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.error}</p></FeedBlock>}
                        {entry.solution && <FeedBlock icon={<Check className="h-4 w-4" />} title="Solution" color="emerald"><p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{entry.solution}</p></FeedBlock>}
                        {entry.learning && <FeedBlock icon={<BookOpen className="h-4 w-4" />} title="What I Learned" color="violet"><p className="text-sm leading-relaxed">{entry.learning}</p></FeedBlock>}
                        {entry.importantNote && <FeedBlock icon={<Star className="h-4 w-4" />} title="Important Note" color="amber"><p className="text-sm leading-relaxed">{entry.importantNote}</p></FeedBlock>}

                        {entry.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{entry.tags.map((tag, index) => <span key={`${tag}-${index}`} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">🏷️ {tag}</span>)}</div>}
                        {entry.videoLink && <a href={entry.videoLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"><Video className="h-4 w-4" />🎥 Watch Video</a>}
                      </div>

                      <div className="mx-4 border-t border-slate-100 sm:mx-5" />
                      <div className="grid grid-cols-3 gap-1 px-3 py-2">
                        <button type="button" aria-pressed={liked} onClick={() => toggleLike(entry.id)} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition hover:bg-slate-100 ${liked ? 'text-blue-700' : 'text-slate-600'}`}>
                          <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-blue-100' : ''}`} />{liked ? 'Liked' : 'Like'}
                        </button>
                        <button type="button" onClick={() => document.getElementById(`comment-${entry.id}`)?.focus()} className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                          <MessageCircle className="h-4 w-4" />Comment
                        </button>
                        <button type="button" onClick={() => void shareEntry(entry)} className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
                          <Share2 className="h-4 w-4" />Share
                        </button>
                      </div>
                      {shareStatus[entry.id] && <p role="status" className="px-5 pb-2 text-right text-xs text-slate-500">{shareStatus[entry.id]}</p>}
                      <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
                        {postComments.map((comment, index) => <p key={`${entry.id}-comment-${index}`} className="mb-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{comment}</p>)}
                        <form onSubmit={(event) => addComment(event, entry.id)} className="flex items-center gap-2">
                          <Avatar small />
                          <input id={`comment-${entry.id}`} value={commentDrafts[entry.id] ?? ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [entry.id]: event.target.value }))} placeholder="Write a comment..." className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-100" />
                          <button type="submit" aria-label="Post comment" disabled={!commentDrafts[entry.id]?.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
                        </form>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                <Search className="mx-auto mb-3 h-7 w-7 text-slate-400" />
                No posts match your search. Try a different keyword.
              </div>
            )}
          </section>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-4">
              <Widget title="My Coding Profile" icon={<UserRound className="h-4 w-4 text-blue-600" />}>
                <div className="flex items-center gap-3">
                  <Avatar />
                  <div><p className="font-bold text-slate-800">Krishnendu</p><p className="text-xs text-slate-500">PHP Full Stack Developer</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{popularTechnologies.map((tech) => <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{tech}</span>)}</div>
              </Widget>

              <Widget title="Today's Learning" icon={<BookOpen className="h-4 w-4 text-violet-600" />}>
                <p className="text-sm leading-relaxed text-slate-600">How to run and manage a Docker container from Ubuntu WSL2.</p>
              </Widget>

              <Widget title="Important Notes" icon={<Star className="h-4 w-4 text-amber-500" />}>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
                  <li>⭐ Check Docker permissions when troubleshooting.</li>
                  <li>⭐ Review existing code before changing auth flows.</li>
                  <li>⭐ Keep commands and solutions documented.</li>
                </ul>
              </Widget>

              <Widget title="Technologies" icon={<Tag className="h-4 w-4 text-blue-600" />}>
                <div className="flex flex-wrap gap-2">{popularTechnologies.map((tech) => <span key={tech} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{tech}</span>)}</div>
              </Widget>

              <Widget title="Documentation" icon={<LinkIcon className="h-4 w-4 text-emerald-600" />}>
                <ul className="space-y-2">{docLinks.map((link) => <li key={link.label}><a href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm font-medium text-blue-700 hover:underline">{link.label}<ExternalLink className="h-3.5 w-3.5 opacity-40" /></a></li>)}</ul>
              </Widget>
              <p className="px-2 text-xs leading-relaxed text-slate-500">Coder&apos;s Diary · A personal developer learning space</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Avatar({ small = false }: { small?: boolean }) {
  return (
    <div className={`${small ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-bold text-white`}>
      K
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a href="#coding-journey" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}>
      <span className={active ? 'text-blue-600' : 'text-slate-500'}>{icon}</span>{label}
    </a>
  );
}

function Widget({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">{icon}{title}</h2>
      {children}
    </section>
  );
}

function FeedBlock({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: 'emerald' | 'rose' | 'violet' | 'amber'; children: React.ReactNode }) {
  const colorClass = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    violet: 'border-violet-200 bg-violet-50 text-violet-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900'
  }[color];
  return (
    <section className={`mt-4 rounded-xl border p-4 ${colorClass}`}>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">{icon}{title}</h4>
      {children}
    </section>
  );
}
