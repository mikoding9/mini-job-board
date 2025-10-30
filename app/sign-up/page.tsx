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

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantsNewsletter, setWantsNewsletter] = useState(true);

  return (
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
            Create a hiring account to launch listings in minutes, update roles
            on the fly, and monitor applicant interest.
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          <form className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                isRequired
                label="Full name"
                placeholder="Alex Rivera"
                value={fullName}
                onValueChange={setFullName}
              />
              <Input
                isRequired
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onValueChange={setEmail}
              />
            </div>
            <Input
              isRequired
              label="Password"
              placeholder="Create a strong password"
              type="password"
              value={password}
              onValueChange={setPassword}
            />
            <Checkbox
              isSelected={wantsNewsletter}
              onValueChange={setWantsNewsletter}
              classNames={{
                base: "rounded-2xl border border-zinc-200/70 p-4 dark:border-zinc-700/70",
                label: "text-left text-sm text-zinc-600 dark:text-zinc-300",
              }}
            >
              Send me weekly hiring insights, candidate spotlights, and product
              updates.
            </Checkbox>
            <Button color="primary" type="submit" className="w-full mt-6">
              Create hiring account
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link as={NextLink} href="/sign-in" color="primary" size="sm">
              Sign in
            </Link>
          </p>
          <Link
            as={NextLink}
            href="/"
            color="foreground"
            underline="always"
            className="mx-auto block w-max text-xs font-medium text-zinc-500 dark:text-zinc-400"
          >
            Listings stay public—return to the board
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
