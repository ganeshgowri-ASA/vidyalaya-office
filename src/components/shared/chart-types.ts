// Advanced Chart Engine - Type definitions

export type BasicChartType = 'column' | 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'bubble';

export type StatisticalChartType = 'boxplot' | 'violin' | 'histogram' | 'qqplot' | 'pareto' | 'control-xbar' | 'control-r' | 'control-s' | 'control-p' | 'control-c' | 'control-u' | 'errorbar';

export type ScientificChartType = 'contour' | 'heatmap' | 'surface3d' | 'polar' | 'radar' | 'waterfall' | 'funnel' | 'treemap' | 'sunburst';

export type FinancialChartType = 'candlestick' | 'ohlc' | 'stock-volume' | 'sparkline';

export type EngineeringChartType = 'smith' | 'bode' | 'nyquist';

export type AdvancedChartType = BasicChartType | StatisticalChartType | ScientificChartType | FinancialChartType | EngineeringChartType;

export type TrendlineType = 'linear' | 'polynomial' | 'exponential' | 'logarithmic' | 'moving-average';

export type ChartTheme = 'light' | 'dark' | 'scientific' | 'publication';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'none';

export interface DataSeries {
  name: string;
  data: number[];
  color?: string;
  chartType?: BasicChartType; // For combo charts
  yAxisId?: 'left' | 'right';
}

export interface TrendlineConfig {
  type: TrendlineType;
  order?: number; // for polynomial
  period?: number; // for moving average
  color?: string;
  showEquation?: boolean;
  showR2?: boolean;
}

export interface ErrorBarConfig {
  show: boolean;
  type: 'fixed' | 'percentage' | 'standard-deviation';
  value: number;
}

export interface AxisConfig {
  label: string;
  min?: number;
  max?: number;
  tickCount?: number;
  logarithmic?: boolean;
  reversed?: boolean;
}

export interface ChartConfig {
  type: AdvancedChartType;
  title: string;
  subtitle?: string;
  theme: ChartTheme;
  labels: string[];
  series: DataSeries[];
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  secondaryYAxis?: AxisConfig;
  legendPosition: LegendPosition;
  showGridlines: boolean;
  showDataLabels: boolean;
  trendline?: TrendlineConfig;
  errorBars?: ErrorBarConfig;
  animate: boolean;
  width: number;
  height: number;
}

export const CHART_CATEGORIES = {
  basic: {
    label: 'Basic Charts',
    types: [
      { type: 'column' as const, label: 'Column', icon: 'BarChart3' },
      { type: 'bar' as const, label: 'Bar', icon: 'BarChartHorizontal' },
      { type: 'line' as const, label: 'Line', icon: 'LineChart' },
      { type: 'pie' as const, label: 'Pie', icon: 'PieChart' },
      { type: 'doughnut' as const, label: 'Doughnut', icon: 'Circle' },
      { type: 'area' as const, label: 'Area', icon: 'AreaChart' },
      { type: 'scatter' as const, label: 'Scatter', icon: 'ScatterChart' },
      { type: 'bubble' as const, label: 'Bubble', icon: 'Circle' },
    ],
  },
  statistical: {
    label: 'Statistical (SPSS/Minitab)',
    types: [
      { type: 'boxplot' as const, label: 'Box Plot', icon: 'BoxSelect' },
      { type: 'violin' as const, label: 'Violin Plot', icon: 'Activity' },
      { type: 'histogram' as const, label: 'Histogram', icon: 'BarChart' },
      { type: 'qqplot' as const, label: 'QQ Plot', icon: 'GitBranch' },
      { type: 'pareto' as const, label: 'Pareto Chart', icon: 'TrendingDown' },
      { type: 'control-xbar' as const, label: 'Control Chart (X̄)', icon: 'Activity' },
      { type: 'control-r' as const, label: 'Control Chart (R)', icon: 'Activity' },
      { type: 'control-p' as const, label: 'Control Chart (p)', icon: 'Activity' },
      { type: 'errorbar' as const, label: 'Error Bar', icon: 'ArrowUpDown' },
    ],
  },
  scientific: {
    label: 'Scientific (Origin/MATLAB)',
    types: [
      { type: 'contour' as const, label: 'Contour Plot', icon: 'Layers' },
      { type: 'heatmap' as const, label: 'Heatmap', icon: 'Grid3x3' },
      { type: 'surface3d' as const, label: 'Surface 3D', icon: 'Box' },
      { type: 'polar' as const, label: 'Polar/Radar', icon: 'Radar' },
      { type: 'waterfall' as const, label: 'Waterfall', icon: 'BarChart' },
      { type: 'funnel' as const, label: 'Funnel', icon: 'Triangle' },
      { type: 'treemap' as const, label: 'Treemap', icon: 'LayoutGrid' },
      { type: 'sunburst' as const, label: 'Sunburst', icon: 'Sun' },
    ],
  },
  financial: {
    label: 'Financial',
    types: [
      { type: 'candlestick' as const, label: 'Candlestick', icon: 'CandlestickChart' },
      { type: 'ohlc' as const, label: 'OHLC', icon: 'BarChart' },
      { type: 'stock-volume' as const, label: 'Stock + Volume', icon: 'TrendingUp' },
      { type: 'sparkline' as const, label: 'Sparkline', icon: 'Minus' },
    ],
  },
  engineering: {
    label: 'Engineering',
    types: [
      { type: 'smith' as const, label: 'Smith Chart', icon: 'Circle' },
      { type: 'bode' as const, label: 'Bode Plot', icon: 'Activity' },
      { type: 'nyquist' as const, label: 'Nyquist Plot', icon: 'RotateCcw' },
    ],
  },
};

export const CHART_THEME_COLORS: Record<ChartTheme, { bg: string; text: string; grid: string; colors: string[] }> = {
  light: {
    bg: '#ffffff',
    text: '#333333',
    grid: '#e0e0e0',
    colors: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7'],
  },
  dark: {
    bg: '#1e1e2e',
    text: '#cdd6f4',
    grid: '#45475a',
    colors: ['#89b4fa', '#fab387', '#f38ba8', '#94e2d5', '#a6e3a1', '#f9e2af', '#cba6f7', '#f5c2e7'],
  },
  scientific: {
    bg: '#ffffff',
    text: '#000000',
    grid: '#cccccc',
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'],
  },
  publication: {
    bg: '#ffffff',
    text: '#000000',
    grid: '#d0d0d0',
    colors: ['#000000', '#555555', '#888888', '#aaaaaa', '#333333', '#666666', '#999999', '#bbbbbb'],
  },
};

export function getDefaultChartConfig(type: AdvancedChartType): ChartConfig {
  return {
    type,
    title: 'Chart Title',
    theme: 'light',
    labels: ['A', 'B', 'C', 'D', 'E'],
    series: [{ name: 'Series 1', data: [10, 25, 15, 30, 20] }],
    xAxis: { label: '' },
    yAxis: { label: '' },
    legendPosition: 'bottom',
    showGridlines: true,
    showDataLabels: false,
    animate: true,
    width: 600,
    height: 400,
  };
}
