export type JobType = "Full-Time" | "Part-Time" | "Contract";

export type JobStatus = "draft" | "published" | "archived";

export type JobRecord = {
  id: string;
  slug: string | null;
  title: string;
  company_name: string;
  location: string;
  job_type: JobType;
  job_status: JobStatus;
  overview: string | null;
  description: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  benefits: string[] | null;
  about_company: string | null;
  application_url: string | null;
  application_email: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  poster_id: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
};

export type Job = {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  jobStatus: JobStatus;
  overview: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  aboutCompany: string;
  applicationUrl: string | null;
  applicationEmail: string | null;
  publishedAt: string | null;
  postedOn: string;
  createdAt: string;
  updatedAt: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  tags: string[];
  posterId: string;
};
