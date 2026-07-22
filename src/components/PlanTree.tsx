import { Activity, Database, Filter, GitMerge, Layers3, ListFilter, ScanSearch, SortAsc } from 'lucide-react';
import type { PlanNode } from '../types';

const iconFor = (type: string) => {
  if (type.includes('JOIN')) return GitMerge;
  if (type.includes('SCAN')) return ScanSearch;
  if (type.includes('FILTER')) return Filter;
  if (type.includes('SORT')) return SortAsc;
  if (type.includes('AGGREGATE')) return Layers3;
  if (type.includes('LIMIT') || type.includes('OFFSET')) return ListFilter;
  if (type.includes('RESULT')) return Database;
  return Activity;
};

interface Props {
  node: PlanNode;
  depth?: number;
  maxCost?: number;
}

function findMaxCost(node: PlanNode): number {
  return Math.max(node.estimatedCost ?? 0, ...(node.children ?? []).map(findMaxCost));
}

export function PlanTree({ node, depth = 0, maxCost }: Props) {
  const Icon = iconFor(node.type);
  const scale = maxCost ?? findMaxCost(node);
  const intensity = scale > 0 ? Math.min(1, (node.estimatedCost ?? 0) / scale) : 0;
  const heat = `rgba(255, 109, 89, ${0.08 + intensity * 0.28})`;

  return (
    <div className="plan-branch" data-depth={depth}>
      <article className="plan-node" style={{ background: heat }}>
        <div className="plan-node-icon"><Icon size={18} /></div>
        <div className="plan-node-body">
          <div className="plan-node-heading">
            <strong>{node.label}</strong>
            <span className="node-type">{node.type}</span>
          </div>
          {node.detail && <p>{node.detail}</p>}
          <div className="node-metrics">
            {node.estimatedRows !== undefined && <span>Est. rows <b>{node.estimatedRows.toLocaleString()}</b></span>}
            {node.estimatedCost !== undefined && <span>Est. cost <b>{node.estimatedCost.toLocaleString()}</b></span>}
            {node.actualRows !== undefined && <span>Actual rows <b>{node.actualRows.toLocaleString()}</b></span>}
            {node.actualTime !== undefined && <span>Actual time <b>{node.actualTime.toLocaleString()} ms</b></span>}
          </div>
        </div>
      </article>
      {(node.children ?? []).length > 0 && (
        <div className="plan-children">
          {(node.children ?? []).map((child) => (
            <PlanTree key={child.id} node={child} depth={depth + 1} maxCost={scale} />
          ))}
        </div>
      )}
    </div>
  );
}
