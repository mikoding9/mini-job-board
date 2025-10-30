"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import useSWR from "swr";
import { useAtomValue } from "jotai";
import type { Selection } from "@react-types/shared";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import type { Job, JobStatus, JobType } from "@/types/jobs";
import { authStateAtom } from "@/atoms/auth";
import { deleteJob, type UpdateJobInput, updateJob } from "@/lib/job-mutations";
import { fetchJobBySlugForOwner } from "@/lib/jobs";

const JOB_TYPE_OPTIONS: JobType[] = ["Full-Time", "Part-Time", "Contract"];
const JOB_STATUS_OPTIONS: JobStatus[] = ["draft", "published", "archived"];

const toSelectedKeys = (value: string): Selection => new Set([value]);
const getValueFromSelection = (keys: Selection): string => {
  if (keys === "all") {
    return "all";
  }
  const [value] = Array.from(keys);
  return value ? String(value) : "all";
};

const arrayToMultiline = (items: string[]) => items.join("\n");
const multilineToArray = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const toDateTimeLocal = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromDateTimeLocal = (value: string) =>
  value ? new Date(value).toISOString() : null;

type JobEditClientProps = {
  slug: string;
  initialJob: Job | null;
};

export default function JobEditClient({ slug, initialJob }: JobEditClientProps) {
  const router = useRouter();
  const authState = useAtomValue(authStateAtom);
  const isAuthenticated = Boolean(authState.user);
  const currentUserId = authState.user?.id ?? null;

  const {
    data: job,
    error,
    isLoading,
    mutate,
  } = useSWR<Job | null>(
    slug ? ["job-owner", slug] : null,
    async () => fetchJobBySlugForOwner(slug),
    {
      revalidateOnFocus: false,
      fallbackData: initialJob,
    },
  );

  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypeKeys, setJobTypeKeys] = useState<Selection>(
    toSelectedKeys(JOB_TYPE_OPTIONS[0]),
  );
  const [jobStatusKeys, setJobStatusKeys] = useState<Selection>(
    toSelectedKeys(JOB_STATUS_OPTIONS[0]),
  );
  const [overview, setOverview] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [salaryCurrency, setSalaryCurrency] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [publishedAtValue, setPublishedAtValue] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = useMemo(() => {
    if (!job || !currentUserId) {
      return false;
    }
    return job.posterId === currentUserId;
  }, [job, currentUserId]);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setCompanyName(job.companyName);
      setLocation(job.location);
      setJobTypeKeys(toSelectedKeys(job.jobType));
      setJobStatusKeys(toSelectedKeys(job.jobStatus));
      setOverview(job.overview);
      setDescription(job.description);
      setResponsibilitiesText(arrayToMultiline(job.responsibilities));
      setRequirementsText(arrayToMultiline(job.requirements));
      setBenefitsText(arrayToMultiline(job.benefits));
      setAboutCompany(job.aboutCompany);
      setApplicationUrl(job.applicationUrl ?? "");
      setApplicationEmail(job.applicationEmail ?? "");
      setSalaryMin(job.salaryMin?.toString() ?? "");
      setSalaryMax(job.salaryMax?.toString() ?? "");
      setSalaryCurrency(job.salaryCurrency ?? "");
      setTagsText(job.tags.join(", "));
      setPublishedAtValue(toDateTimeLocal(job.publishedAt));
    }
  }, [job]);

  useEffect(() => {
    if (!isLoading && !job && (error || !isAuthenticated)) {
      setFormError(
        error?.message ??
          "We couldn't find that job or you don't have permission to edit it.",
      );
    }
  }, [job, error, isLoading, isAuthenticated]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job) return;

    if (!isAuthenticated) {
      setFormError("Please sign in to manage your listings.");
      return;
    }

    if (!isOwner) {
      setFormError("You do not have permission to edit this listing.");
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setIsSaving(true);

    const jobType = getValueFromSelection(jobTypeKeys) as JobType;
    const jobStatus = getValueFromSelection(jobStatusKeys) as JobStatus;

    const resolvedPublishedAt =
      jobStatus === "published"
        ? publishImmediately
          ? new Date().toISOString()
          : fromDateTimeLocal(publishedAtValue) ??
            job.publishedAt ??
            new Date().toISOString()
        : null;

    const updatePayload: UpdateJobInput = {
      title: title.trim(),
      companyName: companyName.trim(),
      location: location.trim(),
      jobType,
      jobStatus,
      overview,
      description,
      responsibilities: multilineToArray(responsibilitiesText),
      requirements: multilineToArray(requirementsText),
      benefits: multilineToArray(benefitsText),
      aboutCompany,
      applicationUrl: applicationUrl.trim() || null,
      applicationEmail: applicationEmail.trim() || null,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      salaryCurrency: salaryCurrency.trim() || null,
      tags: multilineToArray(tagsText.replace(/,/g, "\n")),
      publishedAt: resolvedPublishedAt,
    };

    try {
      const updatedJob = await updateJob(job.id, updatePayload);
      await mutate(updatedJob, { revalidate: true });
      setFormSuccess("Listing updated successfully.");
      setPublishImmediately(false);
      if (updatedJob.jobStatus === "published") {
        setPublishedAtValue(toDateTimeLocal(updatedJob.publishedAt));
      } else {
        setPublishedAtValue("");
      }
    } catch (updateError) {
      setFormError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update job. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!job) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      await deleteJob(job.id);
      setFormSuccess("Listing deleted. Redirecting to dashboard…");
      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (deleteError) {
      setFormError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete job. Please try again.",
      );
      setIsDeleting(false);
    }
  }, [job, router]);

  if (!isAuthenticated && !authState.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <Card className="w-full max-w-lg border border-zinc-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Sign in required
            </h1>
          </CardHeader>
          <CardBody className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
            <p>You need to sign in to manage job listings.</p>
            <Button as={NextLink} href="/sign-in" color="primary">
              Go to sign in
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <Card className="w-full max-w-lg border border-zinc-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Loading listing…
            </h1>
          </CardHeader>
          <CardBody className="text-sm text-zinc-600 dark:text-zinc-300">
            Fetching the latest job details.
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!job || !isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <Card className="w-full max-w-lg border border-zinc-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Listing unavailable
            </h1>
          </CardHeader>
          <CardBody className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
            <p>
              We couldn&apos;t find that job or you don&apos;t have permission to edit
              it.
            </p>
            <Button as={NextLink} href="/" color="primary">
              Return to board
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pt-12">
        <Card className="border border-zinc-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                Edit job listing
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Edit details, adjust visibility, or remove this role entirely.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                as={NextLink}
                href={`/jobs/${job.slug}`}
                variant="flat"
                size="sm"
              >
                View public page
              </Button>
              <Button
                color="danger"
                variant="ghost"
                size="sm"
                onPress={handleDelete}
                isDisabled={isDeleting}
                isLoading={isDeleting}
              >
                Delete listing
              </Button>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Job title"
                  value={title}
                  onValueChange={setTitle}
                  isRequired
                  description="Keep it concise and role-focused."
                />
                <Input
                  label="Company name"
                  value={companyName}
                  onValueChange={setCompanyName}
                  isRequired
                />
                <Input
                  label="Location"
                  value={location}
                  onValueChange={setLocation}
                  isRequired
                />
                <Select
                  label="Job type"
                  selectedKeys={jobTypeKeys}
                  onSelectionChange={setJobTypeKeys}
                  selectionMode="single"
                >
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type}>{type}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Listing status"
                  selectedKeys={jobStatusKeys}
                  onSelectionChange={setJobStatusKeys}
                  selectionMode="single"
                >
                  {JOB_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status}>{status}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Salary currency"
                  value={salaryCurrency}
                  onValueChange={setSalaryCurrency}
                  placeholder="USD"
                />
                <Input
                  label="Salary minimum"
                  value={salaryMin}
                  onValueChange={setSalaryMin}
                  type="number"
                  min={0}
                />
                <Input
                  label="Salary maximum"
                  value={salaryMax}
                  onValueChange={setSalaryMax}
                  type="number"
                  min={0}
                />
              </div>

              <Textarea
                label="Overview"
                minRows={3}
                value={overview}
                onValueChange={setOverview}
                placeholder="High-level summary of the role."
              />

              <Textarea
                label="Description"
                minRows={5}
                value={description}
                onValueChange={setDescription}
                placeholder="Detailed description, expectations, success metrics."
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Textarea
                  label="Responsibilities"
                  minRows={6}
                  value={responsibilitiesText}
                  onValueChange={setResponsibilitiesText}
                  placeholder="List each responsibility on a new line."
                />
                <Textarea
                  label="Requirements"
                  minRows={6}
                  value={requirementsText}
                  onValueChange={setRequirementsText}
                  placeholder="List each requirement on a new line."
                />
              </div>

              <Textarea
                label="Benefits"
                minRows={4}
                value={benefitsText}
                onValueChange={setBenefitsText}
                placeholder="List each benefit on a new line."
              />

              <Textarea
                label="About the company"
                minRows={4}
                value={aboutCompany}
                onValueChange={setAboutCompany}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Application URL"
                  value={applicationUrl}
                  onValueChange={setApplicationUrl}
                  placeholder="https://"
                />
                <Input
                  label="Application email"
                  value={applicationEmail}
                  onValueChange={setApplicationEmail}
                  placeholder="talent@example.com"
                />
              </div>

              <Textarea
                label="Tags"
                minRows={2}
                description="Comma or newline separated keywords."
                value={tagsText}
                onValueChange={setTagsText}
              />

              {getValueFromSelection(jobStatusKeys) === "published" && (
                <Card className="border border-primary-200/80 bg-primary-50/60 p-4 dark:border-primary-400/60 dark:bg-primary-950/30">
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-300">
                    Publishing options
                  </p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <Input
                      label="Published at"
                      type="datetime-local"
                      value={publishedAtValue}
                      onValueChange={setPublishedAtValue}
                    />
                    <Checkbox
                      isSelected={publishImmediately}
                      onValueChange={setPublishImmediately}
                    >
                      Set publish timestamp to right now
                    </Checkbox>
                  </div>
                </Card>
              )}

              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formSuccess}
                </p>
              )}

              <CardFooter className="flex flex-wrap justify-end gap-3">
                <Button variant="flat" as={NextLink} href="/">
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isDisabled={isSaving}
                  isLoading={isSaving}
                >
                  Save changes
                </Button>
              </CardFooter>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
