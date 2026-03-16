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

  private parseArg(): FuncArg {
    const val = this.parseExpr();
    if (typeof val === "string" && val.startsWith("\x00RANGE\x00"))
      return this.expandRange(val.slice(7));
    return val;
  }

  private callFunc(name: string): ArgValue {
    const args: FuncArg[] = [];
    this.skip();
    while (this.pos < this.input.length && this.input[this.pos] !== ")") {
      args.push(this.parseArg());
      this.skip();
      if (this.input[this.pos] === ",") this.pos++;
      this.skip();
    }
    if (this.input[this.pos] === ")") this.pos++;

    const flat = args.flatMap((a) => (Array.isArray(a) ? a : [a]));
    const nums = flat.map((v) => toNum(v));

    const arg0 = args[0];
    const arg1 = args[1];
    const arg2 = args[2];

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
      case "MAX":
        return nums.length ? Math.max(...nums) : 0;
      case "MIN":
        return nums.length ? Math.min(...nums) : 0;
      case "ROUND": {
        const decimals = arg1 !== undefined ? toNum(arg1) : 0;
        const factor = Math.pow(10, decimals);
        return Math.round(toNum(arg0) * factor) / factor;
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
      case "CONCATENATE":
      case "CONCAT":
        return flat.map(String).join("");
      case "LEN":
        return toStr(arg0).length;
      case "TRIM":
        return toStr(arg0).trim();
      case "UPPER":
        return toStr(arg0).toUpperCase();
      case "LOWER":
        return toStr(arg0).toLowerCase();
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
        const idx = s.indexOf(find);
        return idx >= 0 ? idx + 1 : "#VALUE!";
      }
      case "NOW":
        return new Date().toLocaleString();
      case "TODAY":
        return new Date().toLocaleDateString();
      case "YEAR":
        return new Date().getFullYear();
      case "MONTH":
        return new Date().getMonth() + 1;
      case "DAY":
        return new Date().getDate();
      case "VLOOKUP": {
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const table = Array.isArray(arg1) ? arg1 : [];
        const colIdx = toNum(arg2) - 1;
        // Simplified: assumes table data is organized in rows of colCount
        // We detect colCount from the range structure
        const colCount = Math.max(1, colIdx + 1);
        for (let i = 0; i < table.length; i += colCount) {
          if (String(table[i]) === String(lookupVal)) {
            return table[i + colIdx] ?? "#N/A";
          }
        }
        return "#N/A";
      }
      case "INDEX": {
        const arr = Array.isArray(arg0) ? arg0 : [(arg0 as ArgValue)];
        const rowIdx = toNum(arg1) - 1;
        const colIdx = arg2 !== undefined ? toNum(arg2) - 1 : 0;
        if (colIdx > 0) {
          // 2D: assume square-ish
          return arr[rowIdx] ?? "#REF!";
        }
        return arr[rowIdx] ?? "#REF!";
      }
      case "MATCH": {
        const lookupVal = Array.isArray(arg0) ? arg0[0] : (arg0 as ArgValue);
        const arr = Array.isArray(arg1) ? arg1 : [];
        const idx = arr.findIndex((v) => String(v) === String(lookupVal));
        return idx >= 0 ? idx + 1 : "#N/A";
      }
      case "SUMIF": {
        const range = Array.isArray(arg0) ? arg0 : [];
        const criteria = Array.isArray(arg1) ? arg1[0] : (arg1 as ArgValue);
        const sumRange = Array.isArray(arg2) ? arg2 : range;
        let sum = 0;
        range.forEach((v, i) => {
          if (String(v) === String(criteria)) sum += toNum(sumRange[i] ?? 0);
        });
        return sum;
      }
      case "COUNTIF": {
        const range = Array.isArray(arg0) ? arg0 : [];
        const criteria = Array.isArray(arg1) ? arg1[0] : (arg1 as ArgValue);
        return range.filter((v) => String(v) === String(criteria)).length;
      }
      case "AND":
        return flat.every((v) => toNum(v) !== 0) ? 1 : 0;
      case "OR":
        return flat.some((v) => toNum(v) !== 0) ? 1 : 0;
      case "NOT":
        return toNum(arg0) === 0 ? 1 : 0;
      case "PI":
        return Math.PI;
      case "LOG":
        return Math.log10(toNum(arg0));
      case "LN":
        return Math.log(toNum(arg0));
      case "EXP":
        return Math.exp(toNum(arg0));
      case "CEILING":
        return Math.ceil(toNum(arg0) / toNum(arg1 ?? 1)) * toNum(arg1 ?? 1);
      case "FLOOR":
        return Math.floor(toNum(arg0) / toNum(arg1 ?? 1)) * toNum(arg1 ?? 1);
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
