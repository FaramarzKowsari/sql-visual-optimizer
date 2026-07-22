import { Bot, KeyRound, LoaderCircle, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { explainWithGemini, forgetGeminiSettings, getStoredGeminiSettings, storeGeminiSettings } from '../lib/gemini';
import type { QueryAnalysis } from '../types';

interface Props {
  analysis: QueryAnalysis;
}

export function AiExplainer({ analysis }: Props) {
  const initial = getStoredGeminiSettings();
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [model, setModel] = useState(initial.model);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setError('');
    setResult('');
    setLoading(true);
    try {
      const settings = { apiKey, model };
      storeGeminiSettings(settings);
      setResult(await explainWithGemini(settings, analysis));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  };

  const forget = () => {
    forgetGeminiSettings();
    setApiKey('');
    setResult('');
    setError('');
  };

  return (
    <section className="ai-panel">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">Optional BYOK layer</span>
          <h3>Gemini performance explanation</h3>
        </div>
        <Bot size={25} />
      </div>
      <div className="privacy-note"><ShieldCheck size={18} /><span>The key is stored only in this browser tab via sessionStorage and is never committed to the repository.</span></div>
      <div className="ai-controls">
        <label>
          <span><KeyRound size={15} /> Your Gemini API key</span>
          <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Paste your own key" autoComplete="off" />
        </label>
        <label>
          Model ID
          <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="gemini-3.6-flash" />
        </label>
      </div>
      <div className="button-row">
        <button className="primary-button" onClick={run} disabled={loading || !apiKey.trim()}>
          {loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />} Explain with my key
        </button>
        <button className="secondary-button" onClick={forget}><Trash2 size={17} /> Forget key</button>
      </div>
      <p className="microcopy">API availability, free quotas, billing, and model access belong to the key owner. The application remains fully usable without Gemini.</p>
      {error && <div className="error-box">{error}</div>}
      {result ? <pre className="ai-result">{result}</pre> : (
        <div className="local-explanation">
          <b>Local rule-based explanation</b>
          <p>{analysis.localExplanation}</p>
        </div>
      )}
    </section>
  );
}
