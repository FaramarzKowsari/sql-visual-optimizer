SELECT
  c.name,
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS total_revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= '2026-01-01'
  AND o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC
LIMIT 20;
