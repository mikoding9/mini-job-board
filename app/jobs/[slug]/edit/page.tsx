import { notFound } from "next/navigation";
import JobEditorClient from "@/components/JobEditorClient";
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

  return <JobEditorClient mode="edit" slug={slug} initialJob={job} />;
}
