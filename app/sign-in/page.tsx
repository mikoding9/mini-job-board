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

export default function SignInPage() {
  const router = useRouter();
  const authState = useAtomValue(authStateAtom);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authState.loading && authState.user) {
      router.replace("/");
    }
  }, [authState, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both an email and password.");
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
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Signed in successfully. Redirecting…");
      setIsSubmitting(false);
      router.replace("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
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
            />
            <Input
              isRequired
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onValueChange={setPassword}
              isDisabled={isSubmitting}
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
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            )}
            <Button
              color="primary"
              type="submit"
              className="w-full"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link as={NextLink} href="/sign-up" color="primary" size="sm">
              Create a hiring account
            </Link>
          </p>
          <Link
            as={NextLink}
            href="/"
            color="foreground"
            underline="always"
            className="mx-auto block w-max text-xs font-medium text-zinc-500 dark:text-zinc-400"
          >
            Listings are always public—return to the board
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
