import { Database, Plus, Trash2 } from 'lucide-react';
import type { SchemaTableStats } from '../types';

interface Props {
  stats: SchemaTableStats[];
  discoveredTables: string[];
  onChange: (stats: SchemaTableStats[]) => void;
}

export function SchemaEditor({ stats, discoveredTables, onChange }: Props) {
  const update = (index: number, patch: Partial<SchemaTableStats>) => {
    onChange(stats.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const addTable = () => {
    const missing = discoveredTables.find((table) => !stats.some((item) => item.table.toLowerCase() === table.toLowerCase()));
    onChange([...stats, { table: missing ?? `table_${stats.length + 1}`, rows: 100000, indexedColumns: [] }]);
  };

  return (
    <section className="schema-editor">
      <div className="section-title-row compact">
        <div>
          <span className="eyebrow">Cost-model inputs</span>
          <h3>Schema statistics</h3>
        </div>
        <Database size={21} />
      </div>
      <p className="muted">These values drive educational estimates. They are never presented as engine statistics.</p>
      <div className="schema-table-list">
        {stats.map((item, index) => (
          <article className="schema-row" key={`${item.table}-${index}`}>
            <label>
              Table
              <input value={item.table} onChange={(event) => update(index, { table: event.target.value })} />
            </label>
            <label>
              Estimated rows
              <input type="number" min="1" value={item.rows} onChange={(event) => update(index, { rows: Math.max(1, Number(event.target.value) || 1) })} />
            </label>
            <label className="wide-label">
              Indexed columns
              <input value={item.indexedColumns.join(', ')} placeholder="id, customer_id" onChange={(event) => update(index, { indexedColumns: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} />
            </label>
            <button className="icon-button danger" aria-label={`Remove ${item.table}`} onClick={() => onChange(stats.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={17} /></button>
          </article>
        ))}
      </div>
      <button className="secondary-button full-width" onClick={addTable}><Plus size={17} /> Add table statistics</button>
    </section>
  );
}
