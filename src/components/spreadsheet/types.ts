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

export interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie" | "area";
  title: string;
  dataRange: string;
  position: { x: number; y: number; width: number; height: number };
}
