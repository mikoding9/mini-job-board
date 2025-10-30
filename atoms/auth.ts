"use client";

import { atom } from "jotai";
import type { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export const authStateAtom = atom<AuthState>({
  user: null,
  session: null,
  loading: true,
});
