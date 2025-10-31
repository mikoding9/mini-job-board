"use client";

import NextLink from "next/link";
import { useAtomValue } from "jotai";
import {
  Accordion,
  AccordionItem,
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Link,
} from "@heroui/react";
import type { Job } from "@/types/jobs";
import { authStateAtom } from "@/atoms/auth";
import {
  FiArrowRight,
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiLogIn,
  FiMapPin,
  FiUserPlus,
  FiPlus,
} from "react-icons/fi";

type JobDetailClientProps = {
  job: Job;
};

const getCompanyInitials = (company: string) =>
  company
    .split(" ")
    .map((segment) => segment[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const companyInitials = getCompanyInitials(job.companyName);
  const authState = useAtomValue(authStateAtom);
  const isAuthenticated = Boolean(authState.user);
  const isOwner = isAuthenticated && authState.user?.id === job.posterId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pt-12">
        <Breadcrumbs size="sm" className="text-sm text-zinc-500">
          <BreadcrumbItem href="/">Jobs</BreadcrumbItem>
          <BreadcrumbItem>{job.title}</BreadcrumbItem>
        </Breadcrumbs>

        <Card className="border border-zinc-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
          <CardBody className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar
                  name={job.companyName}
                  className="h-12 w-12 min-w-12 border border-zinc-200 bg-white text-base font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  {companyInitials}
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {job.companyName}
                  </p>
                  <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Chip
                  variant="flat"
                  color="primary"
                  startContent={<FiBriefcase className="h-3 w-3" aria-hidden />}
                >
                  {job.jobType}
                </Chip>
                <Chip
                  variant="flat"
                  className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  startContent={<FiMapPin className="h-3 w-3" aria-hidden />}
                >
                  {job.location}
                </Chip>
                <span className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" aria-hidden />
                  {job.postedOn}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                as={
                  job.applicationUrl || job.applicationEmail ? "a" : undefined
                }
                href={
                  job.applicationUrl ??
                  (job.applicationEmail
                    ? `mailto:${job.applicationEmail}`
                    : undefined)
                }
                target={job.applicationUrl ? "_blank" : undefined}
                rel={job.applicationUrl ? "noopener noreferrer" : undefined}
                color="primary"
                className="w-full sm:w-auto"
                endContent={<FiExternalLink className="h-4 w-4" aria-hidden />}
              >
                Apply now
              </Button>
              {isOwner ? (
                <Button
                  as={NextLink}
                  href={`/jobs/${job.slug}/edit`}
                  variant="flat"
                  className="w-full sm:w-auto"
                  startContent={<FiEdit3 className="h-4 w-4" aria-hidden />}
                >
                  Edit listing
                </Button>
              ) : isAuthenticated ? (
                <Button
                  as={NextLink}
                  href="/jobs/new"
                  variant="flat"
                  className="w-full sm:w-auto"
                  startContent={<FiPlus className="h-4 w-4" aria-hidden />}
                >
                  Post another role
                </Button>
              ) : (
                <Button
                  as={NextLink}
                  href="/sign-up"
                  variant="flat"
                  className="w-full sm:w-auto"
                  startContent={<FiUserPlus className="h-4 w-4" aria-hidden />}
                >
                  Post a role
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="border border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
            <CardBody className="space-y-6">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Role overview
                </h2>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {job.overview}
                </p>
              </section>

              <Divider />

              <Accordion
                variant="splitted"
                selectionMode="multiple"
                defaultExpandedKeys={["responsibilities"]}
              >
                <AccordionItem
                  key="responsibilities"
                  aria-label="Responsibilities"
                  title="Responsibilities"
                >
                  <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.responsibilities.map((item) => (
                      <li key={item} className="flex gap-2">
                        <FiCheckCircle className="mt-1 h-4 w-4 text-primary-500 dark:text-primary-400" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
                <AccordionItem
                  key="requirements"
                  aria-label="Requirements"
                  title="Requirements"
                >
                  <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.requirements.map((item) => (
                      <li key={item} className="flex gap-2">
                        <FiCheckCircle className="mt-1 h-4 w-4 text-primary-500 dark:text-primary-400" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
                <AccordionItem
                  key="benefits"
                  aria-label="Benefits"
                  title="Benefits"
                >
                  <ul className="space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {job.benefits.map((item) => (
                      <li key={item} className="flex gap-2">
                        <FiCheckCircle className="mt-1 h-4 w-4 text-primary-500 dark:text-primary-400" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              </Accordion>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border border-zinc-200/70 bg-white/90 dark:border-zinc-800/70 dark:bg-zinc-900/90">
              <CardHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Job snapshot
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  What applicants see at a glance
                </p>
              </CardHeader>
              <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-xl border border-dashed border-zinc-200 p-3 text-sm dark:border-zinc-700">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <FiMapPin className="h-3 w-3 text-primary-500 dark:text-primary-400" aria-hidden />
                    Location
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {job.location}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-dashed border-zinc-200 p-3 text-sm dark:border-zinc-700">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <FiBriefcase className="h-3 w-3 text-primary-500 dark:text-primary-400" aria-hidden />
                    Job type
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {job.jobType}
                  </p>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-dashed border-zinc-200 p-3 text-sm dark:border-zinc-700 sm:col-span-2 lg:col-span-1">
                  <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <FiClock className="h-3 w-3 text-primary-500 dark:text-primary-400" aria-hidden />
                    Published
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    {job.postedOn}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-zinc-200/70 bg-white/90 dark:border-zinc-800/70 dark:bg-zinc-900/90">
              <CardHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  About the company
                </h2>
                <Chip
                  variant="flat"
                  size="sm"
                  startContent={<FiBriefcase className="h-3 w-3" aria-hidden />}
                >
                  {job.companyName}
                </Chip>
              </CardHeader>
              <CardBody className="space-y-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                <p>{job.aboutCompany}</p>
                <Divider />
                <Link
                  as={NextLink}
                  href="/"
                  color="primary"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  Browse more roles
                  <FiArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>

        <Card className="border border-zinc-200/70 bg-white/90 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
          <CardBody className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {isOwner
                  ? "You're viewing your listing"
                  : isAuthenticated
                    ? "Share another opportunity"
                    : "Hiring? Create a free account"}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isOwner
                  ? "Jump back into the editor to adjust details or refresh your posting."
                  : isAuthenticated
                    ? "Keep momentum by publishing more openings for the community."
                    : "Employers can post roles in minutes. Job seekers can always browse for free."}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {isOwner ? (
                <>
                  <Button
                    as={NextLink}
                    href={`/jobs/${job.slug}/edit`}
                    color="primary"
                    startContent={<FiEdit3 className="h-4 w-4" aria-hidden />}
                  >
                    Open editor
                  </Button>
                  <Button
                    as={NextLink}
                    href="/"
                    variant="flat"
                    startContent={<FiArrowLeft className="h-4 w-4" aria-hidden />}
                  >
                    Back to listings
                  </Button>
                </>
              ) : isAuthenticated ? (
                <>
                  <Button
                    as={NextLink}
                    href="/jobs/new"
                    color="primary"
                    startContent={<FiPlus className="h-4 w-4" aria-hidden />}
                  >
                    Post a new role
                  </Button>
                  <Button
                    as={NextLink}
                    href="/"
                    variant="flat"
                    startContent={<FiArrowLeft className="h-4 w-4" aria-hidden />}
                  >
                    Browse listings
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={NextLink}
                    href="/sign-up"
                    color="primary"
                    startContent={<FiUserPlus className="h-4 w-4" aria-hidden />}
                  >
                    Create hiring account
                  </Button>
                  <Button
                    as={NextLink}
                    href="/sign-in"
                    variant="flat"
                    startContent={<FiLogIn className="h-4 w-4" aria-hidden />}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
