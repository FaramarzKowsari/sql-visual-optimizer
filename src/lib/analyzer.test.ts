import { describe, expect, it } from 'vitest';
import { analyzeSql } from './analyzer';

const stats = [
  { table: 'customers', rows: 1000, indexedColumns: ['id'] },
  { table: 'orders', rows: 100000, indexedColumns: ['id'] },
];

describe('analyzeSql', () => {
  it('builds a plan and detects tables', () => {
    const result = analyzeSql('SELECT c.id FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = \'done\' LIMIT 10', 'postgresql', stats);
    expect(result.tables).toEqual(['customers', 'orders']);
    expect(result.logicalPlan.type).toBe('LIMIT');
    expect(result.metrics.joins).toBe(1);
  });

  it('flags a function on a filtered column', () => {
    const result = analyzeSql("SELECT id FROM orders WHERE YEAR(created_at) = 2026", 'mysql', stats);
    expect(result.findings.some((finding) => finding.id === 'function-predicate')).toBe(true);
  });

  it('flags deep offset pagination', () => {
    const result = analyzeSql('SELECT id FROM orders ORDER BY id LIMIT 50 OFFSET 100000', 'postgresql', stats);
    expect(result.findings.some((finding) => finding.id === 'deep-offset')).toBe(true);
  });
});
