"use client";

import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  fetchPublishedJobFilters,
  fetchPublishedJobsPage,
  type PublishedJobsPageResult,
} from "@/lib/jobs";
import { supabaseClient } from "@/lib/supabase-client";
import { authStateAtom } from "@/atoms/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import type { Job } from "@/types/jobs";
import { deleteJob } from "@/lib/job-mutations";

const toSelectedKeys = (value: string): Selection => new Set([value]);
const getValueFromSelection = (keys: Selection): string => {
  if (keys === "all") {
    return "all";
  }
  const [value] = Array.from(keys);
  return value ? String(value) : "all";
};

const PAGE_SIZE = 5;

export default function Home() {
  const authState = useAtomValue(authStateAtom);
  const isAuthenticated = Boolean(authState.user);
  const currentUserId = authState.user?.id ?? null;
  const [locationKeys, setLocationKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [jobTypeKeys, setJobTypeKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [jobPendingDeletion, setJobPendingDeletion] = useState<Job | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedLocation = useMemo(
    () => getValueFromSelection(locationKeys),
    [locationKeys],
  );
  const selectedJobType = useMemo(
    () => getValueFromSelection(jobTypeKeys),
    [jobTypeKeys],
  );

  const posterIdFilter =
    showMineOnly && currentUserId ? currentUserId : null;
  const locationFilter = selectedLocation === "all" ? null : selectedLocation;
  const jobTypeFilter = selectedJobType === "all" ? null : selectedJobType;

  const {
    data: jobPage,
    error,
    isLoading,
    mutate: mutateJobs,
  } = useSWR<PublishedJobsPageResult>(
    ["jobs/published", currentPage, locationFilter, jobTypeFilter, posterIdFilter],
    ([, page, location, jobType, posterId]) =>
      fetchPublishedJobsPage({
        page,
        pageSize: PAGE_SIZE,
        location: location ?? undefined,
        jobType: jobType ?? undefined,
        posterId: posterId ?? undefined,
      }),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setShowMineOnly(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedJobType, showMineOnly]);

  const {
    data: filterOptions,
    mutate: mutateFilters,
  } = useSWR(
    ["jobs/published/filters", posterIdFilter],
    ([, posterId]) =>
      fetchPublishedJobFilters({
        posterId: posterId ?? undefined,
      }),
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
        description: "You can keep browsing public listings.",
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

  const openRolesCount = totalJobs;
  const showEmptyState = !isLoading && !error && totalJobs === 0;
  const emptyStateMessage =
    showMineOnly && isAuthenticated
      ? "You haven't published any listings yet. Post your first role to see it here."
      : "No roles match your filters right now. Adjust filters or add a fresh posting to reach new candidates.";

  const resetFilters = () => {
    setLocationKeys(toSelectedKeys("all"));
    setJobTypeKeys(toSelectedKeys("all"));
    setShowMineOnly(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-12 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navbar maxWidth="full" className="mx-auto max-w-5xl bg-transparent px-6">
        <NavbarBrand className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          Mini Job Board
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-3">
          {isAuthenticated ? (
            <>
              <NavbarItem>
                <Button as={NextLink} href="/jobs/new" color="primary">
                  Post a role
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  variant="light"
                  onPress={handleSignOut}
                  isDisabled={isSigningOut}
                  isLoading={isSigningOut}
                >
                  Sign out
                </Button>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem>
                <Button as={NextLink} href="/sign-in" variant="light">
                  Sign in
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button as={NextLink} href="/sign-up" color="primary">
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
            Built for hiring teams
          </Chip>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
            Reach engaged candidates faster
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-600 dark:text-zinc-400 md:mx-0">
            Publish roles in minutes and showcase them to a community of product
            builders browsing freely. Highlight location and role details so the
            right applicants can discover you at a glance.
          </p>
        </section>

        <Card className="border border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/80">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Preview live listings
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Filter by location or role type to see how candidates experience
                the board.
              </p>
            </div>
            {(selectedLocation !== "all" || selectedJobType !== "all") && (
              <Button size="sm" variant="light" onPress={resetFilters}>
                Clear filters
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-4">
            {isAuthenticated && (
              <div className="flex justify-between">
                <Checkbox
                  size="sm"
                  className="text-sm text-zinc-600 dark:text-zinc-300"
                  isSelected={showMineOnly}
                  onValueChange={setShowMineOnly}
                >
                  Show only my listings
                </Checkbox>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Location"
                placeholder="All locations"
                selectedKeys={locationKeys}
                onSelectionChange={setLocationKeys}
                selectionMode="single"
              >
                <SelectItem key="all">All locations</SelectItem>
                {jobLocations.map((location) => (
                  <SelectItem key={location}>{location}</SelectItem>
                ))}
              </Select>
              <Select
                label="Job type"
                placeholder="All job types"
                selectedKeys={jobTypeKeys}
                onSelectionChange={setJobTypeKeys}
                selectionMode="single"
              >
                <SelectItem key="all">All job types</SelectItem>
                {jobTypes.map((jobType) => (
                  <SelectItem key={jobType}>{jobType}</SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        <section className="space-y-4 pb-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {openRolesCount} open {openRolesCount === 1 ? "role" : "roles"}
            </h2>
            <Link
              as={NextLink}
              href={isAuthenticated ? "/jobs/new" : "/sign-up"}
              color="primary"
              className="text-sm"
            >
              Post a new role
            </Link>
          </div>

          <div className="grid gap-4">
            {isLoading && (
              <Card className="border border-zinc-200/70 bg-white/80 dark:border-zinc-800/70 dark:bg-zinc-900/80">
                <CardBody className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <p className="font-medium text-zinc-700 dark:text-zinc-200">
                    Loading job listings…
                  </p>
                  <p>
                    We&apos;re fetching the latest published roles so you can
                    see how candidates experience the board.
                  </p>
                </CardBody>
              </Card>
            )}

            {error && (
              <Card className="border border-red-200 bg-red-50/70 dark:border-red-800/70 dark:bg-red-950/30">
                <CardBody className="space-y-2 text-sm text-red-700 dark:text-red-200">
                  <p className="font-medium">We couldn&apos;t load listings.</p>
                  <p>Refresh the page or check your Supabase credentials.</p>
                </CardBody>
              </Card>
            )}

            {showEmptyState && (
              <Card className="border border-dashed border-zinc-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/80">
                <CardBody className="items-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {emptyStateMessage}
                </CardBody>
              </Card>
            )}

            {paginatedJobs.map((job) => (
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
                  <Chip color="primary" variant="flat">
                    {job.jobType}
                  </Chip>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.description}
                  </p>
                  <Chip variant="flat" className="w-max">
                    {job.location}
                  </Chip>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {job.postedOn}
                  </p>
                </CardBody>
                <CardFooter className="flex flex-wrap justify-between gap-3">
                  <Button
                    as={NextLink}
                    href={`/jobs/${job.slug}`}
                    color="primary"
                    variant="flat"
                    size="sm"
                    endContent={<span aria-hidden="true">→</span>}
                  >
                    View details
                  </Button>
                  {isAuthenticated && job.posterId === currentUserId && (
                    <div className="flex gap-2">
                      <Button
                        as={NextLink}
                        href={`/jobs/${job.slug}/edit`}
                        variant="light"
                        size="sm"
                      >
                        Edit listing
                      </Button>
                      <Button
                        color="danger"
                        variant="bordered"
                        size="sm"
                        onPress={() => requestRemoveListing(job)}
                        isDisabled={deletingJobId === job.id}
                        isLoading={deletingJobId === job.id}
                      >
                        Remove listing
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
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
