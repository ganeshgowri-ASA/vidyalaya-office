// Formula engine - parses and evaluates spreadsheet formulas

export type CellAddress = { col: number; row: number };

export function colToLetter(col: number): string {
  let result = "";
  let c = col;
  while (c >= 0) {
    result = String.fromCharCode(65 + (c % 26)) + result;
    c = Math.floor(c / 26) - 1;
  }
  return result;
}

export function letterToCol(letter: string): number {
  let col = 0;
  const upper = letter.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseCellRef(ref: string): CellAddress | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
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
  const rangeRegex = /([A-Z]+\d+):([A-Z]+\d+)/gi;
  let match;
  while ((match = rangeRegex.exec(formula)) !== null) {
    const cells = parseRange(`${match[1]}:${match[2]}`);
    cells.forEach((c) => {
      const key = `${colToLetter(c.col)}${c.row + 1}`;
      deps.push(key);
    });
  }
  const cellRegex = /\b([A-Z]+\d+)\b/gi;
  while ((match = cellRegex.exec(formula)) !== null) {
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

function splitArgs(args: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = "";
  let inString = false;
  for (const ch of args) {
    if (ch === '"' && !inString) { inString = true; current += ch; continue; }
    if (ch === '"' && inString) { inString = false; current += ch; continue; }
    if (inString) { current += ch; continue; }
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
  if (args.match(/^[A-Z]+\d+:[A-Z]+\d+$/i)) {
    return resolveValues(args, getCell);
  }
  const parts = splitArgs(args);
  const vals: (number | string)[] = [];
  for (const part of parts) {
    if (part.match(/^[A-Z]+\d+:[A-Z]+\d+$/i)) {
      vals.push(...resolveValues(part, getCell));
    } else if (part.match(/^[A-Z]+\d+$/i)) {
      const ref = parseCellRef(part);
      if (ref) vals.push(getCell(ref.col, ref.row));
    } else if (part.startsWith('"') && part.endsWith('"')) {
      vals.push(part.slice(1, -1));
    } else {
      const n = parseFloat(part);
      vals.push(isNaN(n) ? part : n);
    }
  }
  return vals;
}

function evalArg(arg: string, getCell: CellGetter): number | string {
  const trimmed = arg.trim();
  // String literal
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  // Nested function
  const funcMatch = trimmed.match(/^(\w+)\((.+)\)$/i);
  if (funcMatch) {
    return evaluateFormula("=" + trimmed, getCell);
  }
  // Cell reference
  if (trimmed.match(/^[A-Z]+\d+$/i)) {
    const ref = parseCellRef(trimmed);
    if (ref) return getCell(ref.col, ref.row);
  }
  return evaluateExpression(trimmed, getCell);
}

function toNum(v: number | string): number {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function matchCriteria(value: number | string, criteria: string): boolean {
  const trimmed = criteria.trim();
  // Comparison operators
  const compMatch = trimmed.match(/^(>=|<=|<>|!=|>|<|=)(.+)$/);
  if (compMatch) {
    const op = compMatch[1];
    const target = parseFloat(compMatch[2]);
    const numVal = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(target) || isNaN(numVal)) {
      const sTarget = compMatch[2].toLowerCase();
      const sVal = String(value).toLowerCase();
      switch (op) {
        case "=": return sVal === sTarget;
        case "<>": case "!=": return sVal !== sTarget;
        default: return false;
      }
    }
    switch (op) {
      case ">": return numVal > target;
      case "<": return numVal < target;
      case ">=": return numVal >= target;
      case "<=": return numVal <= target;
      case "=": return numVal === target;
      case "<>": case "!=": return numVal !== target;
    }
  }
  // Numeric equality
  const critNum = parseFloat(trimmed);
  if (!isNaN(critNum)) {
    const numVal = typeof value === "number" ? value : parseFloat(String(value));
    return numVal === critNum;
  }
  // Wildcard text match
  const pattern = trimmed.replace(/\*/g, ".*").replace(/\?/g, ".");
  try {
    return new RegExp("^" + pattern + "$", "i").test(String(value));
  } catch {
    return String(value).toLowerCase() === trimmed.toLowerCase();
  }
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
          return toNumbers(vals).reduce((a, b) => a + b, 0);
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
        case "COUNTA": {
          const vals = resolveArgs(args, getCell);
          return vals.filter((v) => v !== "" && v !== null && v !== undefined).length;
        }
        case "COUNTBLANK": {
          const vals = resolveArgs(args, getCell);
          return vals.filter((v) => v === "" || v === null || v === undefined).length;
        }
        case "MAX": {
          const nums = toNumbers(resolveArgs(args, getCell));
          return nums.length ? Math.max(...nums) : 0;
        }
        case "MIN": {
          const nums = toNumbers(resolveArgs(args, getCell));
          return nums.length ? Math.min(...nums) : 0;
        }
        case "MEDIAN": {
          const nums = toNumbers(resolveArgs(args, getCell)).sort((a, b) => a - b);
          if (nums.length === 0) return 0;
          const mid = Math.floor(nums.length / 2);
          return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        }
        case "STDEV": {
          const nums = toNumbers(resolveArgs(args, getCell));
          if (nums.length < 2) return 0;
          const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
          const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / (nums.length - 1);
          return Math.sqrt(variance);
        }
        case "IF": {
          const ifArgs = splitArgs(args);
          if (ifArgs.length < 2) return "#ERROR";
          const condition = evalArg(ifArgs[0], getCell);
          const truthy = typeof condition === "number" ? condition !== 0 : condition !== "" && condition !== "0";
          if (truthy) return ifArgs.length >= 2 ? evalArg(ifArgs[1], getCell) : 1;
          return ifArgs.length >= 3 ? evalArg(ifArgs[2], getCell) : 0;
        }
        case "IFS": {
          const ifsArgs = splitArgs(args);
          for (let i = 0; i < ifsArgs.length - 1; i += 2) {
            const cond = evalArg(ifsArgs[i], getCell);
            const truthy = typeof cond === "number" ? cond !== 0 : cond !== "" && cond !== "0";
            if (truthy) return evalArg(ifsArgs[i + 1], getCell);
          }
          return "#N/A";
        }
        case "SWITCH": {
          const swArgs = splitArgs(args);
          if (swArgs.length < 3) return "#ERROR";
          const switchVal = evalArg(swArgs[0], getCell);
          for (let i = 1; i < swArgs.length - 1; i += 2) {
            if (String(evalArg(swArgs[i], getCell)) === String(switchVal)) {
              return evalArg(swArgs[i + 1], getCell);
            }
          }
          return swArgs.length % 2 === 0 ? evalArg(swArgs[swArgs.length - 1], getCell) : "#N/A";
        }
        case "AND": {
          const andArgs = splitArgs(args);
          for (const a of andArgs) {
            const v = evalArg(a, getCell);
            if (v === 0 || v === "" || v === "0") return 0;
          }
          return 1;
        }
        case "OR": {
          const orArgs = splitArgs(args);
          for (const a of orArgs) {
            const v = evalArg(a, getCell);
            if (v !== 0 && v !== "" && v !== "0") return 1;
          }
          return 0;
        }
        case "NOT": {
          const v = evalArg(args, getCell);
          return (v === 0 || v === "" || v === "0") ? 1 : 0;
        }
        case "IFERROR": {
          const ieArgs = splitArgs(args);
          if (ieArgs.length < 2) return "#ERROR";
          try {
            const val = evalArg(ieArgs[0], getCell);
            if (typeof val === "string" && val.startsWith("#")) return evalArg(ieArgs[1], getCell);
            return val;
          } catch {
            return evalArg(ieArgs[1], getCell);
          }
        }
        case "ISBLANK": {
          const v = evalArg(args, getCell);
          return v === "" ? 1 : 0;
        }
        case "ISNA": {
          const v = evalArg(args, getCell);
          return v === "#N/A" ? 1 : 0;
        }
        case "VLOOKUP": {
          const vArgs = splitArgs(args);
          if (vArgs.length < 3) return "#ERROR";
          const lookupValue = evalArg(vArgs[0], getCell);
          const rangeStr = vArgs[1].trim();
          const colIndex = toNum(evalArg(vArgs[2], getCell));
          const exactMatch = vArgs.length >= 4 ? toNum(evalArg(vArgs[3], getCell)) : 1;
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
              ? String(cellVal) === String(lookupValue)
              : String(cellVal).toLowerCase().includes(String(lookupValue).toLowerCase());
            if (matches) return getCell(minCol + colIndex - 1, r);
          }
          return "#N/A";
        }
        case "HLOOKUP": {
          const hArgs = splitArgs(args);
          if (hArgs.length < 3) return "#ERROR";
          const lookupVal = evalArg(hArgs[0], getCell);
          const rangeStr = hArgs[1].trim();
          const rowIdx = toNum(evalArg(hArgs[2], getCell));
          const rangeCells = parseRange(rangeStr);
          if (rangeCells.length === 0 || rowIdx < 1) return "#ERROR";
          const minCol = Math.min(...rangeCells.map((c) => c.col));
          const maxCol = Math.max(...rangeCells.map((c) => c.col));
          const minRow = Math.min(...rangeCells.map((c) => c.row));
          const maxRow = Math.max(...rangeCells.map((c) => c.row));
          if (minRow + rowIdx - 1 > maxRow) return "#REF!";
          for (let c = minCol; c <= maxCol; c++) {
            if (String(getCell(c, minRow)) === String(lookupVal)) {
              return getCell(c, minRow + rowIdx - 1);
            }
          }
          return "#N/A";
        }
        case "INDEX": {
          const idxArgs = splitArgs(args);
          if (idxArgs.length < 2) return "#ERROR";
          const rangeStr = idxArgs[0].trim();
          const rowIdx = toNum(evalArg(idxArgs[1], getCell));
          const colIdx = idxArgs.length >= 3 ? toNum(evalArg(idxArgs[2], getCell)) : 1;
          const rangeCells = parseRange(rangeStr);
          if (rangeCells.length === 0) return "#ERROR";
          const minCol = Math.min(...rangeCells.map((c) => c.col));
          const minRow = Math.min(...rangeCells.map((c) => c.row));
          return getCell(minCol + colIdx - 1, minRow + rowIdx - 1);
        }
        case "MATCH": {
          const mArgs = splitArgs(args);
          if (mArgs.length < 2) return "#ERROR";
          const lookupVal = evalArg(mArgs[0], getCell);
          const rangeStr = mArgs[1].trim();
          const rangeCells = parseRange(rangeStr);
          if (rangeCells.length === 0) return "#ERROR";
          for (let i = 0; i < rangeCells.length; i++) {
            if (String(getCell(rangeCells[i].col, rangeCells[i].row)) === String(lookupVal)) {
              return i + 1;
            }
          }
          return "#N/A";
        }
        case "XLOOKUP": {
          const xlArgs = splitArgs(args);
          if (xlArgs.length < 3) return "#ERROR";
          const lookupVal = evalArg(xlArgs[0], getCell);
          const lookupRange = parseRange(xlArgs[1].trim());
          const returnRange = parseRange(xlArgs[2].trim());
          if (lookupRange.length === 0 || returnRange.length === 0) return "#ERROR";
          for (let i = 0; i < lookupRange.length; i++) {
            if (String(getCell(lookupRange[i].col, lookupRange[i].row)) === String(lookupVal)) {
              if (i < returnRange.length) return getCell(returnRange[i].col, returnRange[i].row);
            }
          }
          return xlArgs.length >= 4 ? evalArg(xlArgs[3], getCell) : "#N/A";
        }
        case "OFFSET": {
          const oArgs = splitArgs(args);
          if (oArgs.length < 3) return "#ERROR";
          const baseRef = parseCellRef(oArgs[0].trim());
          if (!baseRef) return "#ERROR";
          const rowOff = toNum(evalArg(oArgs[1], getCell));
          const colOff = toNum(evalArg(oArgs[2], getCell));
          return getCell(baseRef.col + colOff, baseRef.row + rowOff);
        }
        case "CONCAT":
        case "CONCATENATE": {
          const cArgs = splitArgs(args);
          return cArgs.map((a) => String(evalArg(a, getCell))).join("");
        }
        case "LEFT": {
          const lArgs = splitArgs(args);
          const str = String(evalArg(lArgs[0], getCell));
          const cnt = lArgs.length >= 2 ? toNum(evalArg(lArgs[1], getCell)) : 1;
          return str.substring(0, cnt);
        }
        case "RIGHT": {
          const rArgs = splitArgs(args);
          const str = String(evalArg(rArgs[0], getCell));
          const cnt = rArgs.length >= 2 ? toNum(evalArg(rArgs[1], getCell)) : 1;
          return str.substring(str.length - cnt);
        }
        case "MID": {
          const mArgs = splitArgs(args);
          if (mArgs.length < 3) return "#ERROR";
          const str = String(evalArg(mArgs[0], getCell));
          const start = toNum(evalArg(mArgs[1], getCell));
          const len = toNum(evalArg(mArgs[2], getCell));
          return str.substring(start - 1, start - 1 + len);
        }
        case "LEN": {
          return String(evalArg(args, getCell)).length;
        }
        case "TRIM": {
          return String(evalArg(args, getCell)).trim();
        }
        case "UPPER": {
          return String(evalArg(args, getCell)).toUpperCase();
        }
        case "LOWER": {
          return String(evalArg(args, getCell)).toLowerCase();
        }
        case "PROPER": {
          const s = String(evalArg(args, getCell));
          return s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
        }
        case "SUBSTITUTE": {
          const sArgs = splitArgs(args);
          if (sArgs.length < 3) return "#ERROR";
          const text = String(evalArg(sArgs[0], getCell));
          const old = String(evalArg(sArgs[1], getCell));
          const newStr = String(evalArg(sArgs[2], getCell));
          if (sArgs.length >= 4) {
            const nth = toNum(evalArg(sArgs[3], getCell));
            let count = 0;
            return text.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (match) => {
              count++;
              return count === nth ? newStr : match;
            });
          }
          return text.split(old).join(newStr);
        }
        case "FIND": {
          const fArgs = splitArgs(args);
          if (fArgs.length < 2) return "#ERROR";
          const needle = String(evalArg(fArgs[0], getCell));
          const haystack = String(evalArg(fArgs[1], getCell));
          const startPos = fArgs.length >= 3 ? toNum(evalArg(fArgs[2], getCell)) - 1 : 0;
          const idx = haystack.indexOf(needle, startPos);
          return idx >= 0 ? idx + 1 : "#VALUE!";
        }
        case "SEARCH": {
          const sArgs = splitArgs(args);
          if (sArgs.length < 2) return "#ERROR";
          const needle = String(evalArg(sArgs[0], getCell)).toLowerCase();
          const haystack = String(evalArg(sArgs[1], getCell)).toLowerCase();
          const startPos = sArgs.length >= 3 ? toNum(evalArg(sArgs[2], getCell)) - 1 : 0;
          const idx = haystack.indexOf(needle, startPos);
          return idx >= 0 ? idx + 1 : "#VALUE!";
        }
        case "TEXT": {
          const tArgs = splitArgs(args);
          if (tArgs.length < 2) return "#ERROR";
          const val = toNum(evalArg(tArgs[0], getCell));
          const fmt = String(evalArg(tArgs[1], getCell));
          if (fmt.includes("%")) return (val * 100).toFixed(fmt.split(".")[1]?.replace(/[^0]/g, "").length || 0) + "%";
          if (fmt.includes("$")) return "$" + val.toFixed(2);
          const decimals = (fmt.split(".")[1] || "").length;
          return val.toFixed(decimals);
        }
        case "VALUE": {
          const v = evalArg(args, getCell);
          const n = parseFloat(String(v).replace(/[$,%]/g, ""));
          return isNaN(n) ? "#VALUE!" : n;
        }
        case "TODAY": {
          const now = new Date();
          const epoch = new Date(1900, 0, 1);
          return Math.floor((now.getTime() - epoch.getTime()) / 86400000) + 2;
        }
        case "NOW": {
          const now = new Date();
          const epoch = new Date(1900, 0, 1);
          return (now.getTime() - epoch.getTime()) / 86400000 + 2;
        }
        case "DATE": {
          const dArgs = splitArgs(args);
          if (dArgs.length < 3) return "#ERROR";
          const y = toNum(evalArg(dArgs[0], getCell));
          const m = toNum(evalArg(dArgs[1], getCell));
          const d = toNum(evalArg(dArgs[2], getCell));
          const date = new Date(y, m - 1, d);
          const epoch = new Date(1900, 0, 1);
          return Math.floor((date.getTime() - epoch.getTime()) / 86400000) + 2;
        }
        case "YEAR": {
          const serial = toNum(evalArg(args, getCell));
          const epoch = new Date(1900, 0, 1);
          const date = new Date(epoch.getTime() + (serial - 2) * 86400000);
          return date.getFullYear();
        }
        case "MONTH": {
          const serial = toNum(evalArg(args, getCell));
          const epoch = new Date(1900, 0, 1);
          const date = new Date(epoch.getTime() + (serial - 2) * 86400000);
          return date.getMonth() + 1;
        }
        case "DAY": {
          const serial = toNum(evalArg(args, getCell));
          const epoch = new Date(1900, 0, 1);
          const date = new Date(epoch.getTime() + (serial - 2) * 86400000);
          return date.getDate();
        }
        case "HOUR": {
          const serial = toNum(evalArg(args, getCell));
          const fraction = serial - Math.floor(serial);
          return Math.floor(fraction * 24);
        }
        case "MINUTE": {
          const serial = toNum(evalArg(args, getCell));
          const fraction = serial - Math.floor(serial);
          return Math.floor((fraction * 24 * 60) % 60);
        }
        case "ROUND": {
          const rArgs = splitArgs(args);
          if (rArgs.length < 2) return "#ERROR";
          const num = toNum(evalArg(rArgs[0], getCell));
          const decimals = toNum(evalArg(rArgs[1], getCell));
          const factor = Math.pow(10, decimals);
          return Math.round(num * factor) / factor;
        }
        case "ROUNDUP": {
          const rArgs = splitArgs(args);
          if (rArgs.length < 2) return "#ERROR";
          const num = toNum(evalArg(rArgs[0], getCell));
          const decimals = toNum(evalArg(rArgs[1], getCell));
          const factor = Math.pow(10, decimals);
          return Math.ceil(num * factor) / factor;
        }
        case "ROUNDDOWN": {
          const rArgs = splitArgs(args);
          if (rArgs.length < 2) return "#ERROR";
          const num = toNum(evalArg(rArgs[0], getCell));
          const decimals = toNum(evalArg(rArgs[1], getCell));
          const factor = Math.pow(10, decimals);
          return Math.floor(num * factor) / factor;
        }
        case "ABS": {
          return Math.abs(toNum(evalArg(args, getCell)));
        }
        case "INT": {
          return Math.floor(toNum(evalArg(args, getCell)));
        }
        case "MOD": {
          const mArgs = splitArgs(args);
          if (mArgs.length < 2) return "#ERROR";
          const num = toNum(evalArg(mArgs[0], getCell));
          const div = toNum(evalArg(mArgs[1], getCell));
          return div === 0 ? "#DIV/0!" : num % div;
        }
        case "POWER": {
          const pArgs = splitArgs(args);
          if (pArgs.length < 2) return "#ERROR";
          return Math.pow(toNum(evalArg(pArgs[0], getCell)), toNum(evalArg(pArgs[1], getCell)));
        }
        case "SQRT": {
          const n = toNum(evalArg(args, getCell));
          return n < 0 ? "#NUM!" : Math.sqrt(n);
        }
        case "RAND": {
          return Math.random();
        }
        case "SUMIF": {
          const siArgs = splitArgs(args);
          if (siArgs.length < 2) return "#ERROR";
          const criteriaRange = parseRange(siArgs[0].trim());
          const criteria = String(evalArg(siArgs[1], getCell));
          const sumRange = siArgs.length >= 3 ? parseRange(siArgs[2].trim()) : criteriaRange;
          let total = 0;
          for (let i = 0; i < criteriaRange.length; i++) {
            const val = getCell(criteriaRange[i].col, criteriaRange[i].row);
            if (matchCriteria(val, criteria)) {
              const sumCell = i < sumRange.length ? sumRange[i] : criteriaRange[i];
              total += toNum(getCell(sumCell.col, sumCell.row));
            }
          }
          return total;
        }
        case "SUMIFS": {
          const sifsArgs = splitArgs(args);
          if (sifsArgs.length < 3 || sifsArgs.length % 2 === 0) return "#ERROR";
          const sumRange = parseRange(sifsArgs[0].trim());
          let total = 0;
          for (let i = 0; i < sumRange.length; i++) {
            let allMatch = true;
            for (let j = 1; j < sifsArgs.length; j += 2) {
              const critRange = parseRange(sifsArgs[j].trim());
              const criteria = String(evalArg(sifsArgs[j + 1], getCell));
              if (i < critRange.length) {
                const val = getCell(critRange[i].col, critRange[i].row);
                if (!matchCriteria(val, criteria)) { allMatch = false; break; }
              }
            }
            if (allMatch) total += toNum(getCell(sumRange[i].col, sumRange[i].row));
          }
          return total;
        }
        case "COUNTIF": {
          const ciArgs = splitArgs(args);
          if (ciArgs.length < 2) return "#ERROR";
          const range = parseRange(ciArgs[0].trim());
          const criteria = String(evalArg(ciArgs[1], getCell));
          let count = 0;
          for (const cell of range) {
            if (matchCriteria(getCell(cell.col, cell.row), criteria)) count++;
          }
          return count;
        }
        case "COUNTIFS": {
          const cifsArgs = splitArgs(args);
          if (cifsArgs.length < 2 || cifsArgs.length % 2 !== 0) return "#ERROR";
          const firstRange = parseRange(cifsArgs[0].trim());
          let count = 0;
          for (let i = 0; i < firstRange.length; i++) {
            let allMatch = true;
            for (let j = 0; j < cifsArgs.length; j += 2) {
              const critRange = parseRange(cifsArgs[j].trim());
              const criteria = String(evalArg(cifsArgs[j + 1], getCell));
              if (i < critRange.length) {
                if (!matchCriteria(getCell(critRange[i].col, critRange[i].row), criteria)) { allMatch = false; break; }
              }
            }
            if (allMatch) count++;
          }
          return count;
        }
        case "AVERAGEIF": {
          const aiArgs = splitArgs(args);
          if (aiArgs.length < 2) return "#ERROR";
          const criteriaRange = parseRange(aiArgs[0].trim());
          const criteria = String(evalArg(aiArgs[1], getCell));
          const avgRange = aiArgs.length >= 3 ? parseRange(aiArgs[2].trim()) : criteriaRange;
          const vals: number[] = [];
          for (let i = 0; i < criteriaRange.length; i++) {
            if (matchCriteria(getCell(criteriaRange[i].col, criteriaRange[i].row), criteria)) {
              const sumCell = i < avgRange.length ? avgRange[i] : criteriaRange[i];
              vals.push(toNum(getCell(sumCell.col, sumCell.row)));
            }
          }
          return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        }
        case "PMT": {
          const pmtArgs = splitArgs(args);
          if (pmtArgs.length < 3) return "#ERROR";
          const rate = toNum(evalArg(pmtArgs[0], getCell));
          const nper = toNum(evalArg(pmtArgs[1], getCell));
          const pv = toNum(evalArg(pmtArgs[2], getCell));
          if (rate === 0) return -(pv / nper);
          return -(pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
        }
        case "FV": {
          const fvArgs = splitArgs(args);
          if (fvArgs.length < 3) return "#ERROR";
          const rate = toNum(evalArg(fvArgs[0], getCell));
          const nper = toNum(evalArg(fvArgs[1], getCell));
          const pmt = toNum(evalArg(fvArgs[2], getCell));
          const pv = fvArgs.length >= 4 ? toNum(evalArg(fvArgs[3], getCell)) : 0;
          if (rate === 0) return -(pv + pmt * nper);
          return -(pv * Math.pow(1 + rate, nper) + pmt * (Math.pow(1 + rate, nper) - 1) / rate);
        }
        case "PV": {
          const pvArgs = splitArgs(args);
          if (pvArgs.length < 3) return "#ERROR";
          const rate = toNum(evalArg(pvArgs[0], getCell));
          const nper = toNum(evalArg(pvArgs[1], getCell));
          const pmt = toNum(evalArg(pvArgs[2], getCell));
          if (rate === 0) return -(pmt * nper);
          return -(pmt * (1 - Math.pow(1 + rate, -nper)) / rate);
        }
        case "NPV": {
          const npvArgs = splitArgs(args);
          if (npvArgs.length < 2) return "#ERROR";
          const rate = toNum(evalArg(npvArgs[0], getCell));
          let npv = 0;
          const cashFlows: number[] = [];
          for (let i = 1; i < npvArgs.length; i++) {
            const part = npvArgs[i].trim();
            if (part.match(/^[A-Z]+\d+:[A-Z]+\d+$/i)) {
              resolveValues(part, getCell).forEach((v) => cashFlows.push(toNum(v)));
            } else {
              cashFlows.push(toNum(evalArg(part, getCell)));
            }
          }
          for (let i = 0; i < cashFlows.length; i++) {
            npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
          }
          return npv;
        }
        case "IRR": {
          const irrArgs = splitArgs(args);
          if (irrArgs.length < 1) return "#ERROR";
          const cashFlows: number[] = [];
          const part = irrArgs[0].trim();
          if (part.match(/^[A-Z]+\d+:[A-Z]+\d+$/i)) {
            resolveValues(part, getCell).forEach((v) => cashFlows.push(toNum(v)));
          }
          if (cashFlows.length < 2) return "#ERROR";
          let guess = irrArgs.length >= 2 ? toNum(evalArg(irrArgs[1], getCell)) : 0.1;
          for (let iter = 0; iter < 100; iter++) {
            let npv = 0, dnpv = 0;
            for (let i = 0; i < cashFlows.length; i++) {
              npv += cashFlows[i] / Math.pow(1 + guess, i);
              dnpv -= i * cashFlows[i] / Math.pow(1 + guess, i + 1);
            }
            if (Math.abs(npv) < 1e-7) return Math.round(guess * 1e8) / 1e8;
            if (dnpv === 0) return "#NUM!";
            guess -= npv / dnpv;
          }
          return "#NUM!";
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

function evaluateExpression(
  expr: string,
  getCell: CellGetter
): number | string {
  let resolved = expr.trim();

  // Handle nested function calls in expressions
  resolved = resolved.replace(/(\w+)\(([^)]+)\)/gi, (match) => {
    const val = evaluateFormula("=" + match, getCell);
    return String(val);
  });

  // Replace cell references with their values
  resolved = resolved.replace(/\b([A-Z]+\d+)\b/gi, (match) => {
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

  return safeEval(resolved);
}

function safeEval(expr: string): number {
  try {
    const sanitized = expr.replace(/\s/g, "");
    if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
      const n = parseFloat(sanitized);
      return isNaN(n) ? 0 : n;
    }
    const result = new Function(`"use strict"; return (${sanitized})`)();
    return typeof result === "number" && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}
