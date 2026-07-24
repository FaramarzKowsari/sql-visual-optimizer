import { BookOpen, ExternalLink, Github, GraduationCap, Linkedin, Orbit, ServerCog } from 'lucide-react';

const guidebookUrl = `${import.meta.env.BASE_URL}guidebook/`;

const links = [
  { label: 'Infographic Guidebook', url: guidebookUrl, icon: BookOpen },
  { label: 'Software DOI', url: 'https://doi.org/10.5281/zenodo.21501361', icon: ExternalLink },
  { label: 'ORCID', url: 'https://orcid.org/0000-0003-1692-0453', icon: Orbit },
  { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=G7tP5WMAAAAJ&hl=en', icon: GraduationCap },
  { label: 'GitHub', url: 'https://github.com/FaramarzKowsari', icon: Github },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/faramarzkowsari', icon: Linkedin },
  { label: 'Google Books', url: 'https://play.google.com/store/search?q=Faramarz_Kowsari&c=books', icon: BookOpen },
  { label: 'Official Website', url: 'https://FaramarzKowsari.github.io', icon: ServerCog },
  { label: 'Zenodo Records', url: 'https://zenodo.org/search?q=creators.orcid%3A%220000-0003-1692-0453%22&l=list&p=1&s=10&sort=bestmatch', icon: ExternalLink },
];

export function About() {
  return (
    <div className="about-layout">
      <section className="glass-card author-card">
        <img className="author-photo" src="https://avatars.githubusercontent.com/u/105053743?v=4" alt="Faramarz Kowsari" />
        <div>
          <span className="eyebrow">Author and principal developer</span>
          <h1>Faramarz Kowsari</h1>
          <p>Faramarz Kowsari is an author, Software Engineer and AI researcher based in Istanbul. Focusing on the intersection of technology, education, and personal growth, he has published over 80 digital titles on international platforms. His areas of expertise span Artificial Intelligence, prompt engineering, modern trading strategies (Smart Money Concepts &amp; algorithmic trading), as well as classical literature and mindfulness. In addition to writing, he develops web-based educational tools and creates specialized instructional video content.</p>
          <div className="official-links">
            {links.map(({ label, url, icon: Icon }) => (
              <a href={url} target="_blank" rel="noreferrer" key={label}><Icon size={18} /><span>{label}</span><ExternalLink size={14} /></a>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card about-project">
        <span className="eyebrow">Project philosophy</span>
        <h2>Make the invisible mechanics of SQL visible</h2>
        <p>SQL Visual Optimizer is an educational performance laboratory. It separates three forms of evidence that are often confused:</p>
        <div className="principle-grid">
          <article><b>Estimated plan</b><p>A transparent rule-based model generated in the browser from the query and user-supplied schema statistics.</p></article>
          <article><b>Imported real plan</b><p>A visualization of execution-plan JSON produced by a database engine.</p></article>
          <article><b>AI explanation</b><p>An optional interpretation generated with the visitor’s own Gemini key, never presented as database evidence.</p></article>
        </div>
        <p className="ethics-note">The project deliberately avoids fake precision. Every estimate is labeled, every recommendation is framed as a hypothesis, and real execution plans remain the source of truth.</p>
        <p className="ethics-note">Archived research-software release: <a href="https://doi.org/10.5281/zenodo.21501361" target="_blank" rel="noreferrer">DOI 10.5281/zenodo.21501361</a>.</p>
        <p className="ethics-note">Official visual companion: <a href={guidebookUrl} target="_blank" rel="noreferrer"><em>Inside SQL Visual Optimizer</em> — ten-page infographic guidebook</a>.</p>
      </section>
    </div>
  );
}
