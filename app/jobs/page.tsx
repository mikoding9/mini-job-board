"use client";

import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useAtomValue } from "jotai";
import type { Selection } from "@react-types/shared";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import {
  FiArrowRight,
  FiBriefcase,
  FiEdit3,
  FiFilter,
  FiHome,
  FiLayers,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiUserPlus,
  FiClock,
} from "react-icons/fi";
import {
  fetchPublishedJobFilters,
  fetchPublishedJobsPage,
  type PublishedJobsPageResult,
} from "@/lib/jobs";
import { supabaseClient } from "@/lib/supabase-client";
import { authStateAtom } from "@/atoms/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { deleteJob } from "@/lib/job-mutations";
import type { Job, JobStatus } from "@/types/jobs";

const toSelectedKeys = (value: string): Selection => new Set([value]);
const getValueFromSelection = (keys: Selection): string => {
  if (keys === "all") {
    return "all";
  }
  const [value] = Array.from(keys);
  return value ? String(value) : "all";
};

const PAGE_SIZE = 5;

type ManageJobsKey = [
  "jobs/manage",
  string,
  number,
  string | null,
  string | null,
  "auth" | "anon",
];

type ManageJobsFilterKey = [
  "jobs/manage/filters",
  string,
  "auth" | "anon",
];

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

const JOB_STATUS_META: Record<JobStatus, { label: string; color: ChipColor }> =
  {
    draft: { label: "Draft", color: "warning" },
    published: { label: "Published", color: "success" },
    archived: { label: "Archived", color: "default" },
  };

export default function ManageJobsPage() {
  const router = useRouter();
  const authState = useAtomValue(authStateAtom);
  const isAuthenticated = Boolean(authState.user);
  const authLoading = authState.loading;
  const currentUserId = authState.user?.id ?? null;
  const accessToken = authState.session?.access_token ?? null;

  const [locationKeys, setLocationKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [jobTypeKeys, setJobTypeKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [jobPendingDeletion, setJobPendingDeletion] = useState<Job | null>(
    null,
  );
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasTriggeredRedirect, setHasTriggeredRedirect] = useState(false);

  const isRedirecting = !authLoading && !isAuthenticated;

  const selectedLocation = useMemo(
    () => getValueFromSelection(locationKeys),
    [locationKeys],
  );
  const selectedJobType = useMemo(
    () => getValueFromSelection(jobTypeKeys),
    [jobTypeKeys],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedJobType]);

  useEffect(() => {
    if (!currentUserId) {
      setLocationKeys(toSelectedKeys("all"));
      setJobTypeKeys(toSelectedKeys("all"));
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isRedirecting && !hasTriggeredRedirect) {
      setHasTriggeredRedirect(true);
      router.replace("/sign-in?redirect=/jobs");
    }
  }, [hasTriggeredRedirect, isRedirecting, router]);

  const locationFilter = selectedLocation === "all" ? null : selectedLocation;
  const jobTypeFilter = selectedJobType === "all" ? null : selectedJobType;

  const fetchManageJobs = useCallback(
    ([, posterId, page, location, jobType]: ManageJobsKey) =>
      fetchPublishedJobsPage({
        page,
        pageSize: PAGE_SIZE,
        location: location ?? undefined,
        jobType: jobType ?? undefined,
        posterId,
        accessToken: accessToken ?? undefined,
      }),
    [accessToken],
  );

  const manageJobsKey: ManageJobsKey | null = currentUserId
    ? [
        "jobs/manage",
        currentUserId,
        currentPage,
        locationFilter,
        jobTypeFilter,
        accessToken ? "auth" : "anon",
      ]
    : null;

  const {
    data: jobPage,
    error,
    isLoading,
    mutate: mutateJobs,
  } = useSWR<PublishedJobsPageResult>(manageJobsKey, fetchManageJobs, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const fetchManageJobFilters = useCallback(
    ([, posterId]: ManageJobsFilterKey) =>
      fetchPublishedJobFilters({
        posterId,
        accessToken: accessToken ?? undefined,
      }),
    [accessToken],
  );

  const manageFiltersKey: ManageJobsFilterKey | null = currentUserId
    ? ["jobs/manage/filters", currentUserId, accessToken ? "auth" : "anon"]
    : null;

  const { data: filterOptions, mutate: mutateFilters } = useSWR(
    manageFiltersKey,
    fetchManageJobFilters,
    {
      revalidateOnFocus: false,
    },
  );

  const jobLocations = useMemo(() => {
    return filterOptions?.locations ?? [];
  }, [filterOptions]);

  const jobTypes = useMemo(() => {
    return filterOptions?.jobTypes ?? [];
  }, [filterOptions]);

  const locationItems = useMemo(
    () => [
      { key: "all", label: "All locations" },
      ...jobLocations.map((location) => ({
        key: location,
        label: location,
      })),
    ],
    [jobLocations],
  );

  const jobTypeItems = useMemo(
    () => [
      { key: "all", label: "All job types" },
      ...jobTypes.map((jobType) => ({
        key: jobType,
        label: jobType,
      })),
    ],
    [jobTypes],
  );

  useEffect(() => {
    if (
      selectedLocation !== "all" &&
      jobLocations.length > 0 &&
      !jobLocations.includes(selectedLocation)
    ) {
      setLocationKeys(toSelectedKeys("all"));
    }
  }, [jobLocations, selectedLocation]);

  useEffect(() => {
    if (
      selectedJobType !== "all" &&
      jobTypes.length > 0 &&
      !jobTypes.includes(selectedJobType)
    ) {
      setJobTypeKeys(toSelectedKeys("all"));
    }
  }, [jobTypes, selectedJobType]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await supabaseClient.auth.signOut();
      showSuccessToast({
        title: "Signed out",
        description: "Come back anytime to keep your listings fresh.",
      });
    } catch (error) {
      showErrorToast({
        title: "Sign-out failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const requestRemoveListing = useCallback((job: Job) => {
    setJobPendingDeletion(job);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmRemoveListing = useCallback(async () => {
    if (!jobPendingDeletion) {
      return;
    }

    const jobToDelete = jobPendingDeletion;
    setDeletingJobId(jobToDelete.id);

    try {
      await deleteJob(jobToDelete.id);
      await mutateJobs();
      await mutateFilters();

      showSuccessToast({
        title: "Listing removed",
        description: "The job is no longer visible to candidates.",
      });
    } catch (removeError) {
      showErrorToast({
        title: "Unable to remove listing",
        description:
          removeError instanceof Error
            ? removeError.message
            : "Please try again.",
      });
    } finally {
      setDeletingJobId(null);
      setJobPendingDeletion(null);
    }
  }, [jobPendingDeletion, mutateJobs, mutateFilters]);

  const handleDeleteDialogChange = useCallback((isOpen: boolean) => {
    setIsDeleteDialogOpen(isOpen);
    if (!isOpen) {
      setJobPendingDeletion(null);
    }
  }, []);

  const totalJobs = jobPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedJobs = jobPage?.jobs ?? [];

  const openRolesHeading =
    totalJobs === 0
      ? "No listings yet"
      : `${totalJobs} ${
          totalJobs === 1 ? "listing" : "listings"
        } across your team`;
  const showEmptyState = !isLoading && !error && totalJobs === 0;
  const emptyStateMessage =
    "You haven't published any listings yet. Post your first role to see it here.";

  const resetFilters = () => {
    setLocationKeys(toSelectedKeys("all"));
    setJobTypeKeys(toSelectedKeys("all"));
  };

  if (isRedirecting) {
    return null;
  }

  const heroChipLabel = "Built for hiring teams";
  const heroTitle = "Reach engaged candidates faster";
  const heroSubtitle =
    "Publish roles in minutes and showcase them to a community of product builders ready to collaborate.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-12 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navbar maxWidth="full" className="mx-auto max-w-5xl bg-transparent px-6">
        <NavbarBrand className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          <span className="flex items-center gap-2">
            <FiLayers
              className="h-5 w-5 text-primary-500 dark:text-primary-400"
              aria-hidden
            />
            Mini Job Board
          </span>
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-3">
          {isAuthenticated ? (
            <>
              <NavbarItem>
                <Button
                  as={NextLink}
                  href="/"
                  variant="light"
                  startContent={<FiHome className="h-4 w-4" aria-hidden />}
                >
                  Home
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={NextLink}
                  href="/jobs/new"
                  color="primary"
                  startContent={<FiPlus className="h-4 w-4" aria-hidden />}
                >
                  Post a role
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  variant="light"
                  onPress={handleSignOut}
                  isDisabled={isSigningOut}
                  isLoading={isSigningOut}
                  startContent={<FiLogOut className="h-4 w-4" aria-hidden />}
                >
                  Sign out
                </Button>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem>
                <Button
                  as={NextLink}
                  href="/sign-in"
                  variant="light"
                  startContent={<FiLogIn className="h-4 w-4" aria-hidden />}
                >
                  Sign in
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={NextLink}
                  href="/sign-up"
                  color="primary"
                  startContent={<FiUserPlus className="h-4 w-4" aria-hidden />}
                >
                  Create account
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pt-12">
        <section className="space-y-4 text-center md:text-left">
          <Chip
            color="primary"
            variant="flat"
            className="mx-auto w-max md:mx-0"
          >
            {heroChipLabel}
          </Chip>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
            {heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-600 dark:text-zinc-400 md:mx-0">
            {heroSubtitle}
          </p>
        </section>

        {!isAuthenticated && !authLoading ? (
          <Card className="border border-dashed border-zinc-300 bg-white/85 dark:border-zinc-700 dark:bg-zinc-900/85">
            <CardBody className="space-y-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Sign in to manage your listings
              </p>
              <p>
                Create an account or sign in to publish roles, edit details, and
                view performance at a glance.
              </p>
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Button
                  as={NextLink}
                  href="/sign-in"
                  color="primary"
                  startContent={<FiLogIn className="h-4 w-4" aria-hidden />}
                >
                  Sign in
                </Button>
                <Button
                  as={NextLink}
                  href="/sign-up"
                  variant="light"
                  startContent={<FiUserPlus className="h-4 w-4" aria-hidden />}
                >
                  Create account
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        {isAuthenticated ? (
          <>
            <Card className="border border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/80">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="flex items-center gap-2">
                      <FiFilter
                        className="h-5 w-5 text-primary-500 dark:text-primary-400"
                        aria-hidden
                      />
                      Filter your listings
                    </span>
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Refine by location or role type to focus on the listings you
                    want to update.
                  </p>
                </div>
                {(selectedLocation !== "all" || selectedJobType !== "all") && (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={resetFilters}
                    startContent={<FiFilter className="h-4 w-4" aria-hidden />}
                  >
                    Clear filters
                  </Button>
                )}
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Location"
                    placeholder="All locations"
                    selectedKeys={locationKeys}
                    onSelectionChange={setLocationKeys}
                    selectionMode="single"
                    items={locationItems}
                  >
                    {(item) => (
                      <SelectItem key={item.key} textValue={item.label}>
                        {item.label}
                      </SelectItem>
                    )}
                  </Select>
                  <Select
                    label="Job type"
                    placeholder="All job types"
                    selectedKeys={jobTypeKeys}
                    onSelectionChange={setJobTypeKeys}
                    selectionMode="single"
                    items={jobTypeItems}
                  >
                    {(item) => (
                      <SelectItem key={item.key} textValue={item.label}>
                        {item.label}
                      </SelectItem>
                    )}
                  </Select>
                </div>
              </CardBody>
            </Card>

            <section className="space-y-4 pb-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {openRolesHeading}
                </h2>
                <Link
                  as={NextLink}
                  href="/jobs/new"
                  color="primary"
                  className="flex items-center gap-2 text-sm"
                >
                  <FiPlus className="h-4 w-4" aria-hidden />
                  {paginatedJobs.length > 0 ? "Add new listing" : "Post your first role"}
                </Link>
              </div>

              <div className="grid gap-4">
                {isLoading && (
                  <Card className="border border-zinc-200/70 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-900/80">
                    <CardBody className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <p className="font-medium text-zinc-700 dark:text-zinc-200">
                        Loading your listings…
                      </p>
                      <p>
                        We&apos;re pulling in every role you&apos;ve created so
                        you can edit or publish with confidence.
                      </p>
                    </CardBody>
                  </Card>
                )}

                {error && (
                  <Card className="border border-red-200 bg-red-50/70 dark:border-red-800/70 dark:bg-red-950/30">
                    <CardBody className="space-y-2 text-sm text-red-700 dark:text-red-200">
                      <p className="font-medium">
                        We couldn&apos;t load your listings.
                      </p>
                      <p>Refresh the page or check your Supabase credentials.</p>
                    </CardBody>
                  </Card>
                )}

                {showEmptyState && (
                  <Card className="border border-dashed border-zinc-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/80">
                    <CardBody className="items-center space-y-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      <p>{emptyStateMessage}</p>
                      <Button
                        as={NextLink}
                        href="/jobs/new"
                        color="primary"
                        startContent={<FiPlus className="h-4 w-4" aria-hidden />}
                      >
                        Post a role
                      </Button>
                    </CardBody>
                  </Card>
                )}

                {paginatedJobs.map((job) => {
                  const statusMeta = JOB_STATUS_META[job.jobStatus];

                  return (
                    <Card
                      key={job.id}
                      shadow="sm"
                      className="border border-zinc-200/70 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800/70 dark:bg-zinc-900/90"
                    >
                      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            {job.companyName}
                          </p>
                          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <Chip
                            color={statusMeta.color}
                            variant="flat"
                            className="uppercase"
                          >
                            {statusMeta.label}
                          </Chip>
                          <Chip
                            color="primary"
                            variant="flat"
                            startContent={
                              <FiBriefcase
                                className="h-3 w-3 ml-2 mr-1"
                                aria-hidden
                              />
                            }
                          >
                            {job.jobType}
                          </Chip>
                        </div>
                      </CardHeader>
                      <CardBody className="space-y-4">
                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                          {job.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <Chip
                            variant="flat"
                            className="w-max"
                            startContent={
                              <FiMapPin
                                className="h-3 w-3 ml-2 mr-1"
                                aria-hidden
                              />
                            }
                          >
                            {job.location}
                          </Chip>
                          <span className="flex items-center gap-1">
                            <FiClock className="h-3 w-3" aria-hidden />
                            {job.postedOn}
                          </span>
                        </div>
                      </CardBody>
                      <CardFooter className="flex flex-wrap justify-between gap-3">
                        <Button
                          as={NextLink}
                          href={`/jobs/${job.slug}`}
                          variant="light"
                          size="sm"
                          endContent={
                            <FiArrowRight className="h-4 w-4" aria-hidden />
                          }
                        >
                          View listing
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            as={NextLink}
                            href={`/jobs/${job.slug}/edit`}
                            variant="light"
                            size="sm"
                            startContent={
                              <FiEdit3 className="h-4 w-4" aria-hidden />
                            }
                          >
                            Edit
                          </Button>
                          <Button
                            color="danger"
                            variant="bordered"
                            size="sm"
                            onPress={() => requestRemoveListing(job)}
                            isDisabled={deletingJobId === job.id}
                            isLoading={deletingJobId === job.id}
                            startContent={
                              <FiTrash2 className="h-4 w-4" aria-hidden />
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              {totalJobs > PAGE_SIZE && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={(page) => setCurrentPage(page)}
                    showControls
                  />
                </div>
              )}
            </section>
          </>
        ) : null}

        {authLoading && !isAuthenticated ? (
          <Card className="border border-zinc-200/70 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-900/80">
            <CardBody className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <p className="font-medium text-zinc-700 dark:text-zinc-200">
                Checking your session…
              </p>
              <p>
                Hang tight while we verify your Supabase session and load your
                listings.
              </p>
            </CardBody>
          </Card>
        ) : null}
      </main>

      <Modal
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Remove listing?
              </ModalHeader>
              <ModalBody>
                <p>
                  {jobPendingDeletion
                    ? `Remove "${jobPendingDeletion.title}" permanently? This action cannot be undone.`
                    : "Remove this listing permanently? This action cannot be undone."}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    void confirmRemoveListing();
                    onClose();
                  }}
                  isLoading={
                    jobPendingDeletion
                      ? deletingJobId === jobPendingDeletion.id
                      : false
                  }
                >
                  Delete listing
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
