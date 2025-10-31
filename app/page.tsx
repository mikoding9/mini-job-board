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
  Chip,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Pagination,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiArrowRight,
  FiBriefcase,
  FiFilter,
  FiLayers,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiPlus,
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
  const [locationKeys, setLocationKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [jobTypeKeys, setJobTypeKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const accessToken = authState.session?.access_token ?? null;
  const selectedLocation = useMemo(
    () => getValueFromSelection(locationKeys),
    [locationKeys],
  );
  const selectedJobType = useMemo(
    () => getValueFromSelection(jobTypeKeys),
    [jobTypeKeys],
  );

  const heroChipLabel = "For job seekers";
  const heroTitle = "Discover your next opportunity";
  const heroSubtitle =
    "Browse curated listings from product-minded teams and uncover a role that matches your craft.";
  const filterHeading = "Tailor your search";
  const filterDescription =
    "Fine-tune the board by city or role type to surface the openings that fit you best.";
  const postLinkLabel = isAuthenticated
    ? "Manage your listings"
    : "Post a role (free for teams)";
  const postLinkHref = isAuthenticated ? "/jobs" : "/sign-up";
  const PostLinkIcon = isAuthenticated ? FiBriefcase : FiPlus;

  const locationFilter = selectedLocation === "all" ? null : selectedLocation;
  const jobTypeFilter = selectedJobType === "all" ? null : selectedJobType;

  type PublishedJobsKey = [
    "jobs/published",
    number,
    string | null,
    string | null,
    "auth" | "anon",
  ];

  const fetchPublishedJobs = useCallback(
    ([, page, location, jobType]: PublishedJobsKey) =>
      fetchPublishedJobsPage({
        page,
        pageSize: PAGE_SIZE,
        location: location ?? undefined,
        jobType: jobType ?? undefined,
        accessToken: accessToken ?? undefined,
      }),
    [accessToken],
  );

  const { data: jobPage, error, isLoading } = useSWR<PublishedJobsPageResult>(
    [
      "jobs/published",
      currentPage,
      locationFilter,
      jobTypeFilter,
      accessToken ? "auth" : "anon",
    ],
    fetchPublishedJobs,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedJobType]);

  const fetchPublishedJobFiltersFetcher = useCallback(() => {
    return fetchPublishedJobFilters({
      accessToken: accessToken ?? undefined,
    });
  }, [accessToken]);

  const { data: filterOptions } = useSWR(
    ["jobs/published/filters", accessToken ? "auth" : "anon"],
    fetchPublishedJobFiltersFetcher,
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

  const totalJobs = jobPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedJobs = jobPage?.jobs ?? [];

  const openRolesCount = totalJobs;
  const openRolesHeading = `Explore ${openRolesCount} open ${
    openRolesCount === 1 ? "role" : "roles"
  }`;
  const showEmptyState = !isLoading && !error && totalJobs === 0;
  const emptyStateMessage =
    "No roles match your filters right now. Adjust filters or check back soon.";

  const resetFilters = () => {
    setLocationKeys(toSelectedKeys("all"));
    setJobTypeKeys(toSelectedKeys("all"));
  };

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
                  href="/jobs"
                  variant="light"
                  startContent={<FiBriefcase className="h-4 w-4" aria-hidden />}
                >
                  Manage jobs
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  color="primary"
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

        <Card className="border border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/80">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                <span className="flex items-center gap-2">
                  <FiFilter
                    className="h-5 w-5 text-primary-500 dark:text-primary-400"
                    aria-hidden
                  />
                  {filterHeading}
                </span>
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {filterDescription}
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
              href={postLinkHref}
              color="primary"
              className="flex items-center gap-2 text-sm"
            >
              <PostLinkIcon className="h-4 w-4" aria-hidden />
              {postLinkLabel}
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
                  <Chip
                    color="primary"
                    variant="flat"
                    startContent={
                      <FiBriefcase className="h-3 w-3 ml-2 mr-1" aria-hidden />
                    }
                  >
                    {job.jobType}
                  </Chip>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.description}
                  </p>
                  <Chip
                    variant="flat"
                    className="w-max"
                    startContent={
                      <FiMapPin className="h-3 w-3 ml-2 mr-1" aria-hidden />
                    }
                  >
                    {job.location}
                  </Chip>
                  <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <FiClock className="h-3 w-3" aria-hidden />
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
                    endContent={
                      <FiArrowRight className="h-4 w-4" aria-hidden />
                    }
                  >
                    View details
                  </Button>
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
    </div>
  );
}
