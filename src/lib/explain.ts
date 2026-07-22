import type { ExplainImportResult, PlanNode } from '../types';

const numberValue = (value: unknown): number | undefined => typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : undefined;

function normalizePostgresNode(node: Record<string, unknown>, path = 'root'): PlanNode {
  const childrenRaw = Array.isArray(node.Plans) ? node.Plans : [];
  const children = childrenRaw.map((child, index) => normalizePostgresNode(child as Record<string, unknown>, `${path}-${index}`));
  const relation = [node['Schema'], node['Relation Name']].filter(Boolean).join('.') || undefined;
  const indexName = node['Index Name'] ? `index: ${String(node['Index Name'])}` : undefined;
  const filter = node['Filter'] ? `filter: ${String(node['Filter'])}` : undefined;
  const joinFilter = node['Hash Cond'] || node['Merge Cond'] || node['Join Filter'];
  const details = [relation, indexName, filter, joinFilter ? `condition: ${String(joinFilter)}` : undefined].filter(Boolean).join(' • ');

  return {
    id: path,
    type: String(node['Node Type'] ?? 'PLAN_NODE').toUpperCase().replaceAll(' ', '_'),
    label: String(node['Node Type'] ?? 'Plan node'),
    detail: details || String(node['Parent Relationship'] ?? ''),
    estimatedRows: numberValue(node['Plan Rows']),
    estimatedCost: numberValue(node['Total Cost']),
    actualRows: numberValue(node['Actual Rows']),
    actualTime: numberValue(node['Actual Total Time']),
    children,
  };
}

export function parseExplainJson(input: string): ExplainImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  const envelope = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!envelope || typeof envelope !== 'object') throw new Error('The JSON does not contain an execution plan object.');
  const record = envelope as Record<string, unknown>;
  const rawPlan = (record.Plan ?? record.plan ?? record) as Record<string, unknown>;
  if (!rawPlan || typeof rawPlan !== 'object') throw new Error('No Plan node was found.');

  const root = normalizePostgresNode(rawPlan);
  const notes: string[] = [];
  if (root.actualTime === undefined) notes.push('Actual timing is absent; this may be EXPLAIN without ANALYZE.');
  if (root.actualRows === undefined) notes.push('Actual row counts are absent.');
  if (record['Planning Time'] !== undefined) notes.push('Planning and execution times were detected.');

  return {
    engine: 'PostgreSQL-compatible JSON',
    root,
    totalCost: root.estimatedCost,
    planningTime: numberValue(record['Planning Time']),
    executionTime: numberValue(record['Execution Time']),
    notes,
  };
}
