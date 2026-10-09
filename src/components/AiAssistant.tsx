import { useEffect, useRef, useState } from 'react';
import { askAssistant, QUICK_PROMPTS, type ChatMessage } from '../lib/ai';

interface UiMsg extends ChatMessage {
  id: number;
  action?: { label: string; page: string };
}

/** Module 13 — AI Assistance: floating chat assistant on every page */
export default function AiAssistant({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<UiMsg[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Assalam-o-Alaikum! 👋 Main ManzilIQ AI Assistant hoon. Plot prices, bookings, installments — kuch bhi poochein.',
    },
  ]);
  const idRef = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    setInput('');
    const userMsg: UiMsg = { id: idRef.current++, role: 'user', text: t };
    setMsgs((p) => [...p, userMsg]);
    setLoading(true);
    try {
      const history: ChatMessage[] = [...msgs, userMsg].map(({ role, text }) => ({ role, text }));
      const reply = await askAssistant(history, t);
      setMsgs((p) => [...p, { id: idRef.current++, role: 'assistant', text: reply.text, action: reply.action }]);
    } catch {
      setMsgs((p) => [...p, { id: idRef.current++, role: 'assistant', text: 'Kuch ghalat ho gaya — dobara try karein.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="ai-fab" onClick={() => setOpen(!open)} aria-label="AI Assistant">
        {open ? '✕' : '🤖'}
      </button>
      {open && (
        <div className="ai-panel">
          <div className="ai-header">
            <strong>🤖 ManzilIQ AI Assistant</strong>
            <button className="link inline" onClick={() => setOpen(false)}>Close</button>
          </div>
          <div className="ai-messages">
            {msgs.map((m) => (
              <div key={m.id} className={`ai-msg ${m.role}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                {m.action && (
                  <button className="btn secondary small" style={{ marginTop: 8 }} onClick={() => { setOpen(false); onNavigate(m.action!.page); }}>
                    {m.action.label} →
                  </button>
                )}
              </div>
            ))}
            {loading && <div className="ai-msg assistant">…</div>}
            <div ref={endRef} />
          </div>
          <div className="ai-prompts">
            {QUICK_PROMPTS.map((p) => (
              <button key={p} className="ai-chip" onClick={() => send(p)}>{p}</button>
            ))}
          </div>
          <form
            className="ai-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Apna sawal likhein…" />
            <button className="btn small" type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
