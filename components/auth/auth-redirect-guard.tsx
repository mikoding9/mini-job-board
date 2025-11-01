"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { authStateAtom } from "@/atoms/auth";

interface AuthRedirectGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function AuthRedirectGuard({
  children,
  redirectTo = "/jobs",
}: AuthRedirectGuardProps) {
  const router = useRouter();
  const authState = useAtomValue(authStateAtom);

  useEffect(() => {
    if (!authState.loading && authState.user) {
      router.replace(redirectTo);
    }
  }, [authState, redirectTo, router]);

  return <>{children}</>;
}
