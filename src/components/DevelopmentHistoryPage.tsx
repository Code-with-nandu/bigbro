import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, Clock3, ExternalLink, FileCode2, GitCommitHorizontal, History, Loader2, RefreshCw, UserRound } from 'lucide-react';

interface HistoryCommit {
  sha: string;
  message: string;
  authorName: string;
  authorDate: string | null;
  htmlUrl: string;
  changedFiles: string[];
  changedFilesCount: number | null;
  filesError: string | null;
}

interface GitHubActor {
  login: string | null;
}

interface GitHubSignature {
  name: string | null;
  date: string | null;
}

interface GitHubCommitSummary {
  sha: string;
  html_url: string;
  author: GitHubActor | null;
  commit: {
    message: string;
    author: GitHubSignature | null;
    committer: GitHubSignature | null;
  };
}

interface GitHubCommitDetails {
  files?: Array<{ filename: string }>;
}

class GitHubApiError extends Error {
  constructor(message: string, readonly isRateLimit = false) {
    super(message);
  }
}

const PAGE_SIZE = 20;
const REPOSITORY_API = 'https://api.github.com/repos/Code-with-nandu/bigbro';
const GITHUB_HEADERS = { Accept: 'application/vnd.github+json' };

async function fetchGitHubJson<T>(url: string): Promise<{ data: T; response: Response }> {
  let response: Response;
  try {
    response = await fetch(url, { headers: GITHUB_HEADERS });
  } catch {
    throw new GitHubApiError('GitHub could not be reached. Check the connection and try again.');
  }

  if (!response.ok) {
    const payload = await response.clone().json().catch(() => null) as { message?: string } | null;
    const rateLimited = response.status === 429
      || response.headers.get('x-ratelimit-remaining') === '0'
      || /rate limit/i.test(payload?.message ?? '');
    if (rateLimited) {
      const resetHeader = response.headers.get('x-ratelimit-reset');
      const resetTime = resetHeader ? new Date(Number(resetHeader) * 1000).toLocaleTimeString() : null;
      throw new GitHubApiError(
        `GitHub API rate limit reached.${resetTime ? ` Try again after ${resetTime}.` : ' Please wait before retrying.'}`,
        true
      );
    }
    throw new GitHubApiError(payload?.message || `GitHub API returned HTTP ${response.status}.`);
  }

  return { data: await response.json() as T, response };
}

async function fetchCommitDetails(summary: GitHubCommitSummary): Promise<HistoryCommit> {
  const authorName = summary.commit.author?.name || summary.commit.committer?.name || summary.author?.login || 'Unknown author';
  const authorDate = summary.commit.author?.date || summary.commit.committer?.date || null;
  const commit = {
    sha: summary.sha,
    message: summary.commit.message,
    authorName,
    authorDate,
    htmlUrl: summary.html_url,
    changedFiles: [] as string[],
    changedFilesCount: null as number | null,
    filesError: null as string | null
  };

  try {
    const { data } = await fetchGitHubJson<GitHubCommitDetails>(`${REPOSITORY_API}/commits/${encodeURIComponent(summary.sha)}`);
    if (!Array.isArray(data.files)) {
      return { ...commit, filesError: 'GitHub did not include a changed-file list for this commit.' };
    }
    const changedFiles = data.files.map((file) => file.filename);
    return { ...commit, changedFiles, changedFilesCount: changedFiles.length };
  } catch (error) {
    if (error instanceof GitHubApiError && error.isRateLimit) throw error;
    return {
      ...commit,
      filesError: error instanceof Error ? error.message : 'Unable to fetch changed files.'
    };
  }
}

async function fetchHistoryPage(page: number) {
  const url = new URL(`${REPOSITORY_API}/commits`);
  url.searchParams.set('sha', 'main');
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', String(page));

  const { data: summaries, response } = await fetchGitHubJson<GitHubCommitSummary[]>(url.toString());
  if (!Array.isArray(summaries)) throw new Error('GitHub returned an unexpected commit history response.');

  const commits = await Promise.all(summaries.map(fetchCommitDetails));
  return {
    commits,
    page,
    hasMore: Boolean(response.headers.get('link')?.includes('rel="next"'))
  };
}

function formatCommitDate(value: string | null) {
  if (!value) return 'Commit date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Commit date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function DevelopmentHistoryPage() {
  const [commits, setCommits] = useState<HistoryCommit[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    fetchHistoryPage(1)
      .then((result) => {
        if (!active) return;
        setCommits(result.commits);
        setPage(result.page);
        setHasMore(result.hasMore);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load development history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadMoreError('');

    try {
      const result = await fetchHistoryPage(page + 1);
      setCommits((current) => [...current, ...result.commits]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (loadError) {
      setLoadMoreError(loadError instanceof Error ? loadError.message : 'Unable to load more commits.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050508] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b border-white/10 pb-7">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
            <History className="h-4 w-4" /> Project milestones
          </div>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Development History</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
                A live timeline of the changes made to the Big Brother website.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span>{commits.length} commits loaded · {PAGE_SIZE} per page</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-400" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-amber-300" /> Loading repository history...
          </div>
        ) : error ? (
          <section role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Unable to load development history</h2>
                <p className="mt-1 break-words text-sm text-rose-100/80">{error}</p>
              </div>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="rounded-md border border-rose-200/20 px-3 py-1.5 text-xs font-semibold hover:bg-rose-200/10">
                Retry
              </button>
            </div>
          </section>
        ) : commits.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0b0b10] px-5 py-16 text-center text-sm text-neutral-400">
            No commits were returned for the main branch.
          </div>
        ) : (
          <>
            <ol className="relative space-y-4 before:absolute before:bottom-7 before:left-[21px] before:top-7 before:w-px before:bg-gradient-to-b before:from-amber-300/50 before:via-white/10 before:to-transparent sm:space-y-5">
              {commits.map((commit, index) => (
                <li key={commit.sha} className="relative pl-12 sm:pl-14">
                  <span className="absolute left-0 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300/30 bg-[#0b0b10] text-amber-200">
                    <GitCommitHorizontal className="h-5 w-5" />
                  </span>
                  <article className="rounded-xl border border-white/10 bg-[#0b0b10] p-5 transition-colors hover:border-white/20 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-500">
                      <span className="font-mono font-semibold uppercase tracking-wider text-amber-300">Commit {String(index + 1).padStart(2, '0')}</span>
                      <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />{commit.authorName}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatCommitDate(commit.authorDate)}</span>
                    </div>
                    <h2 className="mt-3 whitespace-pre-wrap break-words text-base font-bold leading-relaxed tracking-tight sm:text-lg">{commit.message || 'Commit message unavailable'}</h2>
                    <a href={commit.htmlUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 font-mono text-[11px] text-amber-200 transition hover:border-amber-300/30 hover:text-amber-100">
                      <span className="truncate">{commit.sha}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>

                    <div className="mt-5 border-t border-white/[0.07] pt-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-neutral-300">
                        <FileCode2 className="h-4 w-4 text-amber-300" />
                        Changed files {commit.changedFilesCount === null ? '(count unavailable)' : `(${commit.changedFilesCount})`}
                      </div>
                      {commit.filesError ? (
                        <p className="text-xs text-amber-200/80">File list unavailable: {commit.filesError}</p>
                      ) : commit.changedFiles.length ? (
                        <ul className="space-y-1.5">
                          {commit.changedFiles.map((file) => (
                            <li key={file} className="break-all font-mono text-[11px] leading-relaxed text-neutral-400">{file}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-neutral-500">No changed files were reported.</p>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/10 pt-6">
              {loadMoreError && <p role="alert" className="text-center text-xs text-rose-300">{loadMoreError}</p>}
              {hasMore ? (
                <button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/15 disabled:cursor-wait disabled:opacity-60">
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {loadingMore ? 'Loading commits...' : 'Load More Commits'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <p className="text-xs text-neutral-500">No more commits on this branch.</p>
              )}
              <span className="font-mono text-[10px] text-neutral-600">Page {page} · {PAGE_SIZE} commits per request</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
