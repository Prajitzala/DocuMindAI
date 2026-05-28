"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import SourceCitation from "./SourceCitation.jsx";
import { dm } from "@/lib/design";

function parseSseData(raw) {
  const lines = raw.split("\n");
  const parts = [];

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      parts.push(line.slice(6));
    } else if (line.startsWith("data:")) {
      parts.push(line.slice(5).trimStart());
    }
  }

  return parts.join("\n");
}

async function consumeChatStream(reader, onToken) {
  const decoder = new TextDecoder();
  let buffer = "";
  let sources = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const data = parseSseData(event.trim());
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (Array.isArray(parsed.sources)) {
          sources = parsed.sources;
          continue;
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          onToken(data);
        } else {
          throw error;
        }
      }
    }
  }

  if (buffer.trim()) {
    const data = parseSseData(buffer.trim());
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (Array.isArray(parsed.sources)) {
          sources = parsed.sources;
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          onToken(data);
        } else {
          throw error;
        }
      }
    }
  }

  return sources;
}

const defaultChatState = () => ({
  messages: [],
  input: "",
  error: null,
});

export default function ChatWindow({ namespace, chatState, onChatStateChange }) {
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const { messages, input, error } = chatState ?? defaultChatState();

  const patchChatState = useCallback(
    (patch) => {
      onChatStateChange?.((prev) => ({
        ...(prev ?? defaultChatState()),
        ...patch,
      }));
    },
    [onChatStateChange],
  );

  const setMessages = useCallback(
    (updater) => {
      onChatStateChange?.((prev) => {
        const current = prev ?? defaultChatState();
        const nextMessages =
          typeof updater === "function" ? updater(current.messages) : updater;
        return { ...current, messages: nextMessages };
      });
    },
    [onChatStateChange],
  );

  const setInput = useCallback(
    (value) => patchChatState({ input: value }),
    [patchChatState],
  );

  const setError = useCallback(
    (value) => patchChatState({ error: value }),
    [patchChatState],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const updateLastAssistant = useCallback(
    (updater) => {
      setMessages((prev) => {
        const next = [...prev];
        const lastIndex = next.length - 1;
        if (lastIndex < 0 || next[lastIndex].role !== "assistant") {
          return prev;
        }
        next[lastIndex] = updater(next[lastIndex]);
        return next;
      });
    },
    [setMessages],
  );

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, namespace }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Chat request failed");
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const sources = await consumeChatStream(reader, (token) => {
        updateLastAssistant((msg) => ({
          ...msg,
          content: msg.content + token,
        }));
      });

      updateLastAssistant((msg) => ({
        ...msg,
        streaming: false,
        sources,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Chat request failed";
      setError(message);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last.streaming && !last.content) {
          next.pop();
        } else if (last?.role === "assistant" && last.streaming) {
          next[next.length - 1] = {
            ...last,
            streaming: false,
            content: last.content || "Something went wrong.",
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [
    input,
    loading,
    namespace,
    updateLastAssistant,
    setMessages,
    setError,
    setInput,
  ]);

  const onSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-800/80">
              <MessageSquare className="size-6 text-slate-500" aria-hidden />
            </div>
            <p className="font-[family-name:var(--font-heading)] text-sm font-medium text-slate-300">
              Ask a question about your documents
            </p>
            <p className={`mt-1 max-w-xs text-sm ${dm.muted}`}>
              Answers stream in real time with source citations.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[75%] ${
                  isUser
                    ? "bg-[#2563eb] text-white"
                    : "border border-slate-800/80 bg-slate-900/60 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                  {message.streaming && (
                    <span
                      className="ml-1 inline-block animate-pulse text-slate-400"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  )}
                </p>
                {!isUser && !message.streaming && (
                  <SourceCitation sources={message.sources} />
                )}
              </div>
            </div>
          );
        })}

        {error && (
          <p className={dm.alertError} role="alert">
            {error}
          </p>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-slate-800/80 bg-[#0b0f14]/80 p-4 backdrop-blur-sm sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question…"
            disabled={loading}
            className={dm.input}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`${dm.btnPrimary} inline-flex items-center gap-1.5 px-3 sm:px-4`}
            aria-label="Send message"
          >
            <Send className="size-4" aria-hidden />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
