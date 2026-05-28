"use client";

import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal.jsx";

export default function LandingAuth() {
  const router = useRouter();

  return <AuthModal inline onSuccess={() => router.push("/dashboard")} />;
}
