import type { Job, JobRecord } from "@/types/jobs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

const REST_URL = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`
  : undefined;

function assertSupabaseEnv() {
  if (!REST_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Ensure NEXT_PUBLIC_SUPABASE_PROJECT_URL and NEXT_PUBLIC_SUPABASE_API_KEY are set.",
    );
  }
}

function buildHeaders(extra?: HeadersInit): Headers {
  assertSupabaseEnv();

  const headers = new Headers(extra);
  headers.set("apikey", SUPABASE_ANON_KEY!);
  headers.set("Authorization", `Bearer ${SUPABASE_ANON_KEY!}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function supabaseRequest(path: string, init?: RequestInit): Promise<Response> {
  assertSupabaseEnv();

  const response = await fetch(`${REST_URL!}/${path}`, {
    ...init,
    headers: buildHeaders(init?.headers),
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Supabase request failed (${response.status} ${response.statusText}): ${message}`,
    );
  }

  return response;
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await supabaseRequest(path, init);
  return (await response.json()) as T;
}

async function supabaseFetchWithResponse<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; response: Response }> {
  const response = await supabaseRequest(path, init);
  const data = (await response.json()) as T;
  return { data, response };
}

const FALLBACK_POSTED_LABELS: Record<string, string> = {
  draft: "Draft — not yet published",
  archived: "Archived",
};

function formatPublishedLabel(dateIso: string | null): string {
  if (!dateIso) {
    return "Published";
  }

  const publishedDate = new Date(dateIso);
  if (Number.isNaN(publishedDate.valueOf())) {
    return "Published";
  }

  const diffMs = Date.now() - publishedDate.getTime();
  if (diffMs <= 0) {
    return "Published moments ago";
  }

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs;

  if (diffMs < minuteMs) {
    return "Published moments ago";
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `Published ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `Published ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (diffMs < monthMs) {
    const days = Math.floor(diffMs / dayMs);
    return `Published ${days} day${days === 1 ? "" : "s"} ago`;
  }

  return `Published on ${publishedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function toArray(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

export function transformJobRecord(record: JobRecord): Job {
  const description = record.description ?? record.overview ?? "";
  const overview = record.overview ?? record.description ?? "";
  const postedOn =
    record.job_status === "published"
      ? formatPublishedLabel(record.published_at ?? record.created_at)
      : (FALLBACK_POSTED_LABELS[record.job_status] ?? "Published");

  return {
    id: record.id,
    slug: record.slug ?? "",
    title: record.title,
    companyName: record.company_name,
    location: record.location,
    jobType: record.job_type,
    jobStatus: record.job_status,
    overview,
    description,
    responsibilities: toArray(record.responsibilities),
    requirements: toArray(record.requirements),
    benefits: toArray(record.benefits),
    aboutCompany: record.about_company ?? "",
    applicationUrl: record.application_url,
    applicationEmail: record.application_email,
    publishedAt: record.published_at,
    postedOn,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    salaryMin: record.salary_min,
    salaryMax: record.salary_max,
    salaryCurrency: record.salary_currency,
    tags: toArray(record.tags),
    posterId: record.poster_id,
  };
}

const JOBS_ORDER = "published_at.desc.nullslast,created_at.desc";

export type PublishedJobsPageParams = {
  page: number;
  pageSize: number;
  location?: string;
  jobType?: string;
  posterId?: string;
};

export type PublishedJobsPageResult = {
  jobs: Job[];
  total: number;
};

function sanitizePage(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || value === undefined || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
}

export async function fetchPublishedJobsPage(
  params: PublishedJobsPageParams,
): Promise<PublishedJobsPageResult> {
  const page = sanitizePage(params.page, 1);
  const pageSize = sanitizePage(params.pageSize, 5);
  const offset = (page - 1) * pageSize;

  let query = `jobs?select=*&job_status=eq.published&order=${JOBS_ORDER}&limit=${pageSize}&offset=${offset}`;

  if (params.location) {
    query += `&location=eq.${encodeURIComponent(params.location)}`;
  }

  if (params.jobType) {
    query += `&job_type=eq.${encodeURIComponent(params.jobType)}`;
  }

  if (params.posterId) {
    query += `&poster_id=eq.${encodeURIComponent(params.posterId)}`;
  }

  const { data, response } = await supabaseFetchWithResponse<JobRecord[]>(
    query,
    {
      headers: {
        Prefer: "count=exact",
      },
    },
  );

  const contentRange = response.headers.get("Content-Range");
  const total = (() => {
    if (!contentRange) {
      return data.length;
    }
    const [, totalPart] = contentRange.split("/");
    const parsed = Number.parseInt(totalPart ?? "", 10);
    return Number.isNaN(parsed) ? data.length : parsed;
  })();

  return {
    jobs: data.map(transformJobRecord),
    total,
  };
}

export async function fetchPublishedJobFilters(params?: {
  posterId?: string;
}): Promise<{ locations: string[]; jobTypes: string[] }> {
  const posterId = params?.posterId;

  let query = "jobs?select=location,job_type&job_status=eq.published";

  if (posterId) {
    query += `&poster_id=eq.${encodeURIComponent(posterId)}`;
  }

  const records = await supabaseFetch<
    Array<Pick<JobRecord, "location" | "job_type">>
  >(query);

  const locations = Array.from(
    new Set(
      records
        .map((record) => record.location)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const jobTypes = Array.from(
    new Set(
      records
        .map((record) => record.job_type)
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => a.localeCompare(b));

  return { locations, jobTypes };
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  if (!slug) {
    return null;
  }

  const records = await supabaseFetch<JobRecord[]>(
    `jobs?slug=eq.${encodeURIComponent(
      slug,
    )}&job_status=eq.published&select=*&limit=1`,
  );

  const record = records[0];
  return record ? transformJobRecord(record) : null;
}

export async function fetchPublishedJobSlugs(): Promise<string[]> {
  const records = await supabaseFetch<Array<Pick<JobRecord, "slug">>>(
    "jobs?select=slug&job_status=eq.published",
  );
  return records
    .map((record) => record.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length);
}

export async function fetchJobBySlugForOwner(
  slug: string,
): Promise<Job | null> {
  if (!slug) {
    return null;
  }

  const records = await supabaseFetch<JobRecord[]>(
    `jobs?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`,
  );

  const record = records[0];
  return record ? transformJobRecord(record) : null;
}
