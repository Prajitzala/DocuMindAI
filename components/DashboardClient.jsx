"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import AppShell from "./layout/AppShell.jsx";
import ChatWindow from "./ChatWindow.jsx";
import NamespaceSelector from "./NamespaceSelector.jsx";
import PDFUploader from "./PDFUploader.jsx";
import UserPDFList from "./UserPDFList.jsx";
import { createClient } from "../lib/supabase.js";
import { dm } from "@/lib/design";

const NAMESPACES = [
  "user-upload",
  "kb-hr",
  "kb-legal",
  "kb-engineering",
];

function emptyChatState() {
  return { messages: [], input: "", error: null };
}

function emptyChatsByNamespace() {
  return Object.fromEntries(
    NAMESPACES.map((namespace) => [namespace, emptyChatState()]),
  );
}

export default function DashboardClient({ userEmail, isAdmin = false }) {
  const router = useRouter();
  const [selectedNamespace, setSelectedNamespace] = useState("user-upload");
  const [chatsByNamespace, setChatsByNamespace] = useState(emptyChatsByNamespace);
  const [userDocuments, setUserDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);

  const isUserUpload = selectedNamespace === "user-upload";

  const fetchUserDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const response = await fetch("/api/documents");
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to load documents");
      }

      setUserDocuments(data.documents ?? []);
    } catch (err) {
      setDocumentsError(
        err instanceof Error ? err.message : "Failed to load documents",
      );
      setUserDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUserDocuments();
  }, [fetchUserDocuments]);

  const updateChatForNamespace = useCallback((namespace, updater) => {
    setChatsByNamespace((prev) => {
      const current = prev[namespace] ?? emptyChatState();
      const next =
        typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [namespace]: next };
    });
  }, []);

  const clearChatForNamespace = useCallback((namespace) => {
    setChatsByNamespace((prev) => ({
      ...prev,
      [namespace]: emptyChatState(),
    }));
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUploadComplete = () => {
    fetchUserDocuments();
  };

  const handleDocumentDelete = () => {
    clearChatForNamespace("user-upload");
  };

  return (
    <AppShell
      userEmail={userEmail}
      onSignOut={handleSignOut}
      headerExtra={
        isAdmin ? (
          <Link
            href="/admin"
            className={`inline-flex items-center gap-1.5 ${dm.link}`}
            title="Knowledge base admin"
          >
            <Settings className="size-4" aria-hidden />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        ) : null
      }
      sidebar={
        <NamespaceSelector
          selected={selectedNamespace}
          onSelect={setSelectedNamespace}
        />
      }
    >
      {isUserUpload ? (
        <div className="shrink-0 border-b border-slate-800/80 p-4 sm:p-5">
          <UserPDFList
            documents={userDocuments}
            loading={documentsLoading}
            error={documentsError}
            onDelete={handleDocumentDelete}
            onRefresh={fetchUserDocuments}
          />
          <PDFUploader
            namespace={selectedNamespace}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <ChatWindow
          namespace={selectedNamespace}
          chatState={chatsByNamespace[selectedNamespace] ?? emptyChatState()}
          onChatStateChange={(updater) =>
            updateChatForNamespace(selectedNamespace, updater)
          }
        />
      </div>
    </AppShell>
  );
}
