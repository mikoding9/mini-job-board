import { notFound } from "next/navigation";
import { JOB_POSTINGS, getJobBySlug } from "@/data/job-postings";
import JobDetailClient from "../../../components/JobDetailClient";

type JobDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return JOB_POSTINGS.map((job) => ({
    slug: job.slug,
  }));
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} />;
}
