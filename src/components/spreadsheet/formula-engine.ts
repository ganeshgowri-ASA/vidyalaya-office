// Formula engine - parses and evaluates spreadsheet formulas

export type CellAddress = { col: number; row: number };

export function colToLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

export function letterToCol(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

export function parseCellRef(ref: string): CellAddress | null {
  const match = ref.match(/^([A-Z])(\d+)$/i);
  if (!match) return null;
  return { col: letterToCol(match[1]), row: parseInt(match[2], 10) - 1 };
}

export function parseRange(range: string): CellAddress[] {
  const parts = range.split(":");
  if (parts.length !== 2) return [];
  const start = parseCellRef(parts[0]);
  const end = parseCellRef(parts[1]);
  if (!start || !end) return [];
  const cells: CellAddress[] = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      cells.push({ col: c, row: r });
    }
  }
  return cells;
}

export function getCellDependencies(formula: string): string[] {
  if (!formula.startsWith("=")) return [];
  const deps: string[] = [];
  // Match ranges like A1:B10
  const rangeRegex = /([A-Z]\d+):([A-Z]\d+)/gi;
  let match;
  const rangeRefs = new Set<string>();
  while ((match = rangeRegex.exec(formula)) !== null) {
    const cells = parseRange(`${match[1]}:${match[2]}`);
    cells.forEach((c) => {
      const key = `${colToLetter(c.col)}${c.row + 1}`;
      deps.push(key);
      rangeRefs.add(match![0]);
    });
  }
  // Match single cell refs like A1
  const cellRegex = /\b([A-Z]\d+)\b/gi;
  while ((match = cellRegex.exec(formula)) !== null) {
    // Skip if this cell ref is part of a range we already processed
    const ref = match[1].toUpperCase();
    if (!deps.includes(ref)) {
      deps.push(ref);
    }
  }
  return Array.from(new Set(deps));
}

type CellGetter = (col: number, row: number) => number | string;

function resolveValues(rangeStr: string, getCell: CellGetter): (number | string)[] {
  const cells = parseRange(rangeStr);
  return cells.map((c) => getCell(c.col, c.row));
}

function toNumbers(values: (number | string)[]): number[] {
  return values
    .map((v) => (typeof v === "string" ? parseFloat(v) : v))
    .filter((v) => !isNaN(v));
}

export function evaluateFormula(
  formula: string,
  getCell: CellGetter
): string | number {
  if (!formula.startsWith("=")) return formula;
  const expr = formula.slice(1).trim();

  try {
    // Handle functions
    const funcMatch = expr.match(/^(\w+)\((.+)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const args = funcMatch[2];

      switch (funcName) {
        case "SUM": {
          const vals = resolveArgs(args, getCell);
          const nums = toNumbers(vals);
          return nums.reduce((a, b) => a + b, 0);
        }
        case "AVERAGE": {
          const vals = resolveArgs(args, getCell);
          const nums = toNumbers(vals);
          return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
        }
        case "COUNT": {
          const vals = resolveArgs(args, getCell);
          return toNumbers(vals).length;
        }
        case "MAX": {
          const vals = resolveArgs(args, getCell);
          const nums = toNumbers(vals);
          return nums.length ? Math.max(...nums) : 0;
        }
        case "MIN": {
          const vals = resolveArgs(args, getCell);
          const nums = toNumbers(vals);
          return nums.length ? Math.min(...nums) : 0;
        }
        case "IF": {
          const ifArgs = splitIfArgs(args);
          if (ifArgs.length < 3) return "#ERROR";
          const condition = evaluateExpression(ifArgs[0], getCell);
          return condition
            ? evaluateExpression(ifArgs[1], getCell)
            : evaluateExpression(ifArgs[2], getCell);
        }
        case "VLOOKUP": {
          const vArgs = splitIfArgs(args);
          if (vArgs.length < 3) return "#ERROR";
          const lookupValue = evaluateExpression(vArgs[0], getCell);
          const rangeStr = vArgs[1].trim();
          const colIndex = Number(evaluateExpression(vArgs[2], getCell));
          const exactMatch = vArgs.length >= 4 ? evaluateExpression(vArgs[3], getCell) : 1;
          const rangeCells = parseRange(rangeStr);
          if (rangeCells.length === 0 || colIndex < 1) return "#ERROR";
          const minCol = Math.min(...rangeCells.map((c) => c.col));
          const maxCol = Math.max(...rangeCells.map((c) => c.col));
          const minRow = Math.min(...rangeCells.map((c) => c.row));
          const maxRow = Math.max(...rangeCells.map((c) => c.row));
          if (minCol + colIndex - 1 > maxCol) return "#REF!";
          for (let r = minRow; r <= maxRow; r++) {
            const cellVal = getCell(minCol, r);
            const matches = exactMatch
              ? cellVal == lookupValue || String(cellVal) === String(lookupValue)
              : String(cellVal).toLowerCase().includes(String(lookupValue).toLowerCase());
            if (matches) {
              return getCell(minCol + colIndex - 1, r);
            }
          }
          return "#N/A";
        }
        case "CONCAT":
        case "CONCATENATE": {
          const cArgs = resolveArgs(args, getCell);
          return cArgs.map((v) => String(v)).join("");
        }
        case "ROUND": {
          const rArgs = splitIfArgs(args);
          if (rArgs.length < 2) return "#ERROR";
          const num = Number(evaluateExpression(rArgs[0], getCell));
          const decimals = Number(evaluateExpression(rArgs[1], getCell));
          if (isNaN(num) || isNaN(decimals)) return "#ERROR";
          const factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        }
        case "ABS": {
          const aArgs = resolveArgs(args, getCell);
          const aNum = toNumbers(aArgs);
          if (aNum.length === 0) return "#ERROR";
          return Math.abs(aNum[0]);
        }
        case "UPPER": {
          const uArgs = resolveArgs(args, getCell);
          if (uArgs.length === 0) return "#ERROR";
          return String(uArgs[0]).toUpperCase();
        }
        case "LOWER": {
          const lArgs = resolveArgs(args, getCell);
          if (lArgs.length === 0) return "#ERROR";
          return String(lArgs[0]).toLowerCase();
        }
        default:
          return "#NAME?";
      }
    }

    // Handle simple expressions (arithmetic with cell refs)
    return evaluateExpression(expr, getCell);
  } catch {
    return "#ERROR";
  }
}

function splitIfArgs(args: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of args) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function resolveArgs(args: string, getCell: CellGetter): (number | string)[] {
  // Check if it's a range
  if (args.match(/^[A-Z]\d+:[A-Z]\d+$/i)) {
    return resolveValues(args, getCell);
  }
  // Could be comma-separated
  const parts = splitIfArgs(args);
  const vals: (number | string)[] = [];
  for (const part of parts) {
    if (part.match(/^[A-Z]\d+:[A-Z]\d+$/i)) {
      vals.push(...resolveValues(part, getCell));
    } else if (part.match(/^[A-Z]\d+$/i)) {
      const ref = parseCellRef(part);
      if (ref) vals.push(getCell(ref.col, ref.row));
    } else {
      const n = parseFloat(part);
      vals.push(isNaN(n) ? part : n);
    }
  }
  return vals;
}

function evaluateExpression(
  expr: string,
  getCell: CellGetter
): number | string {
  let resolved = expr.trim();

  // Replace cell references with their values
  resolved = resolved.replace(/\b([A-Z]\d+)\b/gi, (match) => {
    const ref = parseCellRef(match);
    if (!ref) return match;
    const val = getCell(ref.col, ref.row);
    if (typeof val === "string" && val === "") return "0";
    return String(val);
  });

  // Handle string literals
  if (resolved.startsWith('"') && resolved.endsWith('"')) {
    return resolved.slice(1, -1);
  }

  // Handle comparison operators for IF
  const compMatch = resolved.match(/^(.+?)\s*(>=|<=|<>|!=|>|<|=)\s*(.+)$/);
  if (compMatch) {
    const left = safeEval(compMatch[1]);
    const right = safeEval(compMatch[3]);
    switch (compMatch[2]) {
      case ">": return left > right ? 1 : 0;
      case "<": return left < right ? 1 : 0;
      case ">=": return left >= right ? 1 : 0;
      case "<=": return left <= right ? 1 : 0;
      case "=": return left === right ? 1 : 0;
      case "<>": case "!=": return left !== right ? 1 : 0;
    }
  }

  const num = safeEval(resolved);
  return num;
}

function safeEval(expr: string): number {
  // Simple arithmetic evaluator - supports +, -, *, /
  try {
    // Only allow numbers, operators, spaces, parentheses, dots
    const sanitized = expr.replace(/\s/g, "");
    if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
      const n = parseFloat(sanitized);
      return isNaN(n) ? 0 : n;
    }
    // Use Function constructor for safe math evaluation
    const result = new Function(`"use strict"; return (${sanitized})`)();
    return typeof result === "number" && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}
