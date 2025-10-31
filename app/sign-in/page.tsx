"use client";

import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Link,
} from "@heroui/react";
import { authStateAtom } from "@/atoms/auth";
import { supabaseClient } from "@/lib/supabase-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import {
  FiArrowLeft,
  FiLock,
  FiLogIn,
  FiMail,
  FiUserPlus,
} from "react-icons/fi";

export default function SignInPage() {
  const router = useRouter();
  const authState = useAtomValue(authStateAtom);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authState.loading && authState.user) {
      router.replace("/jobs");
    }
  }, [authState, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      showErrorToast({
        title: "Sign in failed",
        description: "Please enter both an email and password.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: trimmedEmail,
        password,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        showErrorToast({
          title: "Sign in failed",
          description: error.message,
        });
        setIsSubmitting(false);
        return;
      }

      showSuccessToast({
        title: "Welcome back",
        description: "Signed in successfully.",
      });
      setIsSubmitting(false);
      router.replace("/jobs");
    } catch (error) {
      showErrorToast({
        title: "Sign in failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
      setIsSubmitting(false);
    }
  };

  return (
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
            Update job details, review applicant interest, and launch new roles
            anytime.
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
              value={email}
              onValueChange={setEmail}
              isDisabled={isSubmitting}
              startContent={<FiMail className="h-4 w-4 text-zinc-400" aria-hidden />}
            />
            <Input
              isRequired
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onValueChange={setPassword}
              isDisabled={isSubmitting}
              startContent={<FiLock className="h-4 w-4 text-zinc-400" aria-hidden />}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <Checkbox
                isSelected={rememberMe}
                onValueChange={setRememberMe}
                className="text-zinc-600 dark:text-zinc-300"
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
  );
}
