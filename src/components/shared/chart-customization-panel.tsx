'use client';

import React, { useState } from 'react';
import {
  ChartConfig, AdvancedChartType, ChartTheme, LegendPosition,
  TrendlineType, CHART_CATEGORIES, DataSeries,
} from './chart-types';

interface ChartCustomizationPanelProps {
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
}

export default function ChartCustomizationPanel({ config, onChange }: ChartCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'data' | 'design' | 'format'>('type');

  const update = (partial: Partial<ChartConfig>) => {
    onChange({ ...config, ...partial });
  };

  const updateSeries = (idx: number, partial: Partial<DataSeries>) => {
    const newSeries = [...config.series];
    newSeries[idx] = { ...newSeries[idx], ...partial };
    onChange({ ...config, series: newSeries });
  };

  const addSeries = () => {
    const newSeries: DataSeries = {
      name: `Series ${config.series.length + 1}`,
      data: config.labels.map(() => Math.floor(Math.random() * 50) + 5),
    };
    onChange({ ...config, series: [...config.series, newSeries] });
  };

  const removeSeries = (idx: number) => {
    if (config.series.length <= 1) return;
    onChange({ ...config, series: config.series.filter((_, i) => i !== idx) });
  };

  const tabs = [
    { key: 'type' as const, label: 'Chart Type' },
    { key: 'data' as const, label: 'Data' },
    { key: 'design' as const, label: 'Design' },
    { key: 'format' as const, label: 'Format' },
  ];

  return (
    <div className="flex flex-col h-full text-sm">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* CHART TYPE TAB */}
        {activeTab === 'type' && (
          <div className="space-y-3">
            {Object.entries(CHART_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{category.label}</div>
                <div className="grid grid-cols-4 gap-1">
                  {category.types.map(ct => (
                    <button key={ct.type} onClick={() => update({ type: ct.type as AdvancedChartType })}
                      className={`p-1.5 rounded text-[10px] border transition-colors ${
                        config.type === ct.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 text-gray-600 dark:text-gray-300'
                      }`}>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DATA TAB */}
        {activeTab === 'data' && (
          <div className="space-y-3">
            {/* Labels */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Labels (comma-separated)</label>
              <input
                className="w-full mt-1 px-2 py-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={config.labels.join(', ')}
                onChange={e => update({ labels: e.target.value.split(',').map(s => s.trim()) })}
              />
            </div>

            {/* Series */}
            {config.series.map((s, idx) => (
              <div key={idx} className="border rounded p-2 space-y-1.5 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <input className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={s.name}
                    onChange={e => updateSeries(idx, { name: e.target.value })} />
                  <input type="color" className="w-6 h-6 cursor-pointer" value={s.color || '#4e79a7'}
                    onChange={e => updateSeries(idx, { color: e.target.value })} />
                  {config.series.length > 1 && (
                    <button onClick={() => removeSeries(idx)} className="text-red-500 text-xs hover:text-red-700">×</button>
                  )}
                </div>
                <input className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={s.data.join(', ')}
                  onChange={e => updateSeries(idx, { data: e.target.value.split(',').map(v => parseFloat(v.trim()) || 0) })} />
                {/* Combo chart: per-series type */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">Type:</span>
                  <select className="text-[10px] px-1 py-0.5 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={s.chartType || 'default'}
                    onChange={e => updateSeries(idx, { chartType: e.target.value === 'default' ? undefined : e.target.value as any })}>
                    <option value="default">Default</option>
                    <option value="column">Column</option>
                    <option value="line">Line</option>
                    <option value="area">Area</option>
                  </select>
                  <span className="text-[10px] text-gray-500 ml-1">Y-Axis:</span>
                  <select className="text-[10px] px-1 py-0.5 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={s.yAxisId || 'left'}
                    onChange={e => updateSeries(idx, { yAxisId: e.target.value as 'left' | 'right' })}>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            ))}
            <button onClick={addSeries}
              className="w-full py-1.5 text-xs border border-dashed rounded hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-500 dark:text-gray-300">
              + Add Series
            </button>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Chart Title</label>
              <input className="w-full mt-1 px-2 py-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={config.title} onChange={e => update({ title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Subtitle</label>
              <input className="w-full mt-1 px-2 py-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={config.subtitle || ''} onChange={e => update({ subtitle: e.target.value })} />
            </div>

            {/* Theme */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Theme</label>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {(['light', 'dark', 'scientific', 'publication'] as ChartTheme[]).map(t => (
                  <button key={t} onClick={() => update({ theme: t })}
                    className={`p-1.5 rounded text-xs border capitalize ${
                      config.theme === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Axis Labels */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">X-Axis Label</label>
                <input className="w-full mt-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={config.xAxis.label} onChange={e => update({ xAxis: { ...config.xAxis, label: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Y-Axis Label</label>
                <input className="w-full mt-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={config.yAxis.label} onChange={e => update({ yAxis: { ...config.yAxis, label: e.target.value } })} />
              </div>
            </div>

            {/* Legend */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Legend Position</label>
              <select className="w-full mt-1 px-2 py-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={config.legendPosition}
                onChange={e => update({ legendPosition: e.target.value as LegendPosition })}>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="none">None</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs dark:text-gray-300">
                <input type="checkbox" checked={config.showGridlines}
                  onChange={e => update({ showGridlines: e.target.checked })} />
                Show Gridlines
              </label>
              <label className="flex items-center gap-2 text-xs dark:text-gray-300">
                <input type="checkbox" checked={config.showDataLabels}
                  onChange={e => update({ showDataLabels: e.target.checked })} />
                Show Data Labels
              </label>
              <label className="flex items-center gap-2 text-xs dark:text-gray-300">
                <input type="checkbox" checked={config.animate}
                  onChange={e => update({ animate: e.target.checked })} />
                Animation
              </label>
            </div>

            {/* Secondary Y Axis */}
            <label className="flex items-center gap-2 text-xs dark:text-gray-300">
              <input type="checkbox" checked={!!config.secondaryYAxis}
                onChange={e => update({
                  secondaryYAxis: e.target.checked ? { label: 'Secondary Y' } : undefined,
                })} />
              Secondary Y-Axis
            </label>
          </div>
        )}

        {/* FORMAT TAB */}
        {activeTab === 'format' && (
          <div className="space-y-3">
            {/* Trendline */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Trendline</label>
              <select className="w-full mt-1 px-2 py-1.5 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                value={config.trendline?.type || 'none'}
                onChange={e => {
                  const val = e.target.value;
                  update({
                    trendline: val === 'none' ? undefined : {
                      type: val as TrendlineType,
                      order: 2,
                      period: 3,
                      color: '#ff0000',
                      showEquation: false,
                      showR2: false,
                    },
                  });
                }}>
                <option value="none">None</option>
                <option value="linear">Linear</option>
                <option value="polynomial">Polynomial</option>
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
                <option value="moving-average">Moving Average</option>
              </select>
              {config.trendline?.type === 'moving-average' && (
                <div className="mt-1.5">
                  <label className="text-[10px] text-gray-500">Period</label>
                  <input type="number" min={2} max={20}
                    className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={config.trendline.period ?? 3}
                    onChange={e => update({
                      trendline: { ...config.trendline!, period: parseInt(e.target.value) || 3 },
                    })} />
                </div>
              )}
            </div>

            {/* Error Bars */}
            <div>
              <label className="flex items-center gap-2 text-xs dark:text-gray-300">
                <input type="checkbox" checked={config.errorBars?.show ?? false}
                  onChange={e => update({
                    errorBars: {
                      show: e.target.checked,
                      type: config.errorBars?.type || 'fixed',
                      value: config.errorBars?.value ?? 5,
                    },
                  })} />
                Error Bars
              </label>
              {config.errorBars?.show && (
                <div className="mt-1.5 space-y-1.5 pl-4">
                  <select className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={config.errorBars.type}
                    onChange={e => update({
                      errorBars: { ...config.errorBars!, type: e.target.value as any },
                    })}>
                    <option value="fixed">Fixed Value</option>
                    <option value="percentage">Percentage</option>
                    <option value="standard-deviation">Standard Deviation</option>
                  </select>
                  <input type="number" className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                    value={config.errorBars.value}
                    onChange={e => update({
                      errorBars: { ...config.errorBars!, value: parseFloat(e.target.value) || 0 },
                    })} />
                </div>
              )}
            </div>

            {/* Chart Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Width</label>
                <input type="number" className="w-full mt-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={config.width} onChange={e => update({ width: parseInt(e.target.value) || 400 })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Height</label>
                <input type="number" className="w-full mt-1 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                  value={config.height} onChange={e => update({ height: parseInt(e.target.value) || 300 })} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
