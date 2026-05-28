"use client";

import LandingAuth from "../LandingAuth.jsx";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  FileText,
  MessageSquareQuote,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "PDF chat",
    description:
      "Upload documents and ask questions with answers grounded in your files.",
    icon: FileText,
    className: "md:col-span-2 md:row-span-2",
    accent: "from-blue-600/20 to-blue-600/5",
  },
  {
    title: "Company knowledge base",
    description: "Query HR, legal, and engineering namespaces in one place.",
    icon: Building2,
    className: "md:col-span-1",
    accent: "from-slate-500/20 to-slate-500/5",
  },
  {
    title: "Source citations",
    description: "Every answer links back to filename and page number.",
    icon: MessageSquareQuote,
    className: "md:col-span-1",
    accent: "from-violet-600/20 to-violet-600/5",
  },
  {
    title: "GPT-4o streaming",
    description: "Fast, streaming responses powered by OpenAI.",
    icon: Zap,
    className: "md:col-span-1",
    accent: "from-amber-500/20 to-amber-500/5",
  },
  {
    title: "Secure by default",
    description: "Supabase Auth and row-level security on every document.",
    icon: Shield,
    className: "md:col-span-1",
    accent: "from-emerald-600/20 to-emerald-600/5",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload or select",
    description: "Drop a PDF or pick a knowledge-base category.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Ask anything",
    description: "Natural-language questions across your content.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Get cited answers",
    description: "Streaming replies with traceable sources.",
    icon: MessageSquareQuote,
  },
];

function fadeUp(reduced, delay = 0) {
  return reduced
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
      };
}

export default function LandingPage() {
  const reduced = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f14] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.25),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-size-[4rem_4rem]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <a
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#2563eb] text-sm font-bold text-white">
            DM
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg">
            DocuMind AI
          </span>
        </a>
        <a
          href="#get-started"
          className="cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
        >
          Get started
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section className="grid items-start gap-12 pt-8 pb-20 lg:grid-cols-2 lg:gap-16 lg:pt-16">
          <motion.div {...fadeUp(reduced)}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="size-3.5 text-[#60a5fa]" aria-hidden />
              Unified RAG for teams
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Ask your documents.
              <span className="mt-1 block text-slate-400">
                Trust every answer.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Upload PDFs or query your company knowledge base — HR, legal,
              engineering — with GPT-4o streaming and source citations on every
              reply.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {["PDF upload chat", "KB namespaces", "Page-level citations"].map(
                (label) => (
                  <li
                    key={label}
                    className="rounded-full border border-slate-700/80 bg-slate-900/50 px-3 py-1.5 text-sm text-slate-300"
                  >
                    {label}
                  </li>
                ),
              )}
            </ul>
          </motion.div>

          <motion.div
            id="get-started"
            className="scroll-mt-24"
            {...fadeUp(reduced, 0.1)}
          >
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-1 shadow-2xl shadow-blue-950/20 backdrop-blur-sm">
              <LandingAuth />
            </div>
          </motion.div>
        </section>

        <section className="pb-24" aria-labelledby="features-heading">
          <motion.div className="mb-10 text-center" {...fadeUp(reduced)}>
            <h2
              id="features-heading"
              className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white sm:text-3xl"
            >
              Built for real work
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              A minimal, professional workspace — fast to scan, dense where it
              matters.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[minmax(140px,auto)]">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className={`group cursor-default rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 transition-colors hover:border-slate-700 ${feature.className}`}
                  {...fadeUp(reduced, index * 0.06)}
                  whileHover={
                    reduced ? undefined : { scale: 1.02, transition: { duration: 0.2 } }
                  }
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-linear-to-br p-3 ${feature.accent}`}
                  >
                    <Icon
                      className="size-5 text-[#60a5fa]"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-medium text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="pb-24" aria-labelledby="how-heading">
          <motion.div className="mb-12" {...fadeUp(reduced)}>
            <h2
              id="how-heading"
              className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white sm:text-3xl"
            >
              How it works
            </h2>
          </motion.div>
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.step}
                  className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6"
                  {...fadeUp(reduced, index * 0.08)}
                >
                  <span className="text-xs font-medium tracking-widest text-[#60a5fa]">
                    {item.step}
                  </span>
                  <Icon
                    className="mt-4 size-6 text-slate-300"
                    aria-hidden
                  />
                  <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                </motion.li>
              );
            })}
          </ol>
        </section>

        <motion.section
          className="rounded-2xl border border-[#2563eb]/30 bg-linear-to-br from-[#2563eb]/15 to-slate-900/80 px-8 py-12 text-center"
          {...fadeUp(reduced)}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white sm:text-3xl">
            Ready to chat with your docs?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Sign in above — your dashboard, uploads, and knowledge base are one
            click away.
          </p>
          <a
            href="#get-started"
            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get started free
          </a>
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-slate-800/80 py-8 text-center text-sm text-slate-500">
        <p>DocuMind AI — PDF chat &amp; company knowledge base</p>
      </footer>
    </div>
  );
}
