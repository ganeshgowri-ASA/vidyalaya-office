-- Create documents table for cloud document storage
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('document', 'spreadsheet', 'presentation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id TEXT NOT NULL DEFAULT 'anonymous'
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);

-- Index for ordering by updated_at
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at DESC);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Enable Row Level Security (allow all for now since we use anon key)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for authenticated and anonymous users
CREATE POLICY "Allow all access to documents" ON documents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for document file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the documents bucket
CREATE POLICY "Allow public access to documents bucket" ON storage.objects
  FOR ALL
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');
