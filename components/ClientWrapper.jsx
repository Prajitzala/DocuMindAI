"use client";

import { useEffect } from "react";
import { createClient } from "../lib/supabase.js";

export default function ClientWrapper({ children }) {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {});

    return () => subscription.unsubscribe();
  }, []);

  return children;
}
