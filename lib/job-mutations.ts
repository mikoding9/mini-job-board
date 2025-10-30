"use client";

import type { Job, JobStatus, JobType } from "@/types/jobs";
import type { JobRecord } from "@/types/jobs";
import { supabaseClient } from "@/lib/supabase-client";
import { transformJobRecord } from "@/lib/jobs";

export type UpdateJobInput = {
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
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  tags: string[];
  publishedAt: string | null;
};

const toNullIfEmpty = (value: string | null | undefined) =>
  value && value.trim().length > 0 ? value : null;

export async function updateJob(
  jobId: string,
  input: UpdateJobInput,
): Promise<Job> {
  const { data, error } = await supabaseClient
    .from("jobs")
    .update({
      title: input.title,
      company_name: input.companyName,
      location: input.location,
      job_type: input.jobType,
      job_status: input.jobStatus,
      overview: toNullIfEmpty(input.overview),
      description: toNullIfEmpty(input.description),
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      benefits: input.benefits,
      about_company: toNullIfEmpty(input.aboutCompany),
      application_url: toNullIfEmpty(input.applicationUrl),
      application_email: toNullIfEmpty(input.applicationEmail),
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      salary_currency: toNullIfEmpty(input.salaryCurrency),
      tags: input.tags,
      published_at: input.publishedAt,
    })
    .eq("id", jobId)
    .select("*")
    .single<JobRecord>();

  if (error) {
    throw error;
  }

  return transformJobRecord(data);
}

export async function deleteJob(jobId: string): Promise<void> {
  const { error } = await supabaseClient.from("jobs").delete().eq("id", jobId);
  if (error) {
    throw error;
  }
}
