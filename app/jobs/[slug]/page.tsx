import { notFound } from "next/navigation";
import JobDetailClient from "@/components/JobDetailClient";
import { fetchJobBySlug, fetchPublishedJobSlugs } from "@/lib/jobs";

export const revalidate = 0;

type JobDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  try {
    const slugs = await fetchPublishedJobSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await fetchJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} />;
}
