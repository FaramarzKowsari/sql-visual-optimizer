export type Dialect = 'postgresql' | 'mysql' | 'sqlite' | 'transactsql';

export type Severity = 'critical' | 'warning' | 'info' | 'success';

export interface SchemaTableStats {
  table: string;
  rows: number;
  indexedColumns: string[];
}

export interface PlanNode {
  id: string;
  type: string;
  label: string;
  detail?: string;
  estimatedRows?: number;
  estimatedCost?: number;
  actualTime?: number;
  actualRows?: number;
  children?: PlanNode[];
}

export interface OptimizationFinding {
  id: string;
  severity: Severity;
  title: string;
  explanation: string;
  recommendation?: string;
  code?: string;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  reason: string;
  sql: string;
  confidence: 'high' | 'medium' | 'exploratory';
}

export interface QueryMetrics {
  score: number;
  estimatedCost: number;
  estimatedRowsScanned: number;
  complexity: 'Low' | 'Moderate' | 'High' | 'Very High';
  tables: number;
  joins: number;
  filters: number;
  aggregates: number;
}

export interface QueryAnalysis {
  sql: string;
  dialect: Dialect;
  parsed: boolean;
  parseError?: string;
  ast?: unknown;
  tables: string[];
  aliases: Record<string, string>;
  logicalPlan: PlanNode;
  findings: OptimizationFinding[];
  indexes: IndexSuggestion[];
  metrics: QueryMetrics;
  localExplanation: string;
}

export interface ExplainImportResult {
  engine: string;
  root: PlanNode;
  totalCost?: number;
  planningTime?: number;
  executionTime?: number;
  notes: string[];
}
