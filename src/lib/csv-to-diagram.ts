/**
 * Converts CSV table data into Mermaid diagram code.
 * Supports: hierarchy/org charts, flow sequences, and ER-like tables.
 */

function parseCSV(csv: string): string[][] {
  const lines = csv.trim().split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    result.push(current.trim());
    return result;
  });
}

function sanitizeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '') || 'node';
}

export function csvToMermaid(csv: string): string {
  const rows = parseCSV(csv);
  if (rows.length < 2) return 'flowchart TD\n    A[No data]';

  const headers = rows[0].map(h => h.toLowerCase());

  // Detect type based on headers
  // 1) If headers include "from" and "to" -> flowchart edges
  const fromIdx = headers.findIndex(h => h === 'from' || h === 'source');
  const toIdx = headers.findIndex(h => h === 'to' || h === 'target' || h === 'destination');
  if (fromIdx >= 0 && toIdx >= 0) {
    const labelIdx = headers.findIndex(h => h === 'label' || h === 'text' || h === 'description');
    const lines = ['flowchart TD'];
    const nodeSet = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const from = rows[i][fromIdx];
      const to = rows[i][toIdx];
      if (!from || !to) continue;
      const fromId = sanitizeId(from);
      const toId = sanitizeId(to);
      if (!nodeSet.has(fromId)) { nodeSet.add(fromId); lines.push(`    ${fromId}[${from}]`); }
      if (!nodeSet.has(toId)) { nodeSet.add(toId); lines.push(`    ${toId}[${to}]`); }
      const label = labelIdx >= 0 && rows[i][labelIdx] ? ` -->|${rows[i][labelIdx]}|` : ' -->';
      lines.push(`    ${fromId}${label} ${toId}`);
    }
    return lines.join('\n');
  }

  // 2) If headers include "parent" and "name/child" -> org chart / hierarchy
  const parentIdx = headers.findIndex(h => h === 'parent' || h === 'manager' || h === 'reports_to' || h === 'reportsto');
  const nameIdx = headers.findIndex(h => h === 'name' || h === 'child' || h === 'employee' || h === 'node');
  if (parentIdx >= 0 && nameIdx >= 0) {
    const lines = ['flowchart TD'];
    const nodeSet = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const name = rows[i][nameIdx];
      const parent = rows[i][parentIdx];
      if (!name) continue;
      const nameId = sanitizeId(name);
      if (!nodeSet.has(nameId)) { nodeSet.add(nameId); lines.push(`    ${nameId}[${name}]`); }
      if (parent) {
        const parentId = sanitizeId(parent);
        if (!nodeSet.has(parentId)) { nodeSet.add(parentId); lines.push(`    ${parentId}[${parent}]`); }
        lines.push(`    ${parentId} --> ${nameId}`);
      }
    }
    return lines.join('\n');
  }

  // 3) If headers include "entity/table" -> ER diagram
  const entityIdx = headers.findIndex(h => h === 'entity' || h === 'table');
  if (entityIdx >= 0) {
    const relatedIdx = headers.findIndex(h => h === 'related' || h === 'related_to' || h === 'relatedto' || h === 'references');
    const relLabel = headers.findIndex(h => h === 'relationship' || h === 'relation' || h === 'type');
    if (relatedIdx >= 0) {
      const lines = ['erDiagram'];
      for (let i = 1; i < rows.length; i++) {
        const entity = rows[i][entityIdx];
        const related = rows[i][relatedIdx];
        const label = relLabel >= 0 && rows[i][relLabel] ? rows[i][relLabel] : 'relates';
        if (entity && related) {
          lines.push(`    ${sanitizeId(entity)} ||--o{ ${sanitizeId(related)} : "${label}"`);
        }
      }
      return lines.join('\n');
    }
  }

  // 4) Default: treat each row as a sequential step
  const lines = ['flowchart TD'];
  const labelCol = headers.findIndex(h => h === 'step' || h === 'name' || h === 'task' || h === 'label') >= 0
    ? headers.findIndex(h => h === 'step' || h === 'name' || h === 'task' || h === 'label')
    : 0;

  for (let i = 1; i < rows.length; i++) {
    const label = rows[i][labelCol] || `Step ${i}`;
    const id = `S${i}`;
    if (i === 1) lines.push(`    ${id}([${label}])`);
    else if (i === rows.length - 1) lines.push(`    ${id}([${label}])`);
    else lines.push(`    ${id}[${label}]`);
    if (i > 1) lines.push(`    S${i - 1} --> ${id}`);
  }
  return lines.join('\n');
}
