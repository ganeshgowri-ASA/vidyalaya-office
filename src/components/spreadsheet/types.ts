export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  format?: "general" | "number" | "currency" | "percentage" | "date";
  bgColor?: string;
  textColor?: string;
  borders?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
}

export interface Cell {
  value: string;
  formula?: string;
  computed?: string | number;
  style?: CellStyle;
  mergeParent?: string;
  mergeSpan?: { rows: number; cols: number };
}

export interface ConditionalFormatRule {
  id: string;
  condition: "gt" | "lt" | "eq" | "gte" | "lte";
  value: number;
  bgColor: string;
  textColor?: string;
}

export interface Sheet {
  id: string;
  name: string;
  cells: Record<string, Cell>;
  frozenRows: number;
  frozenCols: number;
  colWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  conditionalFormats: ConditionalFormatRule[];
}

export type SpreadsheetChartType = "bar" | "line" | "pie" | "area" | "scatter" | "doughnut" | "radar" | "combo";

export interface ChartSeriesConfig {
  dataKey: string;
  label: string;
  color: string;
  type?: "bar" | "line" | "area"; // for combo charts
  yAxisId?: "left" | "right";
  hidden?: boolean;
}

export interface ChartAxisConfig {
  label: string;
  min?: number;
  max?: number;
  tickCount?: number;
  showGridlines?: boolean;
}

export interface ChartCustomization {
  showLegend: boolean;
  legendPosition: "top" | "bottom" | "left" | "right";
  showGridlines: boolean;
  showDataLabels: boolean;
  showTitle: boolean;
  titleFontSize: number;
  backgroundColor: string;
  borderRadius: number;
  animate: boolean;
  colorPalette: string[];
}

export interface ChartConfig {
  id: string;
  type: SpreadsheetChartType;
  title: string;
  dataRange: string;
  position: { x: number; y: number; width: number; height: number };
  series: ChartSeriesConfig[];
  xAxis: ChartAxisConfig;
  yAxis: ChartAxisConfig;
  customization: ChartCustomization;
}

export const DEFAULT_CHART_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export const CHART_COLOR_PALETTES: Record<string, string[]> = {
  default: ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"],
  ocean: ["#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"],
  sunset: ["#f97316", "#ef4444", "#ec4899", "#f59e0b", "#eab308", "#d97706", "#b91c1c", "#be185d"],
  forest: ["#16a34a", "#15803d", "#166534", "#14532d", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"],
  purple: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#6d28d9", "#5b21b6", "#4c1d95", "#ddd6fe"],
  mono: ["#18181b", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7", "#f4f4f5"],
};

export function getDefaultChartCustomization(): ChartCustomization {
  return {
    showLegend: true,
    legendPosition: "bottom",
    showGridlines: true,
    showDataLabels: false,
    showTitle: true,
    titleFontSize: 14,
    backgroundColor: "transparent",
    borderRadius: 8,
    animate: true,
    colorPalette: CHART_COLOR_PALETTES.default,
  };
}

export function createDefaultChartConfig(
  id: string,
  type: SpreadsheetChartType,
  title: string,
  dataRange: string,
  dataKeys: string[],
): ChartConfig {
  const customization = getDefaultChartCustomization();
  return {
    id,
    type,
    title,
    dataRange,
    position: { x: 100, y: 100, width: 520, height: 360 },
    series: dataKeys.map((key, i) => ({
      dataKey: key,
      label: key,
      color: customization.colorPalette[i % customization.colorPalette.length],
    })),
    xAxis: { label: "", showGridlines: true },
    yAxis: { label: "", showGridlines: true },
    customization,
  };
}
