"use server";

import { redirect } from "next/navigation";
import { authConfigured } from "./family";
import { createClient } from "./supabase/server";

export async function signOut() {
  if (authConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
