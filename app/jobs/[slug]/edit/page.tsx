import JobEditorClient from "@/components/JobEditorClient";

type EditJobPageProps = {
  params: {
    slug: string;
  };
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { slug } = await params;
  return <JobEditorClient mode="edit" slug={slug} initialJob={null} />;
}
