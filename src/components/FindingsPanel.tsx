import { AlertOctagon, AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import type { IndexSuggestion, OptimizationFinding } from '../types';

const icons = {
  critical: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

interface Props {
  findings: OptimizationFinding[];
  indexes: IndexSuggestion[];
}

export function FindingsPanel({ findings, indexes }: Props) {
  return (
    <div className="findings-stack">
      {findings.map((item) => {
        const Icon = icons[item.severity];
        return (
          <article className={`finding finding-${item.severity}`} key={item.id}>
            <Icon size={20} />
            <div>
              <h4>{item.title}</h4>
              <p>{item.explanation}</p>
              {item.recommendation && <div className="recommendation"><b>Recommendation:</b> {item.recommendation}</div>}
              {item.code && <pre className="mini-code"><code>{item.code}</code></pre>}
            </div>
          </article>
        );
      })}

      {indexes.length > 0 && (
        <section className="index-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">Hypothesis, not prescription</span>
              <h3>Exploratory index candidates</h3>
            </div>
            <Lightbulb size={24} />
          </div>
          {indexes.map((item) => (
            <article className="index-card" key={`${item.table}-${item.columns.join('-')}`}>
              <div className="index-card-top">
                <strong>{item.table}</strong>
                <span className={`confidence confidence-${item.confidence}`}>{item.confidence} confidence</span>
              </div>
              <p>{item.reason}</p>
              <pre className="mini-code"><code>{item.sql}</code></pre>
              <small>Validate storage, write overhead, selectivity, and the real execution plan before deployment.</small>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
