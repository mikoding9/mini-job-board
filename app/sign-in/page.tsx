"use client";

import NextLink from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
  Link,
} from "@heroui/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
          <form className="space-y-5">
            <Input
              isRequired
              label="Email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onValueChange={setEmail}
            />
            <Input
              isRequired
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onValueChange={setPassword}
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
            <Button color="primary" type="submit" className="w-full">
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
