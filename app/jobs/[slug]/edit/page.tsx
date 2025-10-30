import { notFound } from "next/navigation";
import JobEditClient from "@/components/JobEditClient";
import { fetchJobBySlugForOwner } from "@/lib/jobs";

type EditJobPageProps = {
  params: {
    slug: string;
  };
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { slug } = await params;
  const job = await fetchJobBySlugForOwner(slug);

  if (!job) {
    // Allow the client component to handle auth checks; here we only guard unknown slugs.
    notFound();
  }

  return <JobEditClient slug={slug} initialJob={job} />;
}
