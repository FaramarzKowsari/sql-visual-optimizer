import { BookOpen, Download, ExternalLink, FileText, Github, Layers3 } from 'lucide-react';
import '../guidebook.css';

const guidebookRoot = `${import.meta.env.BASE_URL}guidebook/`;
const guidebookPdf = `${guidebookRoot}inside-sql-visual-optimizer.pdf`;
const guidebookCover = `${guidebookRoot}inside-sql-visual-optimizer-cover.jpg`;

const chapters = [
  'Cover and repository overview',
  'What SQL Visual Optimizer is',
  'Core features',
  'Application workflow',
  'Interface deep dive',
  'Repository architecture',
  'Inside the deterministic analyzer',
  'Privacy, BYOK AI, deployment, and CI/CD',
  'Use cases, research value, and citation',
  'Author and official profiles',
];

export function Guidebook() {
  return (
    <div className="guidebook-layout">
      <section className="glass-card guidebook-intro">
        <a className="guidebook-cover-link" href={guidebookPdf} target="_blank" rel="noreferrer" aria-label="Open Inside SQL Visual Optimizer PDF guidebook">
          <img className="guidebook-cover" src={guidebookCover} alt="Inside SQL Visual Optimizer infographic guidebook cover" width="1055" height="1491" />
        </a>
        <div className="guidebook-copy">
          <span className="eyebrow"><BookOpen size={16} /> Official project guidebook</span>
          <h1>Inside SQL Visual Optimizer</h1>
          <h2>A Visual Guide to Query Planning, Cost Analysis, and SQL Performance</h2>
          <p>This ten-page infographic booklet explains the repository from its public interface to its deterministic analysis engine, evidence labels, privacy model, deployment workflow, scholarly identity, and citation information.</p>
          <div className="guidebook-facts">
            <span><Layers3 size={17} /> 10 infographic pages</span>
            <span><FileText size={17} /> A4 portrait PDF</span>
            <span><Github size={17} /> Repository companion</span>
          </div>
          <div className="button-row guidebook-actions">
            <a className="primary-button" href={guidebookPdf} target="_blank" rel="noreferrer"><BookOpen size={17} /> Open PDF</a>
            <a className="secondary-button" href={guidebookPdf} download><Download size={17} /> Download guidebook</a>
            <a className="secondary-button" href={guidebookRoot} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Dedicated guidebook page</a>
          </div>
        </div>
      </section>

      <section className="glass-card guidebook-chapter-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Contents</span>
            <h2>Repository explained from beginning to end</h2>
          </div>
        </div>
        <div className="guidebook-chapters">
          {chapters.map((chapter, index) => (
            <article key={chapter}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{chapter}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card guidebook-reader-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">Embedded reader</span>
            <h2>Read the guidebook without leaving the project</h2>
          </div>
          <a className="secondary-button" href={guidebookPdf} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Open in a new tab</a>
        </div>
        <object className="guidebook-reader" data={guidebookPdf} type="application/pdf" aria-label="Inside SQL Visual Optimizer PDF guidebook">
          <div className="guidebook-reader-fallback">
            <BookOpen size={38} />
            <p>Your browser did not load the embedded PDF reader.</p>
            <a className="primary-button" href={guidebookPdf} target="_blank" rel="noreferrer">Open the guidebook PDF</a>
          </div>
        </object>
      </section>
    </div>
  );
}
