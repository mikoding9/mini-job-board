"use client";

import { useEffect } from "react";
import { Provider as JotaiProvider, useSetAtom } from "jotai";
import { HeroUIProvider } from "@heroui/react";
import { authStateAtom } from "@/atoms/auth";
import { supabaseClient } from "@/lib/supabase-client";

function AuthListener() {
  const setAuthState = useSetAtom(authStateAtom);

  useEffect(() => {
    let isMounted = true;

    const syncState = (loading: boolean) => {
      setAuthState((previous) => ({
        ...previous,
        loading,
      }));
    };

    const updateState = (
      session: Awaited<
        ReturnType<typeof supabaseClient.auth.getSession>
      >["data"]["session"],
    ) => {
      if (!isMounted) {
        return;
      }
      setAuthState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    };

    syncState(true);

    supabaseClient.auth.getSession().then(({ data }) => {
      updateState(data.session);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      updateState(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setAuthState]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <HeroUIProvider>
        <AuthListener />
        {children}
      </HeroUIProvider>
    </JotaiProvider>
  );
}
