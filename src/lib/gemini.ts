import type { QueryAnalysis } from '../types';

export interface GeminiSettings {
  apiKey: string;
  model: string;
}

export function getStoredGeminiSettings(): GeminiSettings {
  return {
    apiKey: sessionStorage.getItem('svo_gemini_key') ?? '',
    model: sessionStorage.getItem('svo_gemini_model') ?? 'gemini-3.6-flash',
  };
}

export function storeGeminiSettings(settings: GeminiSettings): void {
  sessionStorage.setItem('svo_gemini_key', settings.apiKey.trim());
  sessionStorage.setItem('svo_gemini_model', settings.model.trim() || 'gemini-3.6-flash');
}

export function forgetGeminiSettings(): void {
  sessionStorage.removeItem('svo_gemini_key');
  sessionStorage.removeItem('svo_gemini_model');
}

export async function explainWithGemini(settings: GeminiSettings, analysis: QueryAnalysis): Promise<string> {
  if (!settings.apiKey.trim()) throw new Error('Enter your own Gemini API key first.');
  const model = encodeURIComponent(settings.model.trim() || 'gemini-3.6-flash');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(settings.apiKey.trim())}`;
  const findings = analysis.findings.map((item) => `- ${item.severity.toUpperCase()}: ${item.title} — ${item.explanation}`).join('\n');
  const indexes = analysis.indexes.map((item) => `- ${item.sql}`).join('\n') || '- None generated';
  const prompt = `You are a senior database performance engineer. Explain the following SQL query and its rule-based analysis. Be precise, avoid claiming that estimated plans are real database plans, and distinguish evidence from hypotheses. Return concise Markdown with: Summary, Likely Bottleneck, Recommended Experiments, and Risks.\n\nDialect: ${analysis.dialect}\nSQL:\n${analysis.sql}\n\nMetrics:\n${JSON.stringify(analysis.metrics, null, 2)}\n\nFindings:\n${findings}\n\nExploratory index candidates:\n${indexes}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n').trim();
  if (!text) throw new Error('Gemini returned no text response.');
  return text;
}
