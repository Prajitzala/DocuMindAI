import { redirect } from "next/navigation";
import AccessDenied from "../../components/layout/AccessDenied.jsx";
import AdminPageClient from "../../components/AdminPageClient.jsx";
import { createClient } from "../../lib/supabase-server.js";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const isAdmin = user.user_metadata?.role === "admin";

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminPageClient userEmail={user.email ?? ""} />;
}
