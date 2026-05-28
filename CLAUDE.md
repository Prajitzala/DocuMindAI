# DocuMind AI — Claude Code Project Memory

## Project Overview
Unified RAG platform with two modes: PDF upload chatbot + company knowledge base.
Users upload PDFs or query preloaded KB categories (HR, Legal, Engineering).

## Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **RAG:** LangChain.js
- **LLM:** OpenAI GPT-4o (streaming)
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector DB:** Supabase pgvector (table: `documents`)
- **Storage:** Supabase Storage (bucket: `pdfs`)
- **Auth:** Supabase Auth + Row Level Security
- **Deploy:** Vercel

---

## Essential Commands

```bash
npm run dev          # Start dev server → localhost:3000
npm run build        # Production build (run before committing)
npm run lint         # ESLint check
npm run type-check   # TypeScript check (if applicable)
```

---

## Project Structure (Key Files)

```
app/
  layout.jsx              # Root layout, Supabase provider here
  page.jsx                # Landing / auth page
  dashboard/page.jsx      # Main chat UI
  admin/page.jsx          # Admin knowledge base panel

api/
  upload/route.js         # PDF → chunk → embed → Supabase
  chat/route.js           # Query → RAG → stream response
  admin/route.js          # KB doc CRUD

lib/
  supabase.js             # Browser Supabase client
  supabase-server.js      # Server/API Supabase client (service key)
  rag.js                  # LangChain RAG pipeline (ingest + query)
  pdf-parser.js           # PDF load + RecursiveTextSplitter

components/
  ChatWindow.jsx          # Streaming message UI
  PDFUploader.jsx         # Drag-and-drop upload
  NamespaceSelector.jsx   # Mode switcher (PDF vs KB category)
  SourceCitation.jsx      # Shows filename + page per answer

supabase/migrations/
  001_create_documents.sql  # pgvector table + RLS policies
```

---

## Supabase Schema

```sql
-- documents table (core of the RAG system)
create table documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade,
  namespace   text not null,   -- 'user-upload' | 'kb-hr' | 'kb-legal' | 'kb-engineering'
  content     text not null,
  embedding   vector(1536),
  metadata    jsonb default '{}',  -- { filename, page, source }
  created_at  timestamp default now()
);
```

### Namespace Convention — NEVER change these strings
| Namespace | Purpose |
|---|---|
| `user-upload` | PDFs uploaded by users (RLS: owner only) |
| `kb-hr` | HR policy documents (public to all auth users) |
| `kb-legal` | Legal / contract documents |
| `kb-engineering` | Technical / architecture docs |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=        # server only, never expose to client
OPENAI_API_KEY=
```

- `SUPABASE_SERVICE_KEY` is only used in `lib/supabase-server.js` — never import this in client components
- `NEXT_PUBLIC_*` variables are safe for browser use

---

## RAG Pipeline — How It Works

### Ingest (upload)
1. Receive PDF → upload original to Supabase Storage bucket `pdfs`
2. Parse with `PDFLoader` → split with `RecursiveCharacterTextSplitter` (chunkSize: 500, overlap: 50)
3. Embed chunks with `text-embedding-3-small`
4. Store in `documents` table with correct `namespace` and `user_id`

### Query (chat)
1. Embed user question
2. Run `match_documents` RPC filtered by `namespace`
3. Retrieve top 5 chunks
4. Pass to GPT-4o with context → stream response
5. Return source citations from chunk metadata

---

## Coding Conventions

- **Client components** → suffix with `'use client'` at top
- **Server components** → default (no directive needed)
- **API routes** → always use `lib/supabase-server.js` (service key), never browser client
- **Streaming** → use `ReadableStream` in API routes, `EventSource` or `fetch` with reader in UI
- **Error handling** → always wrap Supabase + OpenAI calls in try/catch, return `{ error }` JSON on failure
- **Tailwind only** → no inline styles, no CSS modules
- **No TypeScript** → plain JavaScript (.js / .jsx) for this project

---

## RLS Rules (Do Not Break)
- Users can only READ `user-upload` namespace docs where `user_id = auth.uid()`
- KB namespaces (`kb-*`) are readable by all authenticated users
- Only `SUPABASE_SERVICE_KEY` (server) can INSERT into `kb-*` namespaces
- Never call admin routes from the client — always server-side API routes

---

## Known Gotchas
- `PDFLoader` from LangChain requires `canvas` and `pdfjs-dist` — install both
- Supabase `match_documents` RPC must exist before vector queries work — run migration first
- Vercel serverless functions have a **10s timeout** on hobby plan — chunk large PDFs client-side if needed
- OpenAI streaming in Next.js App Router: use `new Response(stream)` not `res.write()`
- Always destroy Supabase server client per-request — do not cache it

---

## docs/ Reference Files
Use `@docs/filename.md` to load these on-demand (not loaded every session):

- `docs/architecture.md` — full system diagram
- `docs/supabase-setup.md` — SQL migrations + RLS policies
- `docs/api-contracts.md` — request/response shapes for all API routes
- `docs/roadmap.md` — feature checklist with [ ] task tracking