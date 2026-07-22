import type { Dialect, SchemaTableStats } from '../types';

export interface SqlSample {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  dialect: Dialect;
  sql: string;
  schema: SchemaTableStats[];
}

export const samples: SqlSample[] = [
  {
    id: 'revenue-leaderboard',
    title: 'Customer revenue leaderboard',
    difficulty: 'Intermediate',
    dialect: 'postgresql',
    sql: `SELECT
  c.name,
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS total_revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= '2026-01-01'
  AND o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC
LIMIT 20;`,
    schema: [
      { table: 'customers', rows: 100000, indexedColumns: ['id'] },
      { table: 'orders', rows: 5000000, indexedColumns: ['id', 'customer_id'] },
    ],
  },
  {
    id: 'function-on-index',
    title: 'Function on indexed date column',
    difficulty: 'Beginner',
    dialect: 'mysql',
    sql: `SELECT id, customer_id, amount
FROM orders
WHERE YEAR(created_at) = 2026
ORDER BY created_at DESC;`,
    schema: [
      { table: 'orders', rows: 5000000, indexedColumns: ['id', 'created_at'] },
    ],
  },
  {
    id: 'correlated-subquery',
    title: 'Correlated subquery clinic',
    difficulty: 'Advanced',
    dialect: 'postgresql',
    sql: `SELECT c.id, c.name,
  (SELECT COUNT(*)
   FROM orders o
   WHERE o.customer_id = c.id) AS order_count
FROM customers c
WHERE c.country = 'Germany'
ORDER BY order_count DESC;`,
    schema: [
      { table: 'customers', rows: 100000, indexedColumns: ['id', 'country'] },
      { table: 'orders', rows: 5000000, indexedColumns: ['id'] },
    ],
  },
  {
    id: 'deep-offset',
    title: 'Deep OFFSET pagination',
    difficulty: 'Intermediate',
    dialect: 'postgresql',
    sql: `SELECT id, title, published_at
FROM articles
ORDER BY published_at DESC
LIMIT 50 OFFSET 250000;`,
    schema: [
      { table: 'articles', rows: 3000000, indexedColumns: ['id'] },
    ],
  },
  {
    id: 'cartesian-risk',
    title: 'Missing join condition',
    difficulty: 'Beginner',
    dialect: 'postgresql',
    sql: `SELECT c.name, o.amount
FROM customers c
JOIN orders o
WHERE o.status = 'pending';`,
    schema: [
      { table: 'customers', rows: 100000, indexedColumns: ['id'] },
      { table: 'orders', rows: 5000000, indexedColumns: ['id', 'status'] },
    ],
  },
];

export const initialSample = samples[0];
