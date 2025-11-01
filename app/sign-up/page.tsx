"use client";

import { FormEvent, useMemo } from "react";
import NextLink from "next/link";
import { atom, useAtom } from "jotai";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Link,
} from "@heroui/react";
import { supabaseClient } from "@/lib/supabase-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import {
  FiArrowLeft,
  FiLock,
  FiLogIn,
  FiMail,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";

export default function SignUpPage() {
  const submittingAtom = useMemo(() => atom(false), []);
  const [isSubmitting, setIsSubmitting] = useAtom(submittingAtom);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    const rawName = entries.fullName;
    const rawEmail = entries.email;
    const rawPassword = entries.password;

    const trimmedName = typeof rawName === "string" ? rawName.trim() : "";
    const trimmedEmail =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const password = typeof rawPassword === "string" ? rawPassword : "";
    const wantsNewsletter = formData.has("wantsNewsletter");

    if (!trimmedName) {
      showErrorToast({
        title: "Sign-up incomplete",
        description:
          "Please provide your name so we can personalize your account.",
      });
      return;
    }

    if (!trimmedEmail || !password) {
      showErrorToast({
        title: "Sign-up incomplete",
        description: "Email and password are required.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectOrigin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const { error } = await supabaseClient.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirectOrigin
            ? `${redirectOrigin}/sign-in`
            : undefined,
          data: {
            full_name: trimmedName,
            wants_newsletter: wantsNewsletter,
          },
        },
      });

      if (error) {
        showErrorToast({
          title: "Sign-up failed",
          description: error.message,
        });
        return;
      }

      showSuccessToast({
        title: "Check your inbox",
        description:
          "Confirm your email to finish setting up your hiring account.",
      });
      form.reset();
    } catch (error) {
      showErrorToast({
        title: "Sign-up failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthRedirectGuard>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <Card className="w-full max-w-xl space-y-6 border border-zinc-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
          <CardHeader className="flex flex-col gap-2 text-center">
            <span className="text-sm font-semibold text-blue-600">
              Hiring portal access
            </span>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Publish and manage your job postings
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Create a hiring account to launch listings in minutes, update
              roles on the fly, and monitor applicant interest.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Job seekers can explore current openings without signing up.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  isRequired
                  label="Full name"
                  placeholder="Alex Rivera"
                  name="fullName"
                  isDisabled={isSubmitting}
                  startContent={
                    <FiUser className="h-4 w-4 text-zinc-400" aria-hidden />
                  }
                />
                <Input
                  isRequired
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  name="email"
                  isDisabled={isSubmitting}
                  startContent={
                    <FiMail className="h-4 w-4 text-zinc-400" aria-hidden />
                  }
                />
              </div>
              <Input
                isRequired
                label="Password"
                placeholder="Create a strong password"
                type="password"
                name="password"
                isDisabled={isSubmitting}
                startContent={
                  <FiLock className="h-4 w-4 text-zinc-400" aria-hidden />
                }
              />
              <Checkbox
                name="wantsNewsletter"
                value="yes"
                defaultSelected
                classNames={{
                  base: "rounded-2xl border border-zinc-200/70 p-4 dark:border-zinc-700/70",
                  label: "text-left text-sm text-zinc-600 dark:text-zinc-300",
                }}
                isDisabled={isSubmitting}
              >
                Send me weekly hiring insights, candidate spotlights, and
                product updates.
              </Checkbox>
              <Button
                color="primary"
                type="submit"
                className="mt-6 w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                startContent={<FiUserPlus className="h-4 w-4" aria-hidden />}
              >
                Create hiring account
              </Button>
            </form>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                as={NextLink}
                href="/sign-in"
                color="primary"
                size="sm"
                className="inline-flex items-center gap-1 align-middle"
              >
                <FiLogIn className="h-4 w-4" aria-hidden />
                Sign in
              </Link>
            </p>
            <Link
              as={NextLink}
              href="/"
              color="foreground"
              underline="always"
              className="mx-auto flex w-max items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              <FiArrowLeft className="h-3 w-3" aria-hidden />
              Listings stay public—return to the board
            </Link>
          </CardBody>
        </Card>
      </div>
    </AuthRedirectGuard>
  );
}
