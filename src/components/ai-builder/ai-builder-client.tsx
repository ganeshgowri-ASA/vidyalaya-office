'use client';

import { useState } from 'react';
import {
  Brain, Search, Play, ArrowLeft, BarChart3, Zap, FileSearch,
  Smile, TextCursor as TextCursorIcon, Tags, ScanSearch, TrendingUp, Target,
  CheckCircle2, XCircle, RefreshCw, Clock, ChevronRight,
  Send, Sparkles, TestTube, GraduationCap, Plug, Settings,
  Eye, FileText, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIBuilderStore, AIModel } from '@/store/ai-builder-store';

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

function ModelDetail() {
  const { models, selectedModelId, setSelectedModelId, setActiveView, testResults, testInput, setTestInput, runTest, trainingRuns, startTraining } = useAIBuilderStore();
  const model = models.find((m) => m.id === selectedModelId);

  if (!model) return null;

  const Icon = modelIcons[model.icon] ?? Brain;
  const color = categoryColors[model.category];
  const modelTestResults = testResults.filter((r) => r.modelId === model.id);
  const modelTrainingRuns = trainingRuns.filter((r) => r.modelId === model.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'training' | 'integrate'>('overview');

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
            <div className="rounded-lg border p-4 mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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

            {modelTestResults.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Results</h3>
                <div className="space-y-3">
                  {modelTestResults.map((result) => (
                    <div key={result.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Input</p>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: color + '20', color }}>{result.confidence}% confidence</span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: 'var(--foreground)' }}>{result.input}</p>
                      <div className="rounded p-3" style={{ backgroundColor: 'var(--background)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Output</p>
                        <p className="text-sm font-medium" style={{ color }}>{result.output}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
