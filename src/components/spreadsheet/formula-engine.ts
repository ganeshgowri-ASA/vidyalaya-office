export type ArgValue = string | number;
type FuncArg = ArgValue | ArgValue[];

export function colLetterToIndex(col: string): number {
  let result = 0;
  for (const char of col.toUpperCase()) {
    result = result * 26 + (char.charCodeAt(0) - 64);
  }
  return result - 1;
}

export function indexToColLetter(index: number): string {
  let result = "";
  let i = index + 1;
  while (i > 0) {
    const rem = (i - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    i = Math.floor((i - 1) / 26);
  }
  return result;
}

export const colToLetter = indexToColLetter;

export function parseCellRef(ref: string): { col: number; row: number } | null {
  const m = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  return { col: colLetterToIndex(m[1]), row: parseInt(m[2]) - 1 };
}

export function parseRange(range: string): { start: { col: number; row: number }; end: { col: number; row: number } } | null {
  const parts = range.split(":");
  if (parts.length !== 2) return null;
  const start = parseCellRef(parts[0].trim());
  const end = parseCellRef(parts[1].trim());
  if (!start || !end) return null;
  return { start, end };
}

function toNum(val: ArgValue | FuncArg | undefined): number {
  if (val === undefined || val === null) return 0;
  if (Array.isArray(val)) return toNum(val[0]);
  if (typeof val === "number") return val;
  const n = parseFloat(String(val));
  return isNaN(n) ? 0 : n;
}

function toStr(val: FuncArg | undefined): string {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return String(val[0] ?? "");
  return String(val);
}

class FormulaParser {
  private pos = 0;
  private input = "";
  private getCellValue: (ref: string) => ArgValue;

  constructor(getCellValue: (ref: string) => ArgValue) {
    this.getCellValue = getCellValue;
  }

  evaluate(formula: string): ArgValue {
    if (!formula.startsWith("=")) return formula;
    this.input = formula.slice(1);
    this.pos = 0;
    try {
      const result = this.parseExpr();
      return result;
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("#")) return e.message;
      return "#ERROR!";
    }
  }

  private skip() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos]))
      this.pos++;
  }

  private peek(): string {
    this.skip();
    return this.input[this.pos] || "";
  }

  private parseExpr(): ArgValue {
    let left = this.parseTerm();
    while (true) {
      const op = this.peek();
      if (op === "+") {
        this.pos++;
        const right = this.parseTerm();
        left = toNum(left) + toNum(right);
      } else if (op === "-") {
        this.pos++;
        left = toNum(left) - toNum(this.parseTerm());
      } else if (op === "&") {
        this.pos++;
        left = String(left) + String(this.parseTerm());
      } else if (op === ">" || op === "<" || op === "=") {
        const nextTwo = this.input.slice(this.pos, this.pos + 2);
        let operator = op;
        if (nextTwo === ">=" || nextTwo === "<=" || nextTwo === "<>") {
          operator = nextTwo;
          this.pos += 2;
        } else {
          this.pos++;
        }
        const right = this.parseTerm();
        switch (operator) {
          case ">": left = toNum(left) > toNum(right) ? 1 : 0; break;
          case "<": left = toNum(left) < toNum(right) ? 1 : 0; break;
          case "=": left = String(left) === String(right) ? 1 : 0; break;
          case ">=": left = toNum(left) >= toNum(right) ? 1 : 0; break;
          case "<=": left = toNum(left) <= toNum(right) ? 1 : 0; break;
          case "<>": left = String(left) !== String(right) ? 1 : 0; break;
        }
      } else break;
    }
    return left;
  }

  private parseTerm(): ArgValue {
    let left = this.parseUnary();
    while (true) {
      const op = this.peek();
      if (op === "*") {
        this.pos++;
        left = toNum(left) * toNum(this.parseUnary());
      } else if (op === "/") {
        this.pos++;
        const right = toNum(this.parseUnary());
        if (right === 0) throw new Error("#DIV/0!");
        left = toNum(left) / right;
      } else if (op === "^") {
        this.pos++;
        left = Math.pow(toNum(left), toNum(this.parseUnary()));
      } else break;
    }
    return left;
  }

  private parseUnary(): ArgValue {
    this.skip();
    if (this.input[this.pos] === "-") {
      this.pos++;
      return -toNum(this.parsePrimary());
    }
    if (this.input[this.pos] === "+") {
      this.pos++;
      return this.parsePrimary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ArgValue {
    this.skip();
    const ch = this.input[this.pos];

    if (ch === "(") {
      this.pos++;
      const val = this.parseExpr();
      this.skip();
      if (this.input[this.pos] === ")") this.pos++;
      return val;
    }

    if (ch === '"') {
      this.pos++;
      let str = "";
      while (this.pos < this.input.length && this.input[this.pos] !== '"')
        str += this.input[this.pos++];
      this.pos++;
      return str;
    }

    if (/\d|\./.test(ch)) {
      let num = "";
      while (this.pos < this.input.length && /[\d\.]/.test(this.input[this.pos]))
        num += this.input[this.pos++];
      if (/[eE]/.test(this.input[this.pos] || "")) {
        num += this.input[this.pos++];
        if (/[+\-]/.test(this.input[this.pos] || "")) num += this.input[this.pos++];
        while (this.pos < this.input.length && /\d/.test(this.input[this.pos]))
          num += this.input[this.pos++];
      }
      return parseFloat(num);
    }

    if (/[A-Za-z$]/.test(ch)) return this.parseIdent();

    throw new Error("#PARSE!");
  }

  private parseIdent(): ArgValue {
    if (this.input[this.pos] === "$") this.pos++;
    let name = "";
    while (this.pos < this.input.length && /[A-Za-z]/.test(this.input[this.pos]))
      name += this.input[this.pos++].toUpperCase();

    if (this.input[this.pos] === "$") this.pos++;

    if (/\d/.test(this.input[this.pos] || "")) {
      let row = "";
      while (this.pos < this.input.length && /\d/.test(this.input[this.pos]))
        row += this.input[this.pos++];
      const cellRef = `${name}${row}`;

      if (this.input[this.pos] === ":") {
        this.pos++;
        if (this.input[this.pos] === "$") this.pos++;
        let endCol = "";
        while (this.pos < this.input.length && /[A-Za-z]/.test(this.input[this.pos]))
          endCol += this.input[this.pos++].toUpperCase();
        if (this.input[this.pos] === "$") this.pos++;
        let endRow = "";
        while (this.pos < this.input.length && /\d/.test(this.input[this.pos]))
          endRow += this.input[this.pos++];
        return `\x00RANGE\x00${cellRef}:${endCol}${endRow}`;
      }
      return this.getCellValue(cellRef);
    }

    if (this.input[this.pos] === "(") {
      this.pos++;
      return this.callFunc(name);
    }

    if (name === "TRUE") return 1;
    if (name === "FALSE") return 0;
    throw new Error("#NAME?");
  }

  private expandRange(rangeStr: string): ArgValue[] {
    const match = rangeStr.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return [];
    const c1 = colLetterToIndex(match[1]);
    const r1 = parseInt(match[2]);
    const c2 = colLetterToIndex(match[3]);
    const r2 = parseInt(match[4]);
    const vals: ArgValue[] = [];
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        vals.push(this.getCellValue(`${indexToColLetter(c)}${r}`));
    return vals;
  }

  private expandRange2D(rangeStr: string): { rows: ArgValue[][]; numCols: number; numRows: number } {
    const match = rangeStr.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
    if (!match) return { rows: [], numCols: 0, numRows: 0 };
    const c1 = colLetterToIndex(match[1]);
    const r1 = parseInt(match[2]);
    const c2 = colLetterToIndex(match[3]);
    const r2 = parseInt(match[4]);
    const rows: ArgValue[][] = [];
    for (let r = r1; r <= r2; r++) {
      const row: ArgValue[] = [];
      for (let c = c1; c <= c2; c++)
        row.push(this.getCellValue(`${indexToColLetter(c)}${r}`));
      rows.push(row);
    }
    return { rows, numCols: c2 - c1 + 1, numRows: r2 - r1 + 1 };
  }

  private getRangeStr(arg: FuncArg): string | null {
    // Check if the raw arg was stored as a RANGE marker
    if (typeof arg === "string" && arg.startsWith("\x00RANGE\x00")) return arg.slice(7);
    return null;
  }

  private parseArg(): FuncArg {
    const val = this.parseExpr();
    if (typeof val === "string" && val.startsWith("\x00RANGE\x00"))
      return this.expandRange(val.slice(7));
    return val;
  }

  private parseArgRaw(): { value: FuncArg; rangeStr: string | null } {
    const val = this.parseExpr();
    if (typeof val === "string" && val.startsWith("\x00RANGE\x00")) {
      const rangeStr = val.slice(7);
      return { value: this.expandRange(rangeStr), rangeStr };
    }
    return { value: val, rangeStr: null };
  }

  private callFunc(name: string): ArgValue {
    const argsRaw: { value: FuncArg; rangeStr: string | null }[] = [];
    this.skip();
    while (this.pos < this.input.length && this.input[this.pos] !== ")") {
      argsRaw.push(this.parseArgRaw());
      this.skip();
      if (this.input[this.pos] === ",") this.pos++;
      this.skip();
    }
    if (this.input[this.pos] === ")") this.pos++;

    const args = argsRaw.map((a) => a.value);
    const flat = args.flatMap((a) => (Array.isArray(a) ? a : [a]));
    const nums = flat.map((v) => toNum(v));

    const arg0 = args[0];
    const arg1 = args[1];
    const arg2 = args[2];
    const arg3 = args[3];
    const arg4 = args[4];

    // Helper: get 2D table from arg with range info
    const get2D = (idx: number) => {
      const rs = argsRaw[idx]?.rangeStr;
      if (rs) return this.expandRange2D(rs);
      return { rows: [], numCols: 0, numRows: 0 };
    };

    // Helper: test criteria with operators (">5", "<10", ">=3", "<>A", "=B", "text")
    const matchesCriteria = (cellVal: ArgValue, criteria: ArgValue): boolean => {
      const cStr = String(criteria);
      if (cStr.startsWith(">=")) return toNum(cellVal) >= toNum(cStr.slice(2));
      if (cStr.startsWith("<=")) return toNum(cellVal) <= toNum(cStr.slice(2));
      if (cStr.startsWith("<>")) return String(cellVal).toLowerCase() !== cStr.slice(2).toLowerCase();
      if (cStr.startsWith(">")) return toNum(cellVal) > toNum(cStr.slice(1));
      if (cStr.startsWith("<")) return toNum(cellVal) < toNum(cStr.slice(1));
      if (cStr.startsWith("=")) return String(cellVal).toLowerCase() === cStr.slice(1).toLowerCase();
      // Wildcard support: * and ?
      if (cStr.includes("*") || cStr.includes("?")) {
        const pattern = "^" + cStr.replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
        try { return new RegExp(pattern, "i").test(String(cellVal)); } catch { return false; }
      }
      return String(cellVal).toLowerCase() === cStr.toLowerCase();
    };

    switch (name) {
      case "SUM":
        return nums.reduce((a, b) => a + b, 0);
      case "AVERAGE": {
        const valid = nums.filter((n) => !isNaN(n));
        return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
      }
      case "COUNT":
        return flat.filter((v) => !isNaN(toNum(v)) && v !== "").length;
      case "COUNTA":
        return flat.filter((v) => v !== "").length;
      case "COUNTBLANK":
        return flat.filter((v) => v === "" || v === 0).length;
      case "MAX":
        return nums.length ? Math.max(...nums) : 0;
      case "MIN":
        return nums.length ? Math.min(...nums) : 0;
      case "MEDIAN": {
        const sorted = [...nums].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
      case "STDEV": {
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const variance = nums.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (nums.length - 1);
        return Math.sqrt(variance);
      }
      case "ROUND": {
        const decimals = arg1 !== undefined ? toNum(arg1) : 0;
        const factor = Math.pow(10, decimals);
        return Math.round(toNum(arg0) * factor) / factor;
      }
      case "ROUNDUP": {
        const decimals = arg1 !== undefined ? toNum(arg1) : 0;
        const factor = Math.pow(10, decimals);
        return Math.ceil(toNum(arg0) * factor) / factor;
      }
      case "ROUNDDOWN": {
        const decimals = arg1 !== undefined ? toNum(arg1) : 0;
        const factor = Math.pow(10, decimals);
        return Math.floor(toNum(arg0) * factor) / factor;
      }
      case "ABS":
        return Math.abs(toNum(arg0));
      case "SQRT":
        return Math.sqrt(toNum(arg0));
      case "INT":
        return Math.floor(toNum(arg0));
      case "MOD":
        return toNum(arg0) % toNum(arg1);
      case "POWER":
        return Math.pow(toNum(arg0), toNum(arg1));
      case "SIGN":
        return Math.sign(toNum(arg0));
      case "RAND":
        return Math.random();
      case "RANDBETWEEN":
        return Math.floor(Math.random() * (toNum(arg1) - toNum(arg0) + 1)) + toNum(arg0);
      case "IF": {
        const cond = toNum(arg0);
        const result = cond ? arg1 : (arg2 ?? 0);
        return Array.isArray(result) ? (result[0] ?? "") : (result as ArgValue) ?? "";
      }
      case "IFERROR": {
        const v = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        if (typeof v === "string" && v.startsWith("#")) {
          return Array.isArray(arg1) ? (arg1[0] ?? "") : (arg1 as ArgValue) ?? "";
        }
        return v ?? "";
      }
      case "ISBLANK": {
        const v = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        return (v === "" || v === undefined || v === null) ? 1 : 0;
      }
      case "ISNUMBER": {
        const v = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        return typeof v === "number" || (typeof v === "string" && !isNaN(parseFloat(v)) && v.trim() !== "") ? 1 : 0;
      }
      case "ISTEXT": {
        const v = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        return typeof v === "string" && isNaN(parseFloat(v)) ? 1 : 0;
      }
      case "CONCATENATE":
      case "CONCAT":
        return flat.map(String).join("");
      case "TEXTJOIN": {
        const delimiter = toStr(arg0);
        const ignoreEmpty = toNum(arg1);
        const values = args.slice(2).flatMap((a) => Array.isArray(a) ? a : [a]);
        const filtered = ignoreEmpty ? values.filter((v) => String(v) !== "") : values;
        return filtered.map(String).join(delimiter);
      }
      case "LEN":
        return toStr(arg0).length;
      case "TRIM":
        return toStr(arg0).trim();
      case "UPPER":
        return toStr(arg0).toUpperCase();
      case "LOWER":
        return toStr(arg0).toLowerCase();
      case "PROPER": {
        return toStr(arg0).replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      }
      case "REPT":
        return toStr(arg0).repeat(Math.max(0, toNum(arg1)));
      case "LEFT":
        return toStr(arg0).slice(0, Math.max(0, toNum(arg1 ?? 1)));
      case "RIGHT": {
        const s = toStr(arg0);
        const n = toNum(arg1 ?? 1);
        return s.slice(Math.max(0, s.length - n));
      }
      case "MID": {
        const s = toStr(arg0);
        const start = toNum(arg1) - 1;
        const len = toNum(arg2);
        return s.slice(start, start + len);
      }
      case "SUBSTITUTE": {
        const s = toStr(arg0);
        const find = toStr(arg1);
        const replace = toStr(arg2);
        return s.split(find).join(replace);
      }
      case "FIND": {
        const find = toStr(arg0);
        const s = toStr(arg1);
        const startPos = arg2 ? toNum(arg2) - 1 : 0;
        const idx = s.indexOf(find, startPos);
        return idx >= 0 ? idx + 1 : "#VALUE!";
      }
      case "SEARCH": {
        const find = toStr(arg0).toLowerCase();
        const s = toStr(arg1).toLowerCase();
        const startPos = arg2 ? toNum(arg2) - 1 : 0;
        const idx = s.indexOf(find, startPos);
        return idx >= 0 ? idx + 1 : "#VALUE!";
      }
      case "REPLACE": {
        const s = toStr(arg0);
        const start = toNum(arg1) - 1;
        const numChars = toNum(arg2);
        const newText = toStr(arg3);
        return s.slice(0, start) + newText + s.slice(start + numChars);
      }
      case "VALUE":
        return toNum(arg0);
      case "TEXT": {
        const val = toNum(arg0);
        const fmt = toStr(arg1).toLowerCase();
        if (fmt.includes("%")) return `${(val * 100).toFixed(fmt.split(".")[1]?.replace(/[^0]/g, "").length || 0)}%`;
        if (fmt.includes("$")) return `$${val.toFixed(2)}`;
        const decimalPlaces = (fmt.split(".")[1] || "").length;
        return val.toFixed(decimalPlaces);
      }
      case "NOW":
        return new Date().toLocaleString();
      case "TODAY":
        return new Date().toLocaleDateString();
      case "YEAR": {
        const d = arg0 ? new Date(toStr(arg0)) : new Date();
        return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
      }
      case "MONTH": {
        const d = arg0 ? new Date(toStr(arg0)) : new Date();
        return isNaN(d.getTime()) ? new Date().getMonth() + 1 : d.getMonth() + 1;
      }
      case "DAY": {
        const d = arg0 ? new Date(toStr(arg0)) : new Date();
        return isNaN(d.getTime()) ? new Date().getDate() : d.getDate();
      }
      case "DATE": {
        const y = toNum(arg0);
        const m = toNum(arg1) - 1;
        const d = toNum(arg2);
        return new Date(y, m, d).toLocaleDateString();
      }
      case "DATEVALUE":
        return Math.floor((new Date(toStr(arg0)).getTime() - new Date(1900, 0, 1).getTime()) / 86400000) + 1;
      case "EDATE": {
        const d = new Date(toStr(arg0));
        d.setMonth(d.getMonth() + toNum(arg1));
        return d.toLocaleDateString();
      }
      case "EOMONTH": {
        const d = new Date(toStr(arg0));
        d.setMonth(d.getMonth() + toNum(arg1) + 1, 0);
        return d.toLocaleDateString();
      }
      case "WEEKDAY": {
        const d = new Date(toStr(arg0));
        return isNaN(d.getTime()) ? "#VALUE!" : d.getDay() + 1;
      }
      case "HOUR": {
        const d = new Date(toStr(arg0));
        return isNaN(d.getTime()) ? "#VALUE!" : d.getHours();
      }
      case "MINUTE": {
        const d = new Date(toStr(arg0));
        return isNaN(d.getTime()) ? "#VALUE!" : d.getMinutes();
      }
      case "SECOND": {
        const d = new Date(toStr(arg0));
        return isNaN(d.getTime()) ? "#VALUE!" : d.getSeconds();
      }
      case "VLOOKUP": {
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const colIdx = toNum(arg2) - 1;
        const table2D = get2D(1);
        if (table2D.numCols > 0) {
          for (const row of table2D.rows) {
            if (String(row[0]) === String(lookupVal)) {
              return row[colIdx] ?? "#N/A";
            }
          }
        } else {
          // Fallback for non-range args
          const table = Array.isArray(arg1) ? arg1 : [];
          const colCount = Math.max(1, colIdx + 1);
          for (let i = 0; i < table.length; i += colCount) {
            if (String(table[i]) === String(lookupVal)) return table[i + colIdx] ?? "#N/A";
          }
        }
        return "#N/A";
      }
      case "HLOOKUP": {
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const rowIdx = toNum(arg2) - 1;
        const table2D = get2D(1);
        if (table2D.numCols > 0) {
          // Search first row for lookup value
          const firstRow = table2D.rows[0] || [];
          for (let c = 0; c < firstRow.length; c++) {
            if (String(firstRow[c]) === String(lookupVal)) {
              return table2D.rows[rowIdx]?.[c] ?? "#N/A";
            }
          }
        }
        return "#N/A";
      }
      case "XLOOKUP": {
        // XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const lookupArr = Array.isArray(arg1) ? arg1 : [];
        const returnArr = Array.isArray(arg2) ? arg2 : [];
        const notFound = arg3 !== undefined ? (Array.isArray(arg3) ? arg3[0] : (arg3 as ArgValue)) : "#N/A";
        const idx = lookupArr.findIndex((v) => String(v) === String(lookupVal));
        if (idx >= 0 && idx < returnArr.length) return returnArr[idx];
        return notFound;
      }
      case "INDEX": {
        const table2D = get2D(0);
        const rowIdx = toNum(arg1) - 1;
        const colIdx = arg2 !== undefined ? toNum(arg2) - 1 : 0;
        if (table2D.numCols > 0) {
          return table2D.rows[rowIdx]?.[colIdx] ?? "#REF!";
        }
        const arr = Array.isArray(arg0) ? arg0 : [(arg0 as ArgValue)];
        return arr[rowIdx] ?? "#REF!";
      }
      case "MATCH": {
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const arr = Array.isArray(arg1) ? arg1 : [];
        const matchType = arg2 !== undefined ? toNum(arg2) : 1;
        if (matchType === 0) {
          const idx = arr.findIndex((v) => String(v) === String(lookupVal));
          return idx >= 0 ? idx + 1 : "#N/A";
        } else if (matchType === 1) {
          // Largest value <= lookup_value (array must be ascending)
          let lastMatch = -1;
          for (let i = 0; i < arr.length; i++) {
            if (toNum(arr[i]) <= toNum(lookupVal)) lastMatch = i;
            else break;
          }
          return lastMatch >= 0 ? lastMatch + 1 : "#N/A";
        } else {
          // Smallest value >= lookup_value (array must be descending)
          let lastMatch = -1;
          for (let i = 0; i < arr.length; i++) {
            if (toNum(arr[i]) >= toNum(lookupVal)) lastMatch = i;
            else break;
          }
          return lastMatch >= 0 ? lastMatch + 1 : "#N/A";
        }
      }
      case "SUMIF": {
        const range = Array.isArray(arg0) ? arg0 : [];
        const criteria = Array.isArray(arg1) ? arg1[0] : (arg1 as ArgValue);
        const sumRange = Array.isArray(arg2) ? arg2 : range;
        let sum = 0;
        range.forEach((v, i) => {
          if (matchesCriteria(v, criteria)) sum += toNum(sumRange[i] ?? 0);
        });
        return sum;
      }
      case "SUMIFS": {
        // SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...)
        const sumRange = Array.isArray(arg0) ? arg0 : [];
        let sum = 0;
        for (let i = 0; i < sumRange.length; i++) {
          let allMatch = true;
          for (let p = 1; p < args.length; p += 2) {
            const critRange = Array.isArray(args[p]) ? args[p] : [];
            const criteria = args[p + 1] !== undefined ? (Array.isArray(args[p + 1]) ? (args[p + 1] as ArgValue[])[0] : (args[p + 1] as ArgValue)) : "";
            if (!matchesCriteria((critRange as ArgValue[])[i] ?? "", criteria)) {
              allMatch = false;
              break;
            }
          }
          if (allMatch) sum += toNum(sumRange[i]);
        }
        return sum;
      }
      case "COUNTIF": {
        const range = Array.isArray(arg0) ? arg0 : [];
        const criteria = Array.isArray(arg1) ? arg1[0] : (arg1 as ArgValue);
        return range.filter((v) => matchesCriteria(v, criteria)).length;
      }
      case "COUNTIFS": {
        // COUNTIFS(criteria_range1, criteria1, criteria_range2, criteria2, ...)
        const firstRange = Array.isArray(arg0) ? arg0 : [];
        let count = 0;
        for (let i = 0; i < firstRange.length; i++) {
          let allMatch = true;
          for (let p = 0; p < args.length; p += 2) {
            const critRange = Array.isArray(args[p]) ? args[p] : [];
            const criteria = args[p + 1] !== undefined ? (Array.isArray(args[p + 1]) ? (args[p + 1] as ArgValue[])[0] : (args[p + 1] as ArgValue)) : "";
            if (!matchesCriteria((critRange as ArgValue[])[i] ?? "", criteria)) {
              allMatch = false;
              break;
            }
          }
          if (allMatch) count++;
        }
        return count;
      }
      case "AVERAGEIF": {
        const range = Array.isArray(arg0) ? arg0 : [];
        const criteria = Array.isArray(arg1) ? arg1[0] : (arg1 as ArgValue);
        const avgRange = Array.isArray(arg2) ? arg2 : range;
        let sum = 0;
        let count = 0;
        range.forEach((v, i) => {
          if (matchesCriteria(v, criteria)) {
            sum += toNum(avgRange[i] ?? 0);
            count++;
          }
        });
        return count > 0 ? sum / count : "#DIV/0!";
      }
      case "AVERAGEIFS": {
        // AVERAGEIFS(avg_range, criteria_range1, criteria1, ...)
        const avgRange = Array.isArray(arg0) ? arg0 : [];
        let sum = 0;
        let count = 0;
        for (let i = 0; i < avgRange.length; i++) {
          let allMatch = true;
          for (let p = 1; p < args.length; p += 2) {
            const critRange = Array.isArray(args[p]) ? args[p] : [];
            const criteria = args[p + 1] !== undefined ? (Array.isArray(args[p + 1]) ? (args[p + 1] as ArgValue[])[0] : (args[p + 1] as ArgValue)) : "";
            if (!matchesCriteria((critRange as ArgValue[])[i] ?? "", criteria)) {
              allMatch = false;
              break;
            }
          }
          if (allMatch) {
            sum += toNum(avgRange[i]);
            count++;
          }
        }
        return count > 0 ? sum / count : "#DIV/0!";
      }
      case "MAXIFS": {
        const maxRange = Array.isArray(arg0) ? arg0 : [];
        let max = -Infinity;
        for (let i = 0; i < maxRange.length; i++) {
          let allMatch = true;
          for (let p = 1; p < args.length; p += 2) {
            const critRange = Array.isArray(args[p]) ? args[p] : [];
            const criteria = args[p + 1] !== undefined ? (Array.isArray(args[p + 1]) ? (args[p + 1] as ArgValue[])[0] : (args[p + 1] as ArgValue)) : "";
            if (!matchesCriteria((critRange as ArgValue[])[i] ?? "", criteria)) { allMatch = false; break; }
          }
          if (allMatch) max = Math.max(max, toNum(maxRange[i]));
        }
        return max === -Infinity ? 0 : max;
      }
      case "MINIFS": {
        const minRange = Array.isArray(arg0) ? arg0 : [];
        let min = Infinity;
        for (let i = 0; i < minRange.length; i++) {
          let allMatch = true;
          for (let p = 1; p < args.length; p += 2) {
            const critRange = Array.isArray(args[p]) ? args[p] : [];
            const criteria = args[p + 1] !== undefined ? (Array.isArray(args[p + 1]) ? (args[p + 1] as ArgValue[])[0] : (args[p + 1] as ArgValue)) : "";
            if (!matchesCriteria((critRange as ArgValue[])[i] ?? "", criteria)) { allMatch = false; break; }
          }
          if (allMatch) min = Math.min(min, toNum(minRange[i]));
        }
        return min === Infinity ? 0 : min;
      }
      case "LARGE": {
        const arr = (Array.isArray(arg0) ? arg0 : []).map(toNum).sort((a, b) => b - a);
        const k = toNum(arg1) - 1;
        return k >= 0 && k < arr.length ? arr[k] : "#NUM!";
      }
      case "SMALL": {
        const arr = (Array.isArray(arg0) ? arg0 : []).map(toNum).sort((a, b) => a - b);
        const k = toNum(arg1) - 1;
        return k >= 0 && k < arr.length ? arr[k] : "#NUM!";
      }
      case "RANK": {
        const val = toNum(arg0);
        const arr = (Array.isArray(arg1) ? arg1 : []).map(toNum);
        const order = arg2 ? toNum(arg2) : 0;
        const sorted = [...arr].sort((a, b) => order ? a - b : b - a);
        const rank = sorted.indexOf(val);
        return rank >= 0 ? rank + 1 : "#N/A";
      }
      case "AND":
        return flat.every((v) => toNum(v) !== 0) ? 1 : 0;
      case "OR":
        return flat.some((v) => toNum(v) !== 0) ? 1 : 0;
      case "NOT":
        return toNum(arg0) === 0 ? 1 : 0;
      case "IFS": {
        // IFS(condition1, value1, condition2, value2, ...)
        for (let i = 0; i < args.length; i += 2) {
          const cond = toNum(args[i]);
          if (cond) {
            const result = args[i + 1];
            return Array.isArray(result) ? (result[0] ?? "") : (result as ArgValue) ?? "";
          }
        }
        return "#N/A";
      }
      case "SWITCH": {
        // SWITCH(expression, value1, result1, value2, result2, ..., [default])
        const expr = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        for (let i = 1; i < args.length - 1; i += 2) {
          const matchArg = args[i];
          const matchVal = Array.isArray(matchArg) ? matchArg[0] : (matchArg as ArgValue);
          if (String(expr) === String(matchVal)) {
            const result = args[i + 1];
            return Array.isArray(result) ? (result[0] ?? "") : (result as ArgValue) ?? "";
          }
        }
        // Default value (odd number of args after expression)
        if (args.length % 2 === 0) {
          const def = args[args.length - 1];
          return Array.isArray(def) ? (def[0] ?? "") : (def as ArgValue) ?? "";
        }
        return "#N/A";
      }
      case "CHOOSE": {
        const idx = toNum(arg0);
        if (idx >= 1 && idx < args.length) {
          const result = args[idx];
          return Array.isArray(result) ? (result[0] ?? "") : (result as ArgValue) ?? "";
        }
        return "#VALUE!";
      }
      case "UNIQUE": {
        const arr = Array.isArray(arg0) ? arg0 : [];
        const seen = new Set<string>();
        const unique: ArgValue[] = [];
        for (const v of arr) {
          const key = String(v);
          if (!seen.has(key)) { seen.add(key); unique.push(v); }
        }
        return unique[0] ?? "";
      }
      case "TRANSPOSE": {
        const table2D = get2D(0);
        if (table2D.numCols > 0) return table2D.rows[0]?.[0] ?? "";
        return Array.isArray(arg0) ? (arg0[0] ?? "") : (arg0 as ArgValue);
      }
      case "PI":
        return Math.PI;
      case "LOG": {
        const val = toNum(arg0);
        const base = arg1 !== undefined ? toNum(arg1) : 10;
        return Math.log(val) / Math.log(base);
      }
      case "LN":
        return Math.log(toNum(arg0));
      case "EXP":
        return Math.exp(toNum(arg0));
      case "CEILING":
        return Math.ceil(toNum(arg0) / toNum(arg1 ?? 1)) * toNum(arg1 ?? 1);
      case "FLOOR":
        return Math.floor(toNum(arg0) / toNum(arg1 ?? 1)) * toNum(arg1 ?? 1);
      case "SUMPRODUCT": {
        // SUMPRODUCT(array1, array2, ...)
        const arrays = args.map((a) => (Array.isArray(a) ? a.map(toNum) : [toNum(a)]));
        const len = Math.min(...arrays.map((a) => a.length));
        let sum = 0;
        for (let i = 0; i < len; i++) {
          let product = 1;
          for (const arr of arrays) product *= arr[i];
          sum += product;
        }
        return sum;
      }
      case "PRODUCT":
        return nums.reduce((a, b) => a * b, 1);
      case "INDIRECT": {
        const ref = toStr(arg0);
        return this.getCellValue(ref.toUpperCase());
      }
      case "ROW": {
        if (arg0 !== undefined) {
          const ref = Array.isArray(arg0) ? String(arg0[0]) : String(arg0);
          const parsed = parseCellRef(ref);
          return parsed ? parsed.row + 1 : "#REF!";
        }
        return 1;
      }
      case "COLUMN": {
        if (arg0 !== undefined) {
          const ref = Array.isArray(arg0) ? String(arg0[0]) : String(arg0);
          const parsed = parseCellRef(ref);
          return parsed ? parsed.col + 1 : "#REF!";
        }
        return 1;
      }
      case "COLUMNS": {
        const t = get2D(0);
        return t.numCols || 1;
      }
      case "ROWS": {
        const t = get2D(0);
        return t.numRows || 1;
      }
      case "OFFSET": {
        // OFFSET(reference, rows, cols) - simplified
        const refStr = argsRaw[0]?.rangeStr;
        if (refStr) {
          const p = parseCellRef(refStr.split(":")[0]);
          if (p) {
            const newRef = `${indexToColLetter(p.col + toNum(arg2))}${p.row + 1 + toNum(arg1)}`;
            return this.getCellValue(newRef);
          }
        }
        return "#REF!";
      }
      case "ADDRESS":
        return `$${indexToColLetter(toNum(arg1) - 1)}$${toNum(arg0)}`;
      case "TYPE": {
        const v = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        if (typeof v === "number") return 1;
        if (typeof v === "string") return 2;
        return 0;
      }
      case "SPARKLINE": {
        // SPARKLINE returns a special marker that the grid renders as a mini chart
        // SPARKLINE(data_range, [type]) where type is "line", "bar", or "winloss"
        const data = Array.isArray(arg0) ? arg0.map(toNum) : [toNum(arg0)];
        const chartType = arg1 !== undefined ? toStr(arg1) : "line";
        return `\x00SPARKLINE\x00${chartType}\x00${data.join(",")}`;
      }
      default:
        throw new Error("#NAME?");
    }
  }
}

export function evaluateFormula(
  formula: string,
  getCellValue: (ref: string) => ArgValue
): ArgValue {
  const parser = new FormulaParser(getCellValue);
  return parser.evaluate(formula);
}

export interface FormulaFunctionInfo {
  name: string;
  signature: string;
  description: string;
  category: string;
}

export const FORMULA_FUNCTIONS: FormulaFunctionInfo[] = [
  // Math & Trig
  { name: "SUM", signature: "SUM(number1, [number2], ...)", description: "Adds all numbers in a range", category: "Math" },
  { name: "AVERAGE", signature: "AVERAGE(number1, [number2], ...)", description: "Returns the average of numbers", category: "Math" },
  { name: "COUNT", signature: "COUNT(value1, [value2], ...)", description: "Counts cells with numbers", category: "Math" },
  { name: "COUNTA", signature: "COUNTA(value1, [value2], ...)", description: "Counts non-empty cells", category: "Math" },
  { name: "COUNTBLANK", signature: "COUNTBLANK(range)", description: "Counts empty cells", category: "Math" },
  { name: "MAX", signature: "MAX(number1, [number2], ...)", description: "Returns the largest value", category: "Math" },
  { name: "MIN", signature: "MIN(number1, [number2], ...)", description: "Returns the smallest value", category: "Math" },
  { name: "MEDIAN", signature: "MEDIAN(number1, [number2], ...)", description: "Returns the median", category: "Math" },
  { name: "STDEV", signature: "STDEV(number1, [number2], ...)", description: "Standard deviation of a sample", category: "Math" },
  { name: "ROUND", signature: "ROUND(number, num_digits)", description: "Rounds to specified digits", category: "Math" },
  { name: "ROUNDUP", signature: "ROUNDUP(number, num_digits)", description: "Rounds up away from zero", category: "Math" },
  { name: "ROUNDDOWN", signature: "ROUNDDOWN(number, num_digits)", description: "Rounds down toward zero", category: "Math" },
  { name: "ABS", signature: "ABS(number)", description: "Returns absolute value", category: "Math" },
  { name: "SQRT", signature: "SQRT(number)", description: "Returns square root", category: "Math" },
  { name: "INT", signature: "INT(number)", description: "Rounds down to nearest integer", category: "Math" },
  { name: "MOD", signature: "MOD(number, divisor)", description: "Returns remainder after division", category: "Math" },
  { name: "POWER", signature: "POWER(number, power)", description: "Returns number raised to power", category: "Math" },
  { name: "SIGN", signature: "SIGN(number)", description: "Returns sign of number (-1, 0, 1)", category: "Math" },
  { name: "RAND", signature: "RAND()", description: "Returns random number 0 to 1", category: "Math" },
  { name: "RANDBETWEEN", signature: "RANDBETWEEN(bottom, top)", description: "Returns random integer between bounds", category: "Math" },
  { name: "PI", signature: "PI()", description: "Returns value of PI", category: "Math" },
  { name: "LOG", signature: "LOG(number, [base])", description: "Returns logarithm", category: "Math" },
  { name: "LN", signature: "LN(number)", description: "Returns natural logarithm", category: "Math" },
  { name: "EXP", signature: "EXP(number)", description: "Returns e raised to the power", category: "Math" },
  { name: "CEILING", signature: "CEILING(number, significance)", description: "Rounds up to nearest multiple", category: "Math" },
  { name: "FLOOR", signature: "FLOOR(number, significance)", description: "Rounds down to nearest multiple", category: "Math" },
  { name: "SUMPRODUCT", signature: "SUMPRODUCT(array1, [array2], ...)", description: "Sum of products of arrays", category: "Math" },
  { name: "PRODUCT", signature: "PRODUCT(number1, [number2], ...)", description: "Multiplies all numbers", category: "Math" },
  { name: "LARGE", signature: "LARGE(array, k)", description: "Returns k-th largest value", category: "Math" },
  { name: "SMALL", signature: "SMALL(array, k)", description: "Returns k-th smallest value", category: "Math" },
  { name: "RANK", signature: "RANK(number, ref, [order])", description: "Returns rank of a number", category: "Math" },

  // Lookup & Reference
  { name: "VLOOKUP", signature: "VLOOKUP(lookup_value, table_array, col_index, [range_lookup])", description: "Vertical lookup in first column", category: "Lookup" },
  { name: "HLOOKUP", signature: "HLOOKUP(lookup_value, table_array, row_index, [range_lookup])", description: "Horizontal lookup in first row", category: "Lookup" },
  { name: "XLOOKUP", signature: "XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])", description: "Advanced lookup in any direction", category: "Lookup" },
  { name: "INDEX", signature: "INDEX(array, row_num, [col_num])", description: "Returns value at row/col position", category: "Lookup" },
  { name: "MATCH", signature: "MATCH(lookup_value, lookup_array, [match_type])", description: "Returns position of a value", category: "Lookup" },
  { name: "INDIRECT", signature: "INDIRECT(ref_text)", description: "Returns reference from text string", category: "Lookup" },
  { name: "OFFSET", signature: "OFFSET(reference, rows, cols)", description: "Returns a reference offset", category: "Lookup" },
  { name: "ROW", signature: "ROW([reference])", description: "Returns row number", category: "Lookup" },
  { name: "COLUMN", signature: "COLUMN([reference])", description: "Returns column number", category: "Lookup" },
  { name: "ROWS", signature: "ROWS(array)", description: "Returns number of rows", category: "Lookup" },
  { name: "COLUMNS", signature: "COLUMNS(array)", description: "Returns number of columns", category: "Lookup" },
  { name: "ADDRESS", signature: "ADDRESS(row_num, col_num)", description: "Creates cell address text", category: "Lookup" },
  { name: "CHOOSE", signature: "CHOOSE(index, value1, value2, ...)", description: "Chooses from list of values", category: "Lookup" },

  // Conditional
  { name: "IF", signature: "IF(condition, value_if_true, [value_if_false])", description: "Conditional logic", category: "Logical" },
  { name: "IFERROR", signature: "IFERROR(value, value_if_error)", description: "Returns value if no error", category: "Logical" },
  { name: "IFS", signature: "IFS(condition1, value1, [condition2, value2], ...)", description: "Multiple conditions", category: "Logical" },
  { name: "SWITCH", signature: "SWITCH(expression, value1, result1, ..., [default])", description: "Switch/case logic", category: "Logical" },
  { name: "AND", signature: "AND(logical1, [logical2], ...)", description: "TRUE if all are TRUE", category: "Logical" },
  { name: "OR", signature: "OR(logical1, [logical2], ...)", description: "TRUE if any is TRUE", category: "Logical" },
  { name: "NOT", signature: "NOT(logical)", description: "Reverses TRUE/FALSE", category: "Logical" },
  { name: "ISBLANK", signature: "ISBLANK(value)", description: "TRUE if cell is blank", category: "Logical" },
  { name: "ISNUMBER", signature: "ISNUMBER(value)", description: "TRUE if value is number", category: "Logical" },
  { name: "ISTEXT", signature: "ISTEXT(value)", description: "TRUE if value is text", category: "Logical" },

  // Conditional Aggregation
  { name: "SUMIF", signature: "SUMIF(range, criteria, [sum_range])", description: "Sum with one condition", category: "Math" },
  { name: "SUMIFS", signature: "SUMIFS(sum_range, criteria_range1, criteria1, ...)", description: "Sum with multiple conditions", category: "Math" },
  { name: "COUNTIF", signature: "COUNTIF(range, criteria)", description: "Count with one condition", category: "Math" },
  { name: "COUNTIFS", signature: "COUNTIFS(criteria_range1, criteria1, ...)", description: "Count with multiple conditions", category: "Math" },
  { name: "AVERAGEIF", signature: "AVERAGEIF(range, criteria, [avg_range])", description: "Average with one condition", category: "Math" },
  { name: "AVERAGEIFS", signature: "AVERAGEIFS(avg_range, criteria_range1, criteria1, ...)", description: "Average with multiple conditions", category: "Math" },
  { name: "MAXIFS", signature: "MAXIFS(max_range, criteria_range1, criteria1, ...)", description: "Max with conditions", category: "Math" },
  { name: "MINIFS", signature: "MINIFS(min_range, criteria_range1, criteria1, ...)", description: "Min with conditions", category: "Math" },

  // Text
  { name: "CONCATENATE", signature: "CONCATENATE(text1, [text2], ...)", description: "Joins text strings", category: "Text" },
  { name: "CONCAT", signature: "CONCAT(text1, [text2], ...)", description: "Joins text strings", category: "Text" },
  { name: "TEXTJOIN", signature: "TEXTJOIN(delimiter, ignore_empty, text1, ...)", description: "Joins with delimiter", category: "Text" },
  { name: "LEFT", signature: "LEFT(text, [num_chars])", description: "Returns leftmost characters", category: "Text" },
  { name: "RIGHT", signature: "RIGHT(text, [num_chars])", description: "Returns rightmost characters", category: "Text" },
  { name: "MID", signature: "MID(text, start_num, num_chars)", description: "Returns middle characters", category: "Text" },
  { name: "LEN", signature: "LEN(text)", description: "Returns text length", category: "Text" },
  { name: "TRIM", signature: "TRIM(text)", description: "Removes extra spaces", category: "Text" },
  { name: "UPPER", signature: "UPPER(text)", description: "Converts to uppercase", category: "Text" },
  { name: "LOWER", signature: "LOWER(text)", description: "Converts to lowercase", category: "Text" },
  { name: "PROPER", signature: "PROPER(text)", description: "Capitalizes each word", category: "Text" },
  { name: "SUBSTITUTE", signature: "SUBSTITUTE(text, old_text, new_text)", description: "Replaces text in a string", category: "Text" },
  { name: "FIND", signature: "FIND(find_text, within_text, [start_num])", description: "Finds text position (case-sensitive)", category: "Text" },
  { name: "SEARCH", signature: "SEARCH(find_text, within_text, [start_num])", description: "Finds text position (case-insensitive)", category: "Text" },
  { name: "REPLACE", signature: "REPLACE(old_text, start_num, num_chars, new_text)", description: "Replaces part of text", category: "Text" },
  { name: "REPT", signature: "REPT(text, number_times)", description: "Repeats text", category: "Text" },
  { name: "VALUE", signature: "VALUE(text)", description: "Converts text to number", category: "Text" },
  { name: "TEXT", signature: "TEXT(value, format_text)", description: "Formats number as text", category: "Text" },

  // Date & Time
  { name: "NOW", signature: "NOW()", description: "Returns current date & time", category: "Date" },
  { name: "TODAY", signature: "TODAY()", description: "Returns current date", category: "Date" },
  { name: "DATE", signature: "DATE(year, month, day)", description: "Creates a date", category: "Date" },
  { name: "DATEVALUE", signature: "DATEVALUE(date_text)", description: "Converts text to date serial", category: "Date" },
  { name: "YEAR", signature: "YEAR([date])", description: "Returns year from date", category: "Date" },
  { name: "MONTH", signature: "MONTH([date])", description: "Returns month from date", category: "Date" },
  { name: "DAY", signature: "DAY([date])", description: "Returns day from date", category: "Date" },
  { name: "WEEKDAY", signature: "WEEKDAY(date)", description: "Returns day of week", category: "Date" },
  { name: "HOUR", signature: "HOUR(time)", description: "Returns hour", category: "Date" },
  { name: "MINUTE", signature: "MINUTE(time)", description: "Returns minute", category: "Date" },
  { name: "SECOND", signature: "SECOND(time)", description: "Returns second", category: "Date" },
  { name: "EDATE", signature: "EDATE(start_date, months)", description: "Date offset by months", category: "Date" },
  { name: "EOMONTH", signature: "EOMONTH(start_date, months)", description: "End of month offset", category: "Date" },

  // Sparklines
  { name: "SPARKLINE", signature: "SPARKLINE(data, [type])", description: "Mini chart: line, bar, or winloss", category: "Chart" },
];
