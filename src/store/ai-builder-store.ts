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

export interface TestResult {
  id: string;
  modelId: string;
  input: string;
  output: string;
  confidence: number;
  timestamp: string;
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
  activeView: 'hub' | 'model-detail' | 'training' | 'test';
  selectedModelId: string | null;
  testInput: string;
  searchQuery: string;
  categoryFilter: string;

  setActiveView: (view: AIBuilderState['activeView']) => void;
  setSelectedModelId: (id: string | null) => void;
  setTestInput: (input: string) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  runTest: (modelId: string, input: string) => void;
  startTraining: (modelId: string) => void;
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
  { id: 'tr1', modelId: 'model-3', input: 'The product quality exceeded our expectations. Excellent customer service!', output: 'Positive (92%)', confidence: 92, timestamp: '2026-03-24T09:00:00Z' },
  { id: 'tr2', modelId: 'model-3', input: 'Delivery was late and the packaging was damaged.', output: 'Negative (87%)', confidence: 87, timestamp: '2026-03-24T09:05:00Z' },
  { id: 'tr3', modelId: 'model-4', input: 'Invoice #INV-2026-0042 dated March 15, 2026 for $4,500.00 from Acme Corp.', output: 'Invoice: INV-2026-0042, Date: 2026-03-15, Amount: $4,500.00, Company: Acme Corp', confidence: 95, timestamp: '2026-03-24T09:10:00Z' },
  { id: 'tr4', modelId: 'model-1', input: '[Scanned receipt image]', output: 'Store: Office Depot, Date: 03/20/2026, Items: 3, Total: $127.45', confidence: 91, timestamp: '2026-03-23T16:30:00Z' },
];

const sampleTrainingRuns: TrainingRun[] = [
  { id: 'tn1', modelId: 'model-7', modelName: 'Prediction Model', status: 'running', startTime: '2026-03-24T08:00:00Z', duration: '2h 15m', samples: 5000 },
  { id: 'tn2', modelId: 'model-1', modelName: 'Document Processing / OCR', status: 'completed', startTime: '2026-03-15T08:00:00Z', duration: '4h 32m', accuracy: 94.2, samples: 12000 },
  { id: 'tn3', modelId: 'model-3', modelName: 'Sentiment Analysis', status: 'completed', startTime: '2026-02-28T10:00:00Z', duration: '1h 45m', accuracy: 88.5, samples: 8500 },
  { id: 'tn4', modelId: 'model-6', modelName: 'Object Detection', status: 'completed', startTime: '2026-02-20T16:00:00Z', duration: '6h 12m', accuracy: 86.3, samples: 3200 },
  { id: 'tn5', modelId: 'model-2', modelName: 'Form Recognizer', status: 'failed', startTime: '2026-03-08T14:00:00Z', duration: '0h 23m', samples: 2000 },
];

export const useAIBuilderStore = create<AIBuilderState>((set, get) => ({
  models: sampleModels,
  testResults: sampleTestResults,
  trainingRuns: sampleTrainingRuns,
  activeView: 'hub',
  selectedModelId: null,
  testInput: '',
  searchQuery: '',
  categoryFilter: 'all',

  setActiveView: (view) => set({ activeView: view }),
  setSelectedModelId: (id) => set({ selectedModelId: id }),
  setTestInput: (input) => set({ testInput: input }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  runTest: (modelId, input) => {
    const model = get().models.find((m) => m.id === modelId);
    if (!model) return;

    let output = '';
    let confidence = 0;

    if (model.category === 'text') {
      const sentimentWords = ['great', 'excellent', 'good', 'love', 'amazing', 'best', 'happy'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'angry'];
      const lower = input.toLowerCase();
      const posCount = sentimentWords.filter((w) => lower.includes(w)).length;
      const negCount = negativeWords.filter((w) => lower.includes(w)).length;

      if (model.id === 'model-3') {
        if (posCount > negCount) {
          confidence = 70 + posCount * 8;
          output = `Positive (${Math.min(confidence, 98)}%)`;
        } else if (negCount > posCount) {
          confidence = 70 + negCount * 8;
          output = `Negative (${Math.min(confidence, 98)}%)`;
        } else {
          confidence = 55;
          output = `Neutral (${confidence}%)`;
        }
      } else {
        confidence = 85;
        output = `Extracted: ${input.substring(0, 80)}...`;
      }
    } else {
      confidence = 80;
      output = `Processed with ${model.name}`;
    }

    const result: TestResult = {
      id: `tr-${Date.now()}`,
      modelId,
      input,
      output,
      confidence: Math.min(confidence, 98),
      timestamp: new Date().toISOString(),
    };

    set((s) => ({ testResults: [result, ...s.testResults], testInput: '' }));
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
}));
