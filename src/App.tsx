import {
  Activity,
  BookOpen,
  Braces,
  CheckCircle2,
  Code2,
  FileJson,
  Gauge,
  Github,
  Info,
  Layers3,
  Play,
  RefreshCcw,
  SearchCode,
  ShieldCheck,
  Sparkles,
  Table2,
  WandSparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { format } from 'sql-formatter';
import { About } from './components/About';
import { AiExplainer } from './components/AiExplainer';
import { ExplainImporter } from './components/ExplainImporter';
import { FindingsPanel } from './components/FindingsPanel';
import { Guidebook } from './components/Guidebook';
import { PlanTree } from './components/PlanTree';
import { SchemaEditor } from './components/SchemaEditor';
import { initialSample, samples } from './data/samples';
import { analyzeSql } from './lib/analyzer';
import type { Dialect, QueryAnalysis, SchemaTableStats } from './types';

const dialectFormatterMap: Record<Dialect, 'postgresql' | 'mysql' | 'sqlite' | 'transactsql'> = {
  postgresql: 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
  transactsql: 'transactsql',
};

type Tab = 'analyze' | 'import' | 'guidebook' | 'about';
type ResultTab = 'plan' | 'findings' | 'ast' | 'ai';

function MetricCard({ icon: Icon, label, value, detail }: { icon: typeof Gauge; label: string; value: string; detail: string }) {
  return (
    <article className="metric-card">
      <div className="metric-icon"><Icon size={20} /></div>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('analyze');
  const [resultTab, setResultTab] = useState<ResultTab>('plan');
  const [sql, setSql] = useState(initialSample.sql);
  const [dialect, setDialect] = useState<Dialect>(initialSample.dialect);
  const [stats, setStats] = useState<SchemaTableStats[]>(initialSample.schema);
  const [analysis, setAnalysis] = useState<QueryAnalysis>(() => analyzeSql(initialSample.sql, initialSample.dialect, initialSample.schema));
  const [showSchema, setShowSchema] = useState(true);

  const criticalCount = useMemo(() => analysis.findings.filter((item) => item.severity === 'critical').length, [analysis]);
  const warningCount = useMemo(() => analysis.findings.filter((item) => item.severity === 'warning').length, [analysis]);

  const runAnalysis = () => {
    setAnalysis(analyzeSql(sql, dialect, stats));
    setResultTab('plan');
  };

  const selectSample = (id: string) => {
    const sample = samples.find((item) => item.id === id);
    if (!sample) return;
    setSql(sample.sql);
    setDialect(sample.dialect);
    setStats(sample.schema);
    setAnalysis(analyzeSql(sample.sql, sample.dialect, sample.schema));
    setResultTab('plan');
  };

  const formatSql = () => {
    try {
      setSql(format(sql, { language: dialectFormatterMap[dialect], keywordCase: 'upper', tabWidth: 2 }));
    } catch {
      // Formatting is a convenience feature; parsing feedback is shown after analysis.
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SQL Visual Optimizer home">
          <div className="brand-mark"><SearchCode size={28} /></div>
          <div><strong>SQL Visual Optimizer</strong><span>Query Planning &amp; Performance Laboratory</span></div>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <button className={tab === 'analyze' ? 'active' : ''} onClick={() => setTab('analyze')}><Code2 size={17} /> Analyze</button>
          <button className={tab === 'import' ? 'active' : ''} onClick={() => setTab('import')}><FileJson size={17} /> Import Plan</button>
          <button className={tab === 'guidebook' ? 'active' : ''} onClick={() => setTab('guidebook')}><BookOpen size={17} /> Guidebook</button>
          <button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}><Info size={17} /> About</button>
        </nav>
        <a className="github-button" href="https://github.com/FaramarzKowsari/sql-visual-optimizer" target="_blank" rel="noreferrer"><Github size={18} /> GitHub</a>
      </header>

      <main id="top">
        {tab === 'analyze' && (
          <>
            <section className="hero-section">
              <div>
                <span className="eyebrow hero-eyebrow"><Sparkles size={16} /> 100% browser-first • no paid API required</span>
                <h1>See what your SQL is asking the database to do.</h1>
                <p>Parse a query, inspect its logical plan, model likely cost centers, surface optimization hypotheses, and compare the estimate with real PostgreSQL EXPLAIN JSON.</p>
                <div className="button-row">
                  <a className="secondary-button" href="https://doi.org/10.5281/zenodo.21501361" target="_blank" rel="noreferrer">
                    <ShieldCheck size={17} />
                    DOI 10.5281/zenodo.21501361
                  </a>
                  <button className="secondary-button" onClick={() => setTab('guidebook')}>
                    <BookOpen size={17} />
                    Open infographic guidebook
                  </button>
                </div>
              </div>
              <div className="trust-stack">
                <span><ShieldCheck size={18} /> Queries stay in your browser</span>
                <span><CheckCircle2 size={18} /> Rule-based analysis works offline</span>
                <span><WandSparkles size={18} /> Gemini is optional and BYOK</span>
              </div>
            </section>

            <section className="hero-showcase-section" aria-labelledby="interface-showcase-title">
              <figure className="hero-showcase">
                <a className="hero-showcase-link" href="./images/sql-visual-optimizer-hero.png" target="_blank" rel="noreferrer" aria-label="Open the SQL Visual Optimizer interface showcase image">
                  <img src="./images/sql-visual-optimizer-hero.png" alt="SQL Visual Optimizer interface showcase with SQL editor, AST, logical plan, EXPLAIN JSON, cost heatmap, and index recommendations" width="1672" height="941" fetchPriority="high" />
                </a>
                <figcaption>
                  <div>
                    <span className="eyebrow">Interface showcase</span>
                    <strong id="interface-showcase-title">From SQL text to an inspectable optimization story.</strong>
                  </div>
                  <p>Explore the editor, abstract syntax tree, estimated logical plan, imported EXPLAIN JSON, cost signals, and index hypotheses in one browser-first laboratory.</p>
                </figcaption>
              </figure>
            </section>

            <section className="workspace-grid">
              <div className="editor-column">
                <article className="glass-card editor-card">
                  <div className="editor-toolbar">
                    <div className="toolbar-group">
                      <label>
                        Example clinic
                        <select onChange={(event) => selectSample(event.target.value)} defaultValue={initialSample.id}>
                          {samples.map((sample) => <option value={sample.id} key={sample.id}>{sample.title} · {sample.difficulty}</option>)}
                        </select>
                      </label>
                      <label>
                        SQL dialect
                        <select value={dialect} onChange={(event) => setDialect(event.target.value as Dialect)}>
                          <option value="postgresql">PostgreSQL</option>
                          <option value="mysql">MySQL</option>
                          <option value="sqlite">SQLite</option>
                          <option value="transactsql">SQL Server / T-SQL</option>
                        </select>
                      </label>
                    </div>
                    <div className="toolbar-actions">
                      <button className="secondary-button" onClick={formatSql}><Braces size={17} /> Format</button>
                      <button className="secondary-button" onClick={() => setShowSchema((value) => !value)}><Table2 size={17} /> {showSchema ? 'Hide' : 'Show'} schema</button>
                    </div>
                  </div>
                  <textarea className="sql-editor" value={sql} onChange={(event) => setSql(event.target.value)} spellCheck={false} aria-label="SQL query editor" />
                  <div className="editor-footer">
                    <span>{sql.split(/\s+/).filter(Boolean).length} tokens · {sql.split('\n').length} lines</span>
                    <button className="primary-button analyze-button" onClick={runAnalysis}><Play size={18} /> Analyze query</button>
                  </div>
                </article>

                {showSchema && <div className="glass-card"><SchemaEditor stats={stats} discoveredTables={analysis.tables} onChange={setStats} /></div>}
              </div>

              <aside className="metrics-column">
                <MetricCard icon={Gauge} label="Health score" value={`${analysis.metrics.score}/100`} detail="Rule-based, not an engine score" />
                <MetricCard icon={Activity} label="Estimated cost" value={analysis.metrics.estimatedCost.toLocaleString()} detail="Relative educational units" />
                <MetricCard icon={Layers3} label="Complexity" value={analysis.metrics.complexity} detail={`${analysis.metrics.tables} tables · ${analysis.metrics.joins} joins`} />
                <MetricCard icon={RefreshCcw} label="Rows scanned" value={analysis.metrics.estimatedRowsScanned.toLocaleString()} detail="Sum of modeled scan inputs" />
                <article className="glass-card parser-status">
                  <div className={analysis.parsed ? 'status-icon status-ok' : 'status-icon status-error'}>{analysis.parsed ? <CheckCircle2 /> : <Info />}</div>
                  <div><b>{analysis.parsed ? 'SQL parsed successfully' : 'Parser needs attention'}</b><p>{analysis.parsed ? `${analysis.tables.length} base relation(s) detected.` : analysis.parseError}</p></div>
                </article>
                <article className="glass-card issue-summary">
                  <span><b>{criticalCount}</b> critical</span>
                  <span><b>{warningCount}</b> warnings</span>
                  <span><b>{analysis.indexes.length}</b> index hypotheses</span>
                </article>
              </aside>
            </section>

            <section className="results-section glass-card">
              <div className="result-tabs" role="tablist">
                <button className={resultTab === 'plan' ? 'active' : ''} onClick={() => setResultTab('plan')}><Layers3 size={17} /> Estimated Plan</button>
                <button className={resultTab === 'findings' ? 'active' : ''} onClick={() => setResultTab('findings')}><Activity size={17} /> Findings <span className="count-badge">{analysis.findings.length}</span></button>
                <button className={resultTab === 'ast' ? 'active' : ''} onClick={() => setResultTab('ast')}><Braces size={17} /> AST</button>
                <button className={resultTab === 'ai' ? 'active' : ''} onClick={() => setResultTab('ai')}><Sparkles size={17} /> AI Explanation</button>
              </div>

              {resultTab === 'plan' && (
                <div className="result-body">
                  <div className="evidence-banner estimated">Estimated plan: generated by transparent browser-side rules and your schema inputs. It is not the database engine’s chosen physical plan.</div>
                  <PlanTree node={analysis.logicalPlan} />
                </div>
              )}
              {resultTab === 'findings' && <div className="result-body"><FindingsPanel findings={analysis.findings} indexes={analysis.indexes} /></div>}
              {resultTab === 'ast' && (
                <div className="result-body">
                  {analysis.parsed ? <pre className="ast-viewer">{JSON.stringify(analysis.ast, null, 2)}</pre> : <div className="error-box">{analysis.parseError}</div>}
                </div>
              )}
              {resultTab === 'ai' && <div className="result-body"><AiExplainer analysis={analysis} /></div>}
            </section>
          </>
        )}

        {tab === 'import' && <ExplainImporter />}
        {tab === 'guidebook' && <Guidebook />}
        {tab === 'about' && <About />}
      </main>

      <footer className="site-footer">
        <div><b>SQL Visual Optimizer</b><span>Designed and developed by Faramarz Kowsari</span></div>
        <div className="footer-links">
          <a href="https://FaramarzKowsari.github.io" target="_blank" rel="noreferrer">Official Website</a>
          <a href="https://orcid.org/0000-0003-1692-0453" target="_blank" rel="noreferrer">ORCID</a>
          <a href="https://github.com/FaramarzKowsari" target="_blank" rel="noreferrer">GitHub</a>
          <a href={`${import.meta.env.BASE_URL}guidebook/`} target="_blank" rel="noreferrer">Guidebook</a>
          <a href="https://doi.org/10.5281/zenodo.21501361" target="_blank" rel="noreferrer">Software DOI</a>
        </div>
      </footer>
    </div>
  );
}
