export type DocumentStatus = "uploading" | "processing" | "indexed" | "error";
export type ChunkStrategy = "paragraph" | "sentence" | "fixed" | "semantic";

export interface RAGDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "md" | "csv" | "xlsx";
  size: number;
  pages: number;
  uploadedAt: string;
  indexedAt: string | null;
  status: DocumentStatus;
  tags: string[];
  summary: string;
  chunkCount: number;
  collectionId: string | null;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[] | null;
  metadata: {
    heading?: string;
    section?: string;
    startChar: number;
    endChar: number;
  };
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  chunkId: string;
  pageNumber: number;
  excerpt: string;
  relevanceScore: number;
  heading?: string;
}

export interface RAGMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations: Citation[];
  thinking?: string;
}

export interface RAGConversation {
  id: string;
  title: string;
  messages: RAGMessage[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCollection {
  id: string;
  name: string;
  description: string;
  documentIds: string[];
  createdAt: string;
  color: string;
}

export interface CrossReference {
  id: string;
  sourceDocId: string;
  targetDocId: string;
  sourceChunkId: string;
  targetChunkId: string;
  similarity: number;
  topic: string;
}

export interface TemplateField {
  id: string;
  label: string;
  key: string;
  value: string;
  source: string;
  confidence: number;
  documentId: string | null;
}

export interface ExtractionTemplate {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
  createdAt: string;
}

export interface IndexingConfig {
  chunkStrategy: ChunkStrategy;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
}
