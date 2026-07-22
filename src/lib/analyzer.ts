import { Parser } from 'node-sql-parser';
import type {
  Dialect,
  IndexSuggestion,
  OptimizationFinding,
  PlanNode,
  QueryAnalysis,
  QueryMetrics,
  SchemaTableStats,
  Severity,
} from '../types';

const parser = new Parser();

const dialectMap: Record<Dialect, string> = {
  postgresql: 'Postgresql',
  mysql: 'MySQL',
  sqlite: 'SQLite',
  transactsql: 'TransactSQL',
};

const cleanIdentifier = (value: string) => value.replace(/^[`"\[]|[`"\]]$/g, '').replace(/[;,]$/, '');

const unique = <T,>(items: T[]): T[] => [...new Set(items)];

const round = (value: number) => Math.round(value * 10) / 10;

function findTables(sql: string): { tables: string[]; aliases: Record<string, string> } {
  const tables: string[] = [];
  const aliases: Record<string, string> = {};
  const tableRegex = /\b(?:from|join)\s+([`"\[]?[\w.]+[`"\]]?)(?:\s+(?:as\s+)?([a-zA-Z_]\w*))?/gi;
  const reserved = new Set(['where', 'join', 'left', 'right', 'inner', 'outer', 'full', 'cross', 'group', 'order', 'limit', 'offset', 'having', 'union', 'on']);
  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(sql)) !== null) {
    const table = cleanIdentifier(match[1]);
    const possibleAlias = match[2]?.toLowerCase();
    tables.push(table);
    if (possibleAlias && !reserved.has(possibleAlias)) aliases[possibleAlias] = table;
    aliases[table.toLowerCase()] = table;
  }
  return { tables: unique(tables), aliases };
}

function countMatches(sql: string, regex: RegExp): number {
  return (sql.match(regex) ?? []).length;
}

function getStats(table: string, stats: SchemaTableStats[]): SchemaTableStats {
  return stats.find((item) => item.table.toLowerCase() === table.toLowerCase()) ?? {
    table,
    rows: 100000,
    indexedColumns: [],
  };
}

function makeNode(type: string, label: string, detail: string, rows: number, cost: number, children: PlanNode[] = []): PlanNode {
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    label,
    detail,
    estimatedRows: Math.max(1, Math.round(rows)),
    estimatedCost: Math.max(0.1, round(cost)),
    children,
  };
}

function extractWhere(sql: string): string | undefined {
  const match = sql.match(/\bwhere\b([\s\S]*?)(?=\bgroup\s+by\b|\bhaving\b|\border\s+by\b|\blimit\b|\boffset\b|\bunion\b|;|$)/i);
  return match?.[1]?.trim();
}

function extractGroupBy(sql: string): string | undefined {
  const match = sql.match(/\bgroup\s+by\b([\s\S]*?)(?=\bhaving\b|\border\s+by\b|\blimit\b|\boffset\b|\bunion\b|;|$)/i);
  return match?.[1]?.trim();
}

function extractOrderBy(sql: string): string | undefined {
  const match = sql.match(/\border\s+by\b([\s\S]*?)(?=\blimit\b|\boffset\b|\bunion\b|;|$)/i);
  return match?.[1]?.trim();
}

function extractLimit(sql: string): number | undefined {
  const match = sql.match(/\blimit\s+(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

function extractOffset(sql: string): number | undefined {
  const match = sql.match(/\boffset\s+(\d+)/i);
  return match ? Number(match[1]) : undefined;
}

function extractJoinConditions(sql: string): string[] {
  const conditions: string[] = [];
  const regex = /\bjoin\s+[^\s]+(?:\s+(?:as\s+)?\w+)?\s+on\s+([\s\S]*?)(?=\b(?:left|right|inner|outer|full|cross)?\s*join\b|\bwhere\b|\bgroup\s+by\b|\border\s+by\b|\blimit\b|;|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sql)) !== null) conditions.push(match[1].trim());
  return conditions;
}

function buildLogicalPlan(sql: string, tables: string[], stats: SchemaTableStats[]): PlanNode {
  const scanNodes = tables.map((table) => {
    const tableStats = getStats(table, stats);
    const hasIndexHint = tableStats.indexedColumns.length > 0;
    return makeNode(
      hasIndexHint ? 'SCAN' : 'SEQ_SCAN',
      hasIndexHint ? `Table / index candidate: ${table}` : `Sequential scan: ${table}`,
      `${tableStats.rows.toLocaleString()} estimated rows; indexed columns: ${tableStats.indexedColumns.join(', ') || 'none declared'}`,
      tableStats.rows,
      tableStats.rows / (hasIndexHint ? 2500 : 900),
    );
  });

  let current: PlanNode;
  if (scanNodes.length === 0) {
    current = makeNode('RESULT', 'Constant result', 'No base table detected.', 1, 0.1);
  } else if (scanNodes.length === 1) {
    current = scanNodes[0];
  } else {
    const hasJoinCondition = /\bjoin\b[\s\S]*?\bon\b/i.test(sql) || /\busing\s*\(/i.test(sql);
    const baseRows = scanNodes.reduce((sum, node) => sum + (node.estimatedRows ?? 0), 0);
    const joinRows = hasJoinCondition ? Math.max(...scanNodes.map((node) => node.estimatedRows ?? 1)) * 0.35 : scanNodes.reduce((product, node) => product * Math.min(node.estimatedRows ?? 1, 100000), 1);
    current = makeNode(
      hasJoinCondition ? 'HASH_JOIN' : 'CROSS_JOIN',
      hasJoinCondition ? 'Join relation streams' : 'Cartesian product risk',
      hasJoinCondition ? `Estimated from ${scanNodes.length} input relations.` : 'No usable join predicate was detected.',
      joinRows,
      baseRows / 500 + joinRows / 20000,
      scanNodes,
    );
  }

  const where = extractWhere(sql);
  if (where) {
    const predicates = countMatches(where, /\b(?:and|or)\b/gi) + 1;
    const selectivity = /\bor\b/i.test(where) ? 0.45 : Math.max(0.03, 0.28 / predicates);
    current = makeNode('FILTER', 'Apply filter predicates', where, (current.estimatedRows ?? 1) * selectivity, (current.estimatedCost ?? 1) + (current.estimatedRows ?? 1) / 4000, [current]);
  }

  const groupBy = extractGroupBy(sql);
  const aggregateCount = countMatches(sql, /\b(?:count|sum|avg|min|max)\s*\(/gi);
  if (groupBy || aggregateCount > 0) {
    const outputRows = groupBy ? Math.max(1, (current.estimatedRows ?? 1) * 0.06) : 1;
    current = makeNode('AGGREGATE', groupBy ? 'Group and aggregate' : 'Compute aggregate', groupBy || `${aggregateCount} aggregate expression(s)`, outputRows, (current.estimatedCost ?? 1) + (current.estimatedRows ?? 1) / 2800, [current]);
  }

  if (/\bselect\s+distinct\b/i.test(sql)) {
    current = makeNode('DISTINCT', 'Remove duplicate rows', 'Distinctness may require hashing or sorting.', (current.estimatedRows ?? 1) * 0.7, (current.estimatedCost ?? 1) + (current.estimatedRows ?? 1) / 3500, [current]);
  }

  const orderBy = extractOrderBy(sql);
  if (orderBy) {
    const n = Math.max(2, current.estimatedRows ?? 2);
    current = makeNode('SORT', 'Sort result set', orderBy, n, (current.estimatedCost ?? 1) + (n * Math.log2(n)) / 30000, [current]);
  }

  const offset = extractOffset(sql);
  if (offset && offset > 0) {
    current = makeNode('OFFSET', `Skip ${offset.toLocaleString()} rows`, 'Deep offsets still require the engine to find and discard preceding rows.', Math.max(1, (current.estimatedRows ?? 1) - offset), (current.estimatedCost ?? 1) + offset / 5000, [current]);
  }

  const limit = extractLimit(sql);
  if (limit !== undefined) {
    current = makeNode('LIMIT', `Return at most ${limit.toLocaleString()} rows`, 'Limit can reduce downstream transfer, but may not remove upstream sort or scan costs.', Math.min(limit, current.estimatedRows ?? limit), (current.estimatedCost ?? 1) + 0.1, [current]);
  }

  return current;
}

function finding(id: string, severity: Severity, title: string, explanation: string, recommendation?: string, code?: string): OptimizationFinding {
  return { id, severity, title, explanation, recommendation, code };
}

function buildFindings(sql: string, tables: string[], aliases: Record<string, string>, stats: SchemaTableStats[]): OptimizationFinding[] {
  const results: OptimizationFinding[] = [];

  if (/\bselect\s+\*/i.test(sql) || /,\s*\*/.test(sql)) {
    results.push(finding('select-star', 'warning', 'SELECT * increases data movement', 'Retrieving every column couples the query to the full table shape and may increase memory, network, and I/O costs.', 'Select only the columns required by the consumer.'));
  }

  if (/\bjoin\b/i.test(sql) && !/\bjoin\b[\s\S]*?(?:\bon\b|\busing\s*\()/i.test(sql) && !/\bcross\s+join\b/i.test(sql)) {
    results.push(finding('missing-join', 'critical', 'Possible missing join condition', 'A JOIN without ON or USING can create a Cartesian product and multiply row counts dramatically.', 'Add an explicit relationship predicate between the joined tables.'));
  }

  if (/\bcross\s+join\b/i.test(sql)) {
    results.push(finding('cross-join', 'warning', 'CROSS JOIN detected', 'A Cartesian product is legitimate in some models, but its output grows as the product of both input sizes.', 'Confirm that every generated pair is required.'));
  }

  const functionPredicate = sql.match(/\bwhere\b[\s\S]*?\b(year|month|date|lower|upper|trim|cast|coalesce)\s*\(\s*([\w.]+)/i);
  if (functionPredicate) {
    results.push(finding('function-predicate', 'warning', 'Function applied to a filtered column', `The predicate applies ${functionPredicate[1].toUpperCase()}() to ${functionPredicate[2]}, which can prevent ordinary index range access.`, 'Rewrite the predicate as a sargable range or create a deliberate expression index.', /year/i.test(functionPredicate[1]) ? "WHERE created_at >= '2026-01-01'\n  AND created_at < '2027-01-01'" : undefined));
  }

  if (/\blike\s+['"]%/i.test(sql)) {
    results.push(finding('leading-wildcard', 'warning', 'Leading-wildcard search', 'LIKE patterns beginning with % usually cannot use a normal B-tree prefix lookup.', 'Consider full-text search, trigram indexes, or a dedicated search engine.'));
  }

  if (/\border\s+by\s+(?:rand|random)\s*\(\s*\)/i.test(sql)) {
    results.push(finding('random-sort', 'critical', 'Random ordering can force a full sort', 'Assigning a random value to every candidate row is expensive on large tables.', 'Use sampled keys, precomputed random buckets, or engine-specific sampling.'));
  }

  const offset = extractOffset(sql);
  if (offset && offset >= 10000) {
    results.push(finding('deep-offset', 'warning', 'Deep OFFSET pagination', `The engine may scan or sort and then discard ${offset.toLocaleString()} preceding rows.`, 'Prefer keyset pagination using the last seen indexed sort key.', "WHERE published_at < :last_seen\nORDER BY published_at DESC\nLIMIT 50"));
  }

  if (/\bnot\s+in\s*\(/i.test(sql)) {
    results.push(finding('not-in', 'warning', 'NOT IN may behave unexpectedly with NULLs', 'A NULL in the subquery can make three-valued logic suppress rows and complicate optimization.', 'Consider NOT EXISTS with an explicit correlation predicate.'));
  }

  if (/\bselect\s+distinct\b/i.test(sql)) {
    results.push(finding('distinct', 'info', 'DISTINCT adds deduplication work', 'DISTINCT can hide an overly broad join and may require hashing or sorting.', 'Verify whether join cardinality can be corrected instead.'));
  }

  if (/\bwhere\b[\s\S]*?\bor\b/i.test(sql)) {
    results.push(finding('or-predicate', 'info', 'OR predicate deserves plan comparison', 'OR conditions can combine selectivities poorly or prevent a single efficient access path.', 'Compare the original plan with a UNION ALL rewrite when branches are mutually exclusive.'));
  }

  if (/\(\s*select[\s\S]*?\bwhere\b[\s\S]*?=\s*[a-zA-Z_]\w*\./i.test(sql)) {
    results.push(finding('correlated-subquery', 'warning', 'Possible correlated subquery', 'A correlated subquery may execute logically once per outer row, depending on the optimizer and decorrelation opportunities.', 'Compare against a pre-aggregated join or lateral strategy.'));
  }

  if (/\bunion\b(?!\s+all)/i.test(sql)) {
    results.push(finding('union-dedup', 'info', 'UNION removes duplicates', 'UNION normally adds a global deduplication step.', 'Use UNION ALL when duplicate removal is not required.'));
  }

  if (!/\blimit\b/i.test(sql) && tables.length > 0 && !/\b(?:count|sum|avg|min|max)\s*\(/i.test(sql)) {
    results.push(finding('unbounded-result', 'info', 'Result set is not bounded', 'Exploratory queries can accidentally return or transfer very large result sets.', 'Add a LIMIT during investigation; remove it deliberately for production exports.'));
  }

  const joinConditions = extractJoinConditions(sql);
  const indexed = new Set(stats.flatMap((item) => item.indexedColumns.map((column) => `${item.table.toLowerCase()}.${column.toLowerCase()}`)));
  for (const condition of joinConditions) {
    const columns = [...condition.matchAll(/([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)/g)];
    for (const column of columns) {
      const table = aliases[column[1].toLowerCase()] ?? column[1];
      const key = `${table.toLowerCase()}.${column[2].toLowerCase()}`;
      if (!indexed.has(key)) {
        results.push(finding(`join-index-${key}`, 'info', `Join key may be unindexed: ${table}.${column[2]}`, 'Large joins often benefit when the lookup or foreign-key side has a supporting index.', 'Validate with the real execution plan before creating an index.'));
      }
    }
  }

  if (results.length === 0) {
    results.push(finding('clean', 'success', 'No obvious rule-based anti-pattern detected', 'The query passed the current static checks. Real performance still depends on data distribution, indexes, memory, concurrency, and the database engine.', 'Import EXPLAIN ANALYZE output for evidence-based diagnosis.'));
  }

  return results;
}

function buildIndexSuggestions(sql: string, aliases: Record<string, string>, stats: SchemaTableStats[]): IndexSuggestion[] {
  const suggestions: IndexSuggestion[] = [];
  const seen = new Set<string>();
  const where = extractWhere(sql) ?? '';
  const joinConditions = extractJoinConditions(sql).join(' AND ');
  const combined = `${where} AND ${joinConditions}`;

  const matches = [...combined.matchAll(/(?:^|\W)([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)\s*(?:=|>=|<=|>|<|in\s*\()/gi)];
  const groups = new Map<string, string[]>();
  for (const match of matches) {
    const table = aliases[match[1].toLowerCase()] ?? match[1];
    const columns = groups.get(table) ?? [];
    columns.push(match[2]);
    groups.set(table, unique(columns));
  }

  for (const [table, columns] of groups.entries()) {
    const declared = getStats(table, stats).indexedColumns.map((column) => column.toLowerCase());
    const missing = columns.filter((column) => !declared.includes(column.toLowerCase())).slice(0, 3);
    if (missing.length === 0) continue;
    const key = `${table}:${missing.join(',')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      table,
      columns: missing,
      reason: 'Columns appear in equality/range filters or join predicates and are not declared as indexed in the current schema model.',
      sql: `CREATE INDEX idx_${table.replace(/\W/g, '_')}_${missing.join('_')}\nON ${table} (${missing.join(', ')});`,
      confidence: missing.length <= 2 ? 'medium' : 'exploratory',
    });
  }

  return suggestions;
}

function computeMetrics(sql: string, plan: PlanNode, tables: string[], findings: OptimizationFinding[]): QueryMetrics {
  const joins = countMatches(sql, /\bjoin\b/gi);
  const filters = extractWhere(sql) ? countMatches(extractWhere(sql)!, /\b(?:and|or)\b/gi) + 1 : 0;
  const aggregates = countMatches(sql, /\b(?:count|sum|avg|min|max)\s*\(/gi);
  const penalty = findings.reduce((sum, item) => sum + (item.severity === 'critical' ? 25 : item.severity === 'warning' ? 12 : item.severity === 'info' ? 4 : 0), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const estimatedCost = plan.estimatedCost ?? 0;
  const complexityPoints = joins * 2 + filters + aggregates * 2 + countMatches(sql, /\bselect\b/gi) - 1;
  const complexity: QueryMetrics['complexity'] = complexityPoints >= 10 ? 'Very High' : complexityPoints >= 6 ? 'High' : complexityPoints >= 3 ? 'Moderate' : 'Low';
  return {
    score,
    estimatedCost: round(estimatedCost),
    estimatedRowsScanned: estimateRowsScanned(plan),
    complexity,
    tables: tables.length,
    joins,
    filters,
    aggregates,
  };
}

function estimateRowsScanned(node: PlanNode): number {
  const own = /SCAN/.test(node.type) ? node.estimatedRows ?? 0 : 0;
  return Math.round(own + (node.children ?? []).reduce((sum, child) => sum + estimateRowsScanned(child), 0));
}

function buildLocalExplanation(metrics: QueryMetrics, findings: OptimizationFinding[], indexes: IndexSuggestion[]): string {
  const mainFinding = findings.find((item) => item.severity === 'critical') ?? findings.find((item) => item.severity === 'warning') ?? findings[0];
  const indexText = indexes.length > 0 ? `${indexes.length} exploratory index candidate${indexes.length > 1 ? 's were' : ' was'} generated.` : 'No new index candidate was generated from the declared schema.';
  return `This query is rated ${metrics.complexity.toLowerCase()} complexity with a rule-based health score of ${metrics.score}/100. The dominant observation is: ${mainFinding.title}. ${mainFinding.explanation} ${indexText} Estimated costs are educational approximations, not a substitute for the database engine's EXPLAIN ANALYZE output.`;
}

export function analyzeSql(sql: string, dialect: Dialect, stats: SchemaTableStats[]): QueryAnalysis {
  const trimmed = sql.trim();
  const { tables, aliases } = findTables(trimmed);
  let ast: unknown;
  let parseError: string | undefined;
  try {
    ast = parser.astify(trimmed, { database: dialectMap[dialect] as never });
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error);
  }

  const logicalPlan = buildLogicalPlan(trimmed, tables, stats);
  const findings = buildFindings(trimmed, tables, aliases, stats);
  const indexes = buildIndexSuggestions(trimmed, aliases, stats);
  const metrics = computeMetrics(trimmed, logicalPlan, tables, findings);

  return {
    sql: trimmed,
    dialect,
    parsed: !parseError,
    parseError,
    ast,
    tables,
    aliases,
    logicalPlan,
    findings,
    indexes,
    metrics,
    localExplanation: buildLocalExplanation(metrics, findings, indexes),
  };
}
