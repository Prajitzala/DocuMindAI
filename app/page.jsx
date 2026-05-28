import { redirect } from "next/navigation";
import LandingPage from "../components/landing/LandingPage.jsx";
import { createClient } from "../lib/supabase-server.js";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
