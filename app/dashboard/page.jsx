import { redirect } from "next/navigation";
import DashboardClient from "../../components/DashboardClient.jsx";
import { createClient } from "../../lib/supabase-server.js";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const isAdmin = user.user_metadata?.role === "admin";

  return (
    <DashboardClient userEmail={user.email ?? ""} isAdmin={isAdmin} />
  );
}
