'use client';
import { create } from 'zustand';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'text' | 'vision' | 'prediction';
  icon: string;
  status: 'ready' | 'training' | 'draft';
  accuracy?: number;
  lastTrained?: string;
  usageCount: number;
  fields?: ModelField[];
}

export interface ModelField {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface TestResult {
  id: string;
  modelId: string;
  input: string;
  output: string;
  confidence: number;
  timestamp: string;
  extractedFields?: ExtractedField[];
  inputType?: 'text' | 'file';
  fileName?: string;
}

export interface BatchJob {
  id: string;
  modelId: string;
  files: { name: string; status: 'pending' | 'processing' | 'completed' | 'failed'; confidence?: number }[];
  status: 'running' | 'completed';
  startedAt: string;
}

export interface TrainingRun {
  id: string;
  modelId: string;
  modelName: string;
  status: 'completed' | 'running' | 'failed' | 'queued';
  startTime: string;
  duration: string;
  accuracy?: number;
  samples: number;
}

interface AIBuilderState {
  models: AIModel[];
  testResults: TestResult[];
  trainingRuns: TrainingRun[];
  batchJobs: BatchJob[];
  activeView: 'hub' | 'model-detail' | 'training' | 'test';
  selectedModelId: string | null;
  testInput: string;
  searchQuery: string;
  categoryFilter: string;
  uploadedFileName: string | null;
  showDocumentPreview: boolean;

  setActiveView: (view: AIBuilderState['activeView']) => void;
  setSelectedModelId: (id: string | null) => void;
  setTestInput: (input: string) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setUploadedFileName: (name: string | null) => void;
  setShowDocumentPreview: (show: boolean) => void;
  runTest: (modelId: string, input: string) => void;
  runFileTest: (modelId: string, fileName: string) => void;
  startTraining: (modelId: string) => void;
  startBatchJob: (modelId: string, fileNames: string[]) => void;
}

const sampleModels: AIModel[] = [
  {
    id: 'model-1',
    name: 'Document Processing / OCR',
    description: 'Extract text, tables, and key-value pairs from scanned documents, PDFs, and images with high accuracy',
    category: 'document',
    icon: 'fileSearch',
    status: 'ready',
    accuracy: 94.2,
    lastTrained: '2026-03-15T08:00:00Z',
    usageCount: 1250,
    fields: [
      { id: 'mf1', name: 'Document Type', type: 'classification', description: 'Invoice, Receipt, Contract, Letter' },
      { id: 'mf2', name: 'Text Content', type: 'extraction', description: 'Full text extraction from document' },
      { id: 'mf3', name: 'Tables', type: 'extraction', description: 'Structured table data' },
    ],
  },
  {
    id: 'model-2',
    name: 'Form Recognizer',
    description: 'Automatically identify and extract data from forms, invoices, and receipts into structured data',
    category: 'document',
    icon: 'formInput',
    status: 'ready',
    accuracy: 91.8,
    lastTrained: '2026-03-10T12:00:00Z',
    usageCount: 890,
    fields: [
      { id: 'mf4', name: 'Form Fields', type: 'extraction', description: 'Named fields and values' },
      { id: 'mf5', name: 'Signatures', type: 'detection', description: 'Signature presence detection' },
      { id: 'mf6', name: 'Checkboxes', type: 'detection', description: 'Checkbox state detection' },
    ],
  },
  {
    id: 'model-3',
    name: 'Sentiment Analysis',
    description: 'Analyze text sentiment to determine positive, negative, or neutral tone with confidence scores',
    category: 'text',
    icon: 'smile',
    status: 'ready',
    accuracy: 88.5,
    lastTrained: '2026-02-28T10:00:00Z',
    usageCount: 2340,
    fields: [
      { id: 'mf7', name: 'Sentiment', type: 'classification', description: 'Positive, Negative, Neutral' },
      { id: 'mf8', name: 'Confidence', type: 'score', description: 'Confidence percentage' },
      { id: 'mf9', name: 'Key Phrases', type: 'extraction', description: 'Sentiment-driving phrases' },
    ],
  },
  {
    id: 'model-4',
    name: 'Text Extraction',
    description: 'Extract specific information like dates, amounts, names, and addresses from unstructured text',
    category: 'text',
    icon: 'textCursor',
    status: 'ready',
    accuracy: 92.1,
    lastTrained: '2026-03-05T14:00:00Z',
    usageCount: 560,
    fields: [
      { id: 'mf10', name: 'Entities', type: 'extraction', description: 'Named entities (people, orgs, locations)' },
      { id: 'mf11', name: 'Dates', type: 'extraction', description: 'Date extraction and normalization' },
      { id: 'mf12', name: 'Amounts', type: 'extraction', description: 'Currency and numeric values' },
    ],
  },
  {
    id: 'model-5',
    name: 'Entity Extraction',
    description: 'Identify and classify named entities in text including people, organizations, locations, and custom entities',
    category: 'text',
    icon: 'tags',
    status: 'ready',
    accuracy: 89.7,
    lastTrained: '2026-03-01T09:00:00Z',
    usageCount: 430,
    fields: [
      { id: 'mf13', name: 'People', type: 'extraction', description: 'Person names' },
      { id: 'mf14', name: 'Organizations', type: 'extraction', description: 'Company and org names' },
      { id: 'mf15', name: 'Locations', type: 'extraction', description: 'Geographic entities' },
    ],
  },
  {
    id: 'model-6',
    name: 'Object Detection',
    description: 'Detect and classify objects in images with bounding boxes and confidence scores',
    category: 'vision',
    icon: 'scanSearch',
    status: 'ready',
    accuracy: 86.3,
    lastTrained: '2026-02-20T16:00:00Z',
    usageCount: 310,
    fields: [
      { id: 'mf16', name: 'Objects', type: 'detection', description: 'Detected objects with labels' },
      { id: 'mf17', name: 'Bounding Boxes', type: 'coordinates', description: 'Object locations' },
      { id: 'mf18', name: 'Confidence', type: 'score', description: 'Detection confidence' },
    ],
  },
  {
    id: 'model-7',
    name: 'Prediction Model',
    description: 'Build custom prediction models from historical data to forecast outcomes and classify records',
    category: 'prediction',
    icon: 'trendingUp',
    status: 'training',
    accuracy: undefined,
    lastTrained: undefined,
    usageCount: 0,
    fields: [
      { id: 'mf19', name: 'Prediction', type: 'classification', description: 'Predicted outcome' },
      { id: 'mf20', name: 'Probability', type: 'score', description: 'Prediction probability' },
      { id: 'mf21', name: 'Influencers', type: 'analysis', description: 'Top influencing factors' },
    ],
  },
];

const sampleTestResults: TestResult[] = [
  {
    id: 'tr1', modelId: 'model-3', input: 'The product quality exceeded our expectations. Excellent customer service!', output: 'Positive (92%)', confidence: 92, timestamp: '2026-03-24T09:00:00Z',
    extractedFields: [
      { label: 'Sentiment', value: 'Positive', confidence: 92 },
      { label: 'Key Phrase', value: 'exceeded our expectations', confidence: 89 },
      { label: 'Key Phrase', value: 'Excellent customer service', confidence: 94 },
      { label: 'Emotion', value: 'Satisfaction', confidence: 86 },
    ],
  },
  {
    id: 'tr2', modelId: 'model-3', input: 'Delivery was late and the packaging was damaged.', output: 'Negative (87%)', confidence: 87, timestamp: '2026-03-24T09:05:00Z',
    extractedFields: [
      { label: 'Sentiment', value: 'Negative', confidence: 87 },
      { label: 'Key Phrase', value: 'late', confidence: 82 },
      { label: 'Key Phrase', value: 'packaging was damaged', confidence: 90 },
      { label: 'Emotion', value: 'Frustration', confidence: 78 },
    ],
  },
  {
    id: 'tr3', modelId: 'model-4', input: 'Invoice #INV-2026-0042 dated March 15, 2026 for $4,500.00 from Acme Corp.', output: 'Extracted 4 fields', confidence: 95, timestamp: '2026-03-24T09:10:00Z',
    extractedFields: [
      { label: 'Invoice Number', value: 'INV-2026-0042', confidence: 98 },
      { label: 'Date', value: 'March 15, 2026', confidence: 96 },
      { label: 'Amount', value: '$4,500.00', confidence: 95 },
      { label: 'Company', value: 'Acme Corp', confidence: 91 },
    ],
  },
  {
    id: 'tr4', modelId: 'model-1', input: '[Scanned receipt image]', output: 'Extracted 5 fields', confidence: 91, timestamp: '2026-03-23T16:30:00Z', inputType: 'file', fileName: 'receipt_office_depot.jpg',
    extractedFields: [
      { label: 'Store Name', value: 'Office Depot', confidence: 96, boundingBox: { x: 15, y: 5, width: 70, height: 8 } },
      { label: 'Date', value: '03/20/2026', confidence: 93, boundingBox: { x: 60, y: 15, width: 30, height: 6 } },
      { label: 'Item Count', value: '3 items', confidence: 88, boundingBox: { x: 10, y: 30, width: 80, height: 35 } },
      { label: 'Subtotal', value: '$117.55', confidence: 94, boundingBox: { x: 55, y: 70, width: 35, height: 6 } },
      { label: 'Total', value: '$127.45', confidence: 97, boundingBox: { x: 55, y: 78, width: 35, height: 8 } },
    ],
  },
  {
    id: 'tr5', modelId: 'model-2', input: '[Invoice document]', output: 'Extracted 8 fields', confidence: 93, timestamp: '2026-03-24T10:20:00Z', inputType: 'file', fileName: 'invoice_2026_march.pdf',
    extractedFields: [
      { label: 'Invoice Number', value: 'INV-12345', confidence: 98, boundingBox: { x: 60, y: 5, width: 30, height: 6 } },
      { label: 'Vendor', value: 'TechSupply Inc.', confidence: 95, boundingBox: { x: 5, y: 12, width: 40, height: 6 } },
      { label: 'Bill To', value: 'Contoso Ltd.', confidence: 92, boundingBox: { x: 5, y: 22, width: 35, height: 6 } },
      { label: 'Date', value: '03/01/2026', confidence: 97, boundingBox: { x: 65, y: 12, width: 25, height: 6 } },
      { label: 'Due Date', value: '03/31/2026', confidence: 96, boundingBox: { x: 65, y: 18, width: 25, height: 6 } },
      { label: 'Line Items', value: '4 items', confidence: 89, boundingBox: { x: 5, y: 40, width: 90, height: 25 } },
      { label: 'Subtotal', value: '$4,850.00', confidence: 95, boundingBox: { x: 65, y: 70, width: 25, height: 6 } },
      { label: 'Total Amount', value: '$5,250.00', confidence: 97, boundingBox: { x: 65, y: 78, width: 25, height: 8 } },
    ],
  },
];

const sampleTrainingRuns: TrainingRun[] = [
  { id: 'tn1', modelId: 'model-7', modelName: 'Prediction Model', status: 'running', startTime: '2026-03-24T08:00:00Z', duration: '2h 15m', samples: 5000 },
  { id: 'tn2', modelId: 'model-1', modelName: 'Document Processing / OCR', status: 'completed', startTime: '2026-03-15T08:00:00Z', duration: '4h 32m', accuracy: 94.2, samples: 12000 },
  { id: 'tn3', modelId: 'model-3', modelName: 'Sentiment Analysis', status: 'completed', startTime: '2026-02-28T10:00:00Z', duration: '1h 45m', accuracy: 88.5, samples: 8500 },
  { id: 'tn4', modelId: 'model-6', modelName: 'Object Detection', status: 'completed', startTime: '2026-02-20T16:00:00Z', duration: '6h 12m', accuracy: 86.3, samples: 3200 },
  { id: 'tn5', modelId: 'model-2', modelName: 'Form Recognizer', status: 'failed', startTime: '2026-03-08T14:00:00Z', duration: '0h 23m', samples: 2000 },
];

function generateExtractedFields(model: AIModel, input: string): ExtractedField[] {
  if (model.id === 'model-3') {
    const sentimentWords = ['great', 'excellent', 'good', 'love', 'amazing', 'best', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'angry'];
    const lower = input.toLowerCase();
    const posCount = sentimentWords.filter((w) => lower.includes(w)).length;
    const negCount = negativeWords.filter((w) => lower.includes(w)).length;
    const sentiment = posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral';
    const conf = posCount > negCount ? 70 + posCount * 8 : negCount > posCount ? 70 + negCount * 8 : 55;
    const fields: ExtractedField[] = [
      { label: 'Sentiment', value: sentiment, confidence: Math.min(conf, 98) },
      { label: 'Confidence Score', value: `${Math.min(conf, 98)}%`, confidence: Math.min(conf, 98) },
    ];
    const words = input.split(/[.,!?;]+/).map(s => s.trim()).filter(Boolean);
    words.slice(0, 2).forEach((phrase) => {
      fields.push({ label: 'Key Phrase', value: phrase.substring(0, 50), confidence: 70 + Math.floor(Math.random() * 25) });
    });
    return fields;
  }
  if (model.id === 'model-4' || model.id === 'model-5') {
    const fields: ExtractedField[] = [];
    const dateMatch = input.match(/\b(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2},?\s*\d{4})\b/);
    if (dateMatch) fields.push({ label: 'Date', value: dateMatch[0], confidence: 96 });
    const amountMatch = input.match(/\$[\d,]+\.?\d*/);
    if (amountMatch) fields.push({ label: 'Amount', value: amountMatch[0], confidence: 95 });
    const invoiceMatch = input.match(/#?(INV-[\w-]+|[A-Z]+-\d+)/);
    if (invoiceMatch) fields.push({ label: 'Invoice Number', value: invoiceMatch[0], confidence: 98 });
    const orgMatch = input.match(/(?:from|at|by)\s+([A-Z][\w\s]+(?:Corp|Inc|Ltd|LLC|Co)\.?)/i);
    if (orgMatch) fields.push({ label: 'Organization', value: orgMatch[1].trim(), confidence: 91 });
    if (fields.length === 0) {
      const words = input.split(/\s+/).filter(w => w.length > 3);
      words.slice(0, 3).forEach((w) => {
        fields.push({ label: 'Entity', value: w, confidence: 75 + Math.floor(Math.random() * 15) });
      });
    }
    return fields;
  }
  if (model.category === 'document') {
    return [
      { label: 'Document Type', value: 'General Document', confidence: 85 },
      { label: 'Language', value: 'English', confidence: 97 },
      { label: 'Text Blocks', value: `${Math.floor(input.length / 20)} blocks`, confidence: 88 },
      { label: 'Confidence', value: `${80 + Math.floor(Math.random() * 15)}%`, confidence: 88 },
    ];
  }
  if (model.category === 'vision') {
    return [
      { label: 'Object', value: 'Document', confidence: 92, boundingBox: { x: 5, y: 5, width: 90, height: 90 } },
      { label: 'Text Region', value: 'Header', confidence: 88, boundingBox: { x: 10, y: 5, width: 80, height: 15 } },
      { label: 'Text Region', value: 'Body', confidence: 85, boundingBox: { x: 10, y: 25, width: 80, height: 50 } },
    ];
  }
  return [
    { label: 'Result', value: `Processed successfully`, confidence: 80 + Math.floor(Math.random() * 15) },
  ];
}

function generateFileExtractedFields(model: AIModel, fileName: string): ExtractedField[] {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (model.id === 'model-1' || model.id === 'model-2') {
    if (ext === 'pdf' || fileName.toLowerCase().includes('invoice')) {
      return [
        { label: 'Invoice Number', value: `INV-${10000 + Math.floor(Math.random() * 90000)}`, confidence: 98, boundingBox: { x: 60, y: 5, width: 30, height: 6 } },
        { label: 'Vendor Name', value: 'Global Supplies Co.', confidence: 94, boundingBox: { x: 5, y: 12, width: 40, height: 6 } },
        { label: 'Date', value: '03/15/2026', confidence: 96, boundingBox: { x: 65, y: 12, width: 25, height: 6 } },
        { label: 'Total Amount', value: `$${(1000 + Math.floor(Math.random() * 9000)).toLocaleString()}.00`, confidence: 95, boundingBox: { x: 65, y: 78, width: 25, height: 8 } },
        { label: 'Tax', value: `$${(50 + Math.floor(Math.random() * 500)).toFixed(2)}`, confidence: 91, boundingBox: { x: 65, y: 72, width: 25, height: 6 } },
        { label: 'Payment Terms', value: 'Net 30', confidence: 87, boundingBox: { x: 5, y: 85, width: 30, height: 5 } },
      ];
    }
    return [
      { label: 'Document Type', value: ext === 'jpg' || ext === 'png' ? 'Image Document' : 'Text Document', confidence: 93, boundingBox: { x: 5, y: 5, width: 90, height: 10 } },
      { label: 'Title', value: fileName.replace(/\.\w+$/, ''), confidence: 88, boundingBox: { x: 10, y: 5, width: 80, height: 8 } },
      { label: 'Content Blocks', value: `${3 + Math.floor(Math.random() * 5)} blocks detected`, confidence: 85, boundingBox: { x: 5, y: 20, width: 90, height: 60 } },
      { label: 'Language', value: 'English', confidence: 97 },
    ];
  }
  if (model.id === 'model-6') {
    return [
      { label: 'Object', value: 'Document', confidence: 94, boundingBox: { x: 5, y: 5, width: 90, height: 90 } },
      { label: 'Logo', value: 'Detected', confidence: 82, boundingBox: { x: 5, y: 3, width: 20, height: 12 } },
      { label: 'Table', value: 'Detected', confidence: 89, boundingBox: { x: 10, y: 35, width: 80, height: 30 } },
    ];
  }
  return generateExtractedFields(model, fileName);
}

const sampleBatchJobs: BatchJob[] = [
  {
    id: 'bj1', modelId: 'model-1', status: 'completed', startedAt: '2026-03-23T14:00:00Z',
    files: [
      { name: 'invoice_march_001.pdf', status: 'completed', confidence: 96 },
      { name: 'receipt_coffee_shop.jpg', status: 'completed', confidence: 91 },
      { name: 'contract_renewal.pdf', status: 'completed', confidence: 94 },
      { name: 'handwritten_note.png', status: 'failed' },
    ],
  },
];

export const useAIBuilderStore = create<AIBuilderState>((set, get) => ({
  models: sampleModels,
  testResults: sampleTestResults,
  trainingRuns: sampleTrainingRuns,
  batchJobs: sampleBatchJobs,
  activeView: 'hub',
  selectedModelId: null,
  testInput: '',
  searchQuery: '',
  categoryFilter: 'all',
  uploadedFileName: null,
  showDocumentPreview: false,

  setActiveView: (view) => set({ activeView: view }),
  setSelectedModelId: (id) => set({ selectedModelId: id }),
  setTestInput: (input) => set({ testInput: input }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setUploadedFileName: (name) => set({ uploadedFileName: name }),
  setShowDocumentPreview: (show) => set({ showDocumentPreview: show }),

  runTest: (modelId, input) => {
    const model = get().models.find((m) => m.id === modelId);
    if (!model) return;

    const extractedFields = generateExtractedFields(model, input);
    const avgConf = extractedFields.length > 0 ? Math.round(extractedFields.reduce((s, f) => s + f.confidence, 0) / extractedFields.length) : 80;
    const output = `Extracted ${extractedFields.length} field${extractedFields.length !== 1 ? 's' : ''}`;

    const result: TestResult = {
      id: `tr-${Date.now()}`,
      modelId,
      input,
      output,
      confidence: Math.min(avgConf, 98),
      timestamp: new Date().toISOString(),
      extractedFields,
      inputType: 'text',
    };

    set((s) => ({ testResults: [result, ...s.testResults], testInput: '' }));
  },

  runFileTest: (modelId, fileName) => {
    const model = get().models.find((m) => m.id === modelId);
    if (!model) return;

    const extractedFields = generateFileExtractedFields(model, fileName);
    const avgConf = extractedFields.length > 0 ? Math.round(extractedFields.reduce((s, f) => s + f.confidence, 0) / extractedFields.length) : 85;

    const result: TestResult = {
      id: `tr-${Date.now()}`,
      modelId,
      input: `[File: ${fileName}]`,
      output: `Extracted ${extractedFields.length} field${extractedFields.length !== 1 ? 's' : ''}`,
      confidence: Math.min(avgConf, 98),
      timestamp: new Date().toISOString(),
      extractedFields,
      inputType: 'file',
      fileName,
    };

    set((s) => ({ testResults: [result, ...s.testResults], uploadedFileName: null }));
  },

  startTraining: (modelId) =>
    set((s) => ({
      models: s.models.map((m) =>
        m.id === modelId ? { ...m, status: 'training' as const } : m
      ),
      trainingRuns: [
        {
          id: `tn-${Date.now()}`,
          modelId,
          modelName: s.models.find((m) => m.id === modelId)?.name ?? '',
          status: 'running' as const,
          startTime: new Date().toISOString(),
          duration: '0m',
          samples: 0,
        },
        ...s.trainingRuns,
      ],
    })),

  startBatchJob: (modelId, fileNames) => {
    const job: BatchJob = {
      id: `bj-${Date.now()}`,
      modelId,
      status: 'completed',
      startedAt: new Date().toISOString(),
      files: fileNames.map((name) => ({
        name,
        status: 'completed' as const,
        confidence: 80 + Math.floor(Math.random() * 18),
      })),
    };
    set((s) => ({ batchJobs: [job, ...s.batchJobs] }));
  },
}));
