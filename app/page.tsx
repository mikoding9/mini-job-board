"use client";

import NextLink from "next/link";
import { useMemo, useState } from "react";
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
  Select,
  SelectItem,
} from "@heroui/react";
import { JOB_LOCATIONS, JOB_POSTINGS, JOB_TYPES } from "@/data/job-postings";

const toSelectedKeys = (value: string): Selection => new Set([value]);
const getValueFromSelection = (keys: Selection): string => {
  if (keys === "all") {
    return "all";
  }
  const [value] = Array.from(keys);
  return value ? String(value) : "all";
};

export default function Home() {
  const [locationKeys, setLocationKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );
  const [jobTypeKeys, setJobTypeKeys] = useState<Selection>(
    toSelectedKeys("all"),
  );

  const selectedLocation = useMemo(
    () => getValueFromSelection(locationKeys),
    [locationKeys],
  );
  const selectedJobType = useMemo(
    () => getValueFromSelection(jobTypeKeys),
    [jobTypeKeys],
  );

  const filteredJobs = useMemo(() => {
    return JOB_POSTINGS.filter((job) => {
      const matchesLocation =
        selectedLocation === "all" || job.location === selectedLocation;
      const matchesJobType =
        selectedJobType === "all" || job.jobType === selectedJobType;
      return matchesLocation && matchesJobType;
    });
  }, [selectedJobType, selectedLocation]);

  const resetFilters = () => {
    setLocationKeys(toSelectedKeys("all"));
    setJobTypeKeys(toSelectedKeys("all"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-12 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navbar maxWidth="full" className="mx-auto max-w-5xl bg-transparent px-6">
        <NavbarBrand className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
          Mini Job Board
        </NavbarBrand>
        <NavbarContent justify="end" className="gap-3">
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
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Location"
                placeholder="All locations"
                selectedKeys={locationKeys}
                onSelectionChange={setLocationKeys}
                selectionMode="single"
              >
                <SelectItem key="all">All locations</SelectItem>
                {JOB_LOCATIONS.map((location) => (
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
                {JOB_TYPES.map((jobType) => (
                  <SelectItem key={jobType}>{jobType}</SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        <section className="space-y-4 pb-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {filteredJobs.length} open{" "}
              {filteredJobs.length === 1 ? "role" : "roles"}
            </h2>
            <Link
              as={NextLink}
              href="/sign-up"
              color="primary"
              className="text-sm"
            >
              Post a new role
            </Link>
          </div>

          <div className="grid gap-4">
            {filteredJobs.length === 0 && (
              <Card className="border border-dashed border-zinc-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/80">
                <CardBody className="items-center text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No roles match your filters right now. Adjust filters or add a
                  fresh posting to reach new candidates.
                </CardBody>
              </Card>
            )}

            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                shadow="sm"
                className="border border-zinc-200/70 bg-white/90 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800/70 dark:bg-zinc-900/90"
              >
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {job.company}
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
                </CardBody>
                <CardFooter className="flex flex-wrap gap-3">
                  <Button
                    as={NextLink}
                    href="/sign-in"
                    variant="light"
                    size="sm"
                  >
                    Manage listing
                  </Button>
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
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
