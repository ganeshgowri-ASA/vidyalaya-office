'use client';

import { useState } from 'react';
import {
  Brain, Search, Play, ArrowLeft, BarChart3, Zap, FileSearch,
  Smile, TextCursor as TextCursorIcon, Tags, ScanSearch, TrendingUp, Target,
  CheckCircle2, XCircle, RefreshCw, Clock, ChevronRight,
  Send, Sparkles, TestTube, GraduationCap, Plug, Settings,
  Eye, FileText, Layers,
  Upload, FileUp, FileImage, BarChart, Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIBuilderStore, AIModel, ExtractedField, TestResult, BatchJob } from '@/store/ai-builder-store';

const modelIcons: Record<string, React.ElementType> = {
  fileSearch: FileSearch,
  formInput: FileText,
  smile: Smile,
  textCursor: TextCursorIcon,
  tags: Tags,
  scanSearch: ScanSearch,
  trendingUp: TrendingUp,
};

const categoryColors: Record<string, string> = {
  document: '#3b82f6',
  text: '#10b981',
  vision: '#f59e0b',
  prediction: '#7c3aed',
};

const categoryLabels: Record<string, string> = {
  document: 'Document Intelligence',
  text: 'Text Analytics',
  vision: 'Computer Vision',
  prediction: 'Prediction',
};

const fieldColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#10b981';
  if (confidence >= 75) return '#f59e0b';
  return '#ef4444';
}

function ExtractedFieldsDisplay({ fields, color }: { fields: ExtractedField[]; color: string }) {
  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Extracted Fields</p>
      {fields.map((field, i) => {
        const confColor = getConfidenceColor(field.confidence);
        return (
          <div key={i} className="rounded p-2.5" style={{ backgroundColor: 'var(--background)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{field.label}:</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{field.value}</span>
              </div>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: confColor + '20', color: confColor }}>
                {field.confidence}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${field.confidence}%`, backgroundColor: confColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentPreviewPanel({ fields, fileName }: { fields: ExtractedField[]; fileName?: string }) {
  const fieldsWithBoxes = fields.filter((f) => f.boundingBox);
  if (fieldsWithBoxes.length === 0) return null;

  return (
    <div className="mt-4 rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <FileImage size={16} style={{ color: 'var(--sidebar-accent)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Document Preview</h4>
        {fileName && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
            {fileName}
          </span>
        )}
      </div>

      {/* SVG document canvas */}
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <svg
          viewBox="0 0 100 120"
          className="w-full"
          style={{ backgroundColor: '#1a1a2e', maxHeight: '320px' }}
        >
          {/* Document page background */}
          <rect x="5" y="5" width="90" height="110" rx="1" fill="#2a2a3e" stroke="#444" strokeWidth="0.3" />

          {/* Simulated text lines */}
          {[12, 16, 20, 35, 39, 43, 47, 65, 69].map((y, i) => (
            <rect key={`line-${i}`} x="12" y={y} width={40 + (i % 3) * 15} height="1.5" rx="0.5" fill="#3a3a4e" />
          ))}

          {/* Bounding boxes */}
          {fieldsWithBoxes.map((field, i) => {
            const bb = field.boundingBox!;
            const boxColor = fieldColors[i % fieldColors.length];
            return (
              <g key={`box-${i}`}>
                <rect
                  x={bb.x}
                  y={bb.y + 5}
                  width={bb.width}
                  height={bb.height}
                  fill={boxColor}
                  fillOpacity={0.15}
                  stroke={boxColor}
                  strokeWidth="0.4"
                  rx="0.5"
                />
                <text
                  x={bb.x + 1}
                  y={bb.y + 4}
                  fill={boxColor}
                  fontSize="2.5"
                  fontWeight="bold"
                >
                  {field.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {fieldsWithBoxes.map((field, i) => {
          const boxColor = fieldColors[i % fieldColors.length];
          return (
            <div key={`legend-${i}`} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: boxColor }} />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{field.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BatchProcessingSection({ modelId, color }: { modelId: string; color: string }) {
  const { batchJobs, startBatchJob } = useAIBuilderStore();
  const modelBatchJobs = batchJobs.filter((j) => j.modelId === modelId);

  const handleStartBatch = () => {
    startBatchJob(modelId, [
      'quarterly_report_q1.pdf',
      'vendor_invoice_march.pdf',
      'employee_onboarding_form.pdf',
      'purchase_order_2026.pdf',
      'contract_amendment.pdf',
    ]);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart size={16} style={{ color }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Batch Processing</h3>
        </div>
        <button
          onClick={handleStartBatch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ backgroundColor: color, color: 'white' }}
        >
          <Play size={12} /> Start Batch
        </button>
      </div>

      {modelBatchJobs.length === 0 && (
        <div className="rounded-lg border p-6 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <BarChart size={32} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No batch jobs yet. Click &quot;Start Batch&quot; to process multiple files.</p>
        </div>
      )}

      <div className="space-y-3">
        {modelBatchJobs.map((job) => (
          <div key={job.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: job.status === 'completed' ? '#10b98120' : '#3b82f620',
                    color: job.status === 'completed' ? '#10b981' : '#3b82f6',
                  }}
                >
                  {job.status === 'completed' ? 'Completed' : 'Running'}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {new Date(job.startedAt).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5">
              {job.files.map((file, i) => (
                <div key={i} className="flex items-center justify-between rounded px-3 py-1.5" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && <CheckCircle2 size={14} style={{ color: '#10b981' }} />}
                    {file.status === 'failed' && <XCircle size={14} style={{ color: '#ef4444' }} />}
                    {file.status === 'processing' && <RefreshCw size={14} className="animate-spin" style={{ color: '#3b82f6' }} />}
                    {file.status === 'pending' && <Clock size={14} style={{ color: '#6b7280' }} />}
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{file.name}</span>
                  </div>
                  {file.confidence != null && (
                    <span className="text-xs font-medium" style={{ color: getConfidenceColor(file.confidence) }}>
                      {file.confidence}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelDetail() {
  const {
    models, selectedModelId, setSelectedModelId, setActiveView,
    testResults, testInput, setTestInput, runTest, runFileTest,
    trainingRuns, startTraining,
    uploadedFileName, setUploadedFileName, showDocumentPreview, setShowDocumentPreview,
  } = useAIBuilderStore();
  const model = models.find((m) => m.id === selectedModelId);

  if (!model) return null;

  const Icon = modelIcons[model.icon] ?? Brain;
  const color = categoryColors[model.category];
  const modelTestResults = testResults.filter((r) => r.modelId === model.id);
  const modelTrainingRuns = trainingRuns.filter((r) => r.modelId === model.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'training' | 'integrate'>('overview');

  const handleFileDrop = () => {
    const mockFile = 'sample_invoice.pdf';
    setUploadedFileName(mockFile);
  };

  const handleRunOCRTest = () => {
    if (uploadedFileName) {
      runFileTest(model.id, uploadedFileName);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => { setSelectedModelId(null); setActiveView('hub'); }} className="p-1 rounded" style={{ color: 'var(--foreground)' }}>
            <ArrowLeft size={18} />
          </button>
          <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>{model.name}</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{categoryLabels[model.category]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
            backgroundColor: model.status === 'ready' ? '#10b98120' : model.status === 'training' ? '#f59e0b20' : 'var(--background)',
            color: model.status === 'ready' ? '#10b981' : model.status === 'training' ? '#f59e0b' : 'var(--muted-foreground)',
          }}>
            {model.status === 'ready' ? 'Ready' : model.status === 'training' ? 'Training...' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {[
          { key: 'overview' as const, label: 'Overview', icon: Eye },
          { key: 'test' as const, label: 'Test', icon: TestTube },
          { key: 'training' as const, label: 'Training', icon: GraduationCap },
          { key: 'integrate' as const, label: 'Integrate', icon: Plug },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px"
            style={{
              borderColor: activeTab === tab.key ? color : 'transparent',
              color: activeTab === tab.key ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="max-w-3xl">
            <p className="text-sm mb-6" style={{ color: 'var(--foreground)' }}>{model.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {model.accuracy != null && (
                <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Accuracy</p>
                  <p className="text-2xl font-bold mt-1" style={{ color }}>{model.accuracy}%</p>
                </div>
              )}
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Usage Count</p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>{model.usageCount.toLocaleString()}</p>
              </div>
              {model.lastTrained && (
                <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Last Trained</p>
                  <p className="text-sm font-medium mt-2" style={{ color: 'var(--foreground)' }}>{new Date(model.lastTrained).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Fields */}
            {model.fields && model.fields.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Model Fields</h3>
                <div className="space-y-2">
                  {model.fields.map((field) => (
                    <div key={field.id} className="rounded-lg border p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="p-1.5 rounded" style={{ backgroundColor: color + '20' }}>
                        <Layers size={14} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{field.name}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{field.description} ({field.type})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="max-w-3xl">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Test Model</h3>

            {/* Text input */}
            <div className="rounded-lg border p-4 mb-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <textarea
                className="w-full px-3 py-2 rounded border text-sm resize-none mb-3"
                rows={4}
                placeholder="Enter test input..."
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
              <button
                onClick={() => { if (testInput.trim()) runTest(model.id, testInput); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: color, color: 'white' }}
              >
                <Play size={14} /> Run Test
              </button>
            </div>

            {/* File upload zone */}
            <div className="rounded-lg border p-4 mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>File / Image Upload</p>

              {!uploadedFileName ? (
                <div
                  onClick={handleFileDrop}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-opacity-80"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Drop files here or click to browse</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Supports PDF, JPG, PNG, TIFF documents</p>
                </div>
              ) : (
                <div>
                  {/* File preview */}
                  <div className="flex items-center gap-3 rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--background)' }}>
                    <div className="w-16 h-20 rounded border flex items-center justify-center" style={{ backgroundColor: '#1a1a2e', borderColor: 'var(--border)' }}>
                      <FileText size={24} style={{ color: 'var(--muted-foreground)', opacity: 0.6 }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileUp size={14} style={{ color }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{uploadedFileName}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Ready for OCR processing</p>
                    </div>
                    <button
                      onClick={() => setUploadedFileName(null)}
                      className="p-1 rounded hover:opacity-80"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleRunOCRTest}
                    className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium"
                    style={{ backgroundColor: '#f59e0b', color: 'white' }}
                  >
                    <ScanSearch size={14} /> Run OCR Test
                  </button>
                </div>
              )}
            </div>

            {/* Test results */}
            {modelTestResults.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Results</h3>
                <div className="space-y-3">
                  {modelTestResults.map((result) => (
                    <div key={result.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.inputType === 'file' ? (
                            <FileImage size={14} style={{ color: 'var(--muted-foreground)' }} />
                          ) : null}
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {result.inputType === 'file' ? `File: ${result.fileName}` : 'Input'}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: color + '20', color }}>{result.confidence}% confidence</span>
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>{result.input}</p>

                      <div className="rounded p-3" style={{ backgroundColor: 'var(--background)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Output</p>
                        <p className="text-sm font-medium" style={{ color }}>{result.output}</p>
                      </div>

                      {/* Extracted fields display */}
                      {result.extractedFields && result.extractedFields.length > 0 && (
                        <ExtractedFieldsDisplay fields={result.extractedFields} color={color} />
                      )}

                      {/* Document preview for file-based results */}
                      {result.inputType === 'file' && result.extractedFields && result.extractedFields.some((f) => f.boundingBox) && (
                        <DocumentPreviewPanel fields={result.extractedFields} fileName={result.fileName} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batch processing section */}
            <BatchProcessingSection modelId={model.id} color={color} />
          </div>
        )}

        {activeTab === 'training' && (
          <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Training History</h3>
              <button
                onClick={() => startTraining(model.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium"
                style={{ backgroundColor: color, color: 'white' }}
                disabled={model.status === 'training'}
              >
                <GraduationCap size={14} /> {model.status === 'training' ? 'Training...' : 'Start Training'}
              </button>
            </div>
            <div className="space-y-3">
              {modelTrainingRuns.map((run) => {
                const statusIcons: Record<string, React.ElementType> = {
                  completed: CheckCircle2, running: RefreshCw, failed: XCircle, queued: Clock,
                };
                const statusColors: Record<string, string> = {
                  completed: '#10b981', running: '#3b82f6', failed: '#ef4444', queued: '#6b7280',
                };
                const StatusIcon = statusIcons[run.status];
                return (
                  <div key={run.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={16} style={{ color: statusColors[run.status] }} />
                        <span className="text-sm font-medium capitalize" style={{ color: statusColors[run.status] }}>{run.status}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(run.startTime).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>Duration: {run.duration}</span>
                      <span>Samples: {run.samples.toLocaleString()}</span>
                      {run.accuracy != null && <span>Accuracy: {run.accuracy}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'integrate' && (
          <div className="max-w-3xl">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Integration</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Use this model in your Power Automate flows or Power Apps.</p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} style={{ color: 'var(--sidebar-accent)' }} />
                  <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Power Automate</h4>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Add this model as an action in any flow to process data automatically.</p>
                <div className="rounded p-3 font-mono text-xs" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                  Action: AI Builder → {model.name}
                </div>
              </div>

              <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} style={{ color: '#7c3aed' }} />
                  <h4 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>REST API</h4>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Call this model via the REST API from any application.</p>
                <div className="rounded p-3 font-mono text-xs" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                  POST /api/ai-builder/models/{model.id}/predict
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModelCard({ model }: { model: AIModel }) {
  const { setSelectedModelId, setActiveView } = useAIBuilderStore();
  const Icon = modelIcons[model.icon] ?? Brain;
  const color = categoryColors[model.category];

  return (
    <div
      className="rounded-lg border p-4 cursor-pointer hover:border-opacity-60 transition-colors"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      onClick={() => { setSelectedModelId(model.id); setActiveView('model-detail'); }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
          backgroundColor: model.status === 'ready' ? '#10b98120' : model.status === 'training' ? '#f59e0b20' : 'var(--background)',
          color: model.status === 'ready' ? '#10b981' : model.status === 'training' ? '#f59e0b' : 'var(--muted-foreground)',
        }}>
          {model.status === 'ready' ? 'Ready' : model.status === 'training' ? 'Training' : 'Draft'}
        </span>
      </div>
      <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--foreground)' }}>{model.name}</h3>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{model.description}</p>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <div className="flex items-center gap-3">
          {model.accuracy != null && (
            <span className="flex items-center gap-1"><BarChart3 size={12} /> {model.accuracy}%</span>
          )}
          <span className="flex items-center gap-1"><Sparkles size={12} /> {model.usageCount} uses</span>
        </div>
        <ChevronRight size={14} />
      </div>
    </div>
  );
}

export function AIBuilderClient() {
  const { models, activeView, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, selectedModelId } = useAIBuilderStore();

  if (activeView === 'model-detail' && selectedModelId) {
    return <ModelDetail />;
  }

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'document', 'text', 'vision', 'prediction'];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#ec4899' }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>AI Builder</h1>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI model hub for intelligent automation</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="px-6 pt-5 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
              style={{
                backgroundColor: categoryFilter === cat ? (cat === 'all' ? 'var(--sidebar-accent)' : (categoryColors[cat] ?? 'var(--sidebar-accent)')) + '20' : 'var(--card)',
                color: categoryFilter === cat ? (cat === 'all' ? 'var(--sidebar-accent)' : categoryColors[cat]) : 'var(--muted-foreground)',
                border: `1px solid ${categoryFilter === cat ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {cat === 'all' ? 'All Models' : categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Models grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <Brain size={48} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No models found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
