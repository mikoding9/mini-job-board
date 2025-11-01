"use client";

import { FormEvent, useMemo } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
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
  FiUserPlus,
} from "react-icons/fi";
import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";

export default function SignInPage() {
  const router = useRouter();

  const submittingAtom = useMemo(() => atom(false), []);
  const [isSubmitting, setIsSubmitting] = useAtom(submittingAtom);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());
    const rawEmail = entries.email;
    const rawPassword = entries.password;

    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const password = typeof rawPassword === "string" ? rawPassword : "";

    if (!email || !password) {
      showErrorToast({
        title: "Sign in failed",
        description: "Please enter both an email and password.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showErrorToast({
          title: "Sign in failed",
          description: error.message,
        });
        return;
      }

      showSuccessToast({
        title: "Welcome back",
        description: "Signed in successfully.",
      });
      form.reset();
      router.replace("/jobs");
    } catch (error) {
      showErrorToast({
        title: "Sign in failed",
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
        <Card className="w-full max-w-md border border-zinc-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/90">
          <CardHeader className="flex flex-col gap-2 text-center">
            <span className="text-sm font-semibold text-blue-600">
              Hiring portal
            </span>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Sign in to manage postings
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Update job details, review applicant interest, and launch new
              roles anytime.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Job seekers can browse and apply without creating an account.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
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
              <Input
                isRequired
                label="Password"
                placeholder="••••••••"
                type="password"
                name="password"
                isDisabled={isSubmitting}
                startContent={
                  <FiLock className="h-4 w-4 text-zinc-400" aria-hidden />
                }
              />
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <Checkbox
                  name="rememberMe"
                  value="on"
                  className="text-zinc-600 dark:text-zinc-300"
                  isDisabled={isSubmitting}
                >
                  Remember me
                </Checkbox>
                <Link as={NextLink} href="#" color="primary" size="sm">
                  Forgot password?
                </Link>
              </div>
              <Button
                color="primary"
                type="submit"
                className="w-full"
                isDisabled={isSubmitting}
                isLoading={isSubmitting}
                startContent={<FiLogIn className="h-4 w-4" aria-hidden />}
              >
                Sign in
              </Button>
            </form>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                as={NextLink}
                href="/sign-up"
                color="primary"
                size="sm"
                className="inline-flex items-center gap-1 align-middle"
              >
                <FiUserPlus className="h-4 w-4" aria-hidden />
                Create a hiring account
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
              Listings are always public—return to the board
            </Link>
          </CardBody>
        </Card>
      </div>
    </AuthRedirectGuard>
  );
}
