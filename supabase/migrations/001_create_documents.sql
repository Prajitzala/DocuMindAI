-- =============================================================================
-- Migration 001: DocuMind AI — documents table, pgvector index, RLS, RPC
-- Run in Supabase SQL Editor or via `supabase db push`
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Enable pgvector
-- Required for storing OpenAI text-embedding-3-small vectors (1536 dims)
-- -----------------------------------------------------------------------------
create extension if not exists vector with schema extensions;


-- -----------------------------------------------------------------------------
-- 2. documents table
-- Core RAG store: chunked text + embeddings, scoped by namespace and user
--
-- Namespaces (do not change):
--   user-upload     — user PDFs (owner-only via RLS)
--   kb-hr           — HR knowledge base (readable by all authenticated users)
--   kb-legal        — Legal knowledge base
--   kb-engineering  — Engineering knowledge base
-- -----------------------------------------------------------------------------
create table public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade,
  namespace   text not null,
  content     text not null,
  embedding   extensions.vector(1536),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamp not null default now()
);

comment on table public.documents is 'RAG document chunks with embeddings for semantic search';
comment on column public.documents.namespace is 'user-upload | kb-hr | kb-legal | kb-engineering';
comment on column public.documents.metadata is 'e.g. { "filename", "page", "source" }';


-- -----------------------------------------------------------------------------
-- 3. IVFFlat index for approximate nearest-neighbor search (cosine distance)
-- lists=100 is a reasonable default; tune as row count grows
-- Note: index is most effective after the table has substantial data
-- -----------------------------------------------------------------------------
create index documents_embedding_ivfflat_idx
  on public.documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);


-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- Forces all client access through policies below; service role bypasses RLS
-- -----------------------------------------------------------------------------
alter table public.documents enable row level security;


-- -----------------------------------------------------------------------------
-- 5. RLS policies
-- -----------------------------------------------------------------------------

-- SELECT: knowledge-base namespaces are shared; user-upload is owner-only
create policy "documents_select_kb_or_owner"
  on public.documents
  for select
  to authenticated
  using (
    namespace like 'kb-%'
    or user_id = auth.uid()
  );

-- INSERT: users may only insert rows attributed to themselves
-- (kb-* inserts use SUPABASE_SERVICE_KEY on the server, which bypasses RLS)
create policy "documents_insert_own"
  on public.documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- DELETE: users may only delete their own rows
create policy "documents_delete_own"
  on public.documents
  for delete
  to authenticated
  using (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 6. match_documents — semantic search RPC
-- Called from app/api/chat after embedding the user question.
-- RLS still applies (function runs as invoker), so users only match visible rows.
--
-- Parameters:
--   query_embedding — 1536-dim vector from text-embedding-3-small
--   match_count     — max rows to return (default 5)
--   filter          — JSON object; rows must satisfy metadata @> filter
--
-- Returns rows ordered by cosine similarity (highest first).
-- -----------------------------------------------------------------------------
create or replace function public.match_documents(
  query_embedding extensions.vector(1536),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    d.id,
    d.content,
    d.metadata,
    (1 - (d.embedding <=> query_embedding))::float as similarity
  from public.documents d
  where d.embedding is not null
    and d.metadata @> filter
  order by d.embedding <=> query_embedding asc
  limit match_count;
$$;

comment on function public.match_documents is
  'Cosine-similarity search over documents; optional metadata containment filter';

grant execute on function public.match_documents(extensions.vector, int, jsonb) to authenticated;
