"use client";

import { useRouter } from "next/navigation";
import AdminLayout from "./layout/AdminLayout.jsx";
import AdminPanel from "./AdminPanel.jsx";
import { createClient } from "../lib/supabase.js";

export default function AdminPageClient({ userEmail }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AdminLayout userEmail={userEmail} onSignOut={handleSignOut}>
      <AdminPanel />
    </AdminLayout>
  );
}
