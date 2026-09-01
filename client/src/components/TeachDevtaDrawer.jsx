import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { askDevtaAI } from '../api';
import MarkdownRenderer from './MarkdownRenderer';
import { useAuth } from '../context/AuthContext';

export default function TeachDevtaDrawer({ isOpen, onClose, initialQuery = '' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'devta',
      text: 'Namaste! 🙏 I am **Teach Devta** — your personal learning assistant. How can I help your learning or teaching journey today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Escape key closes the drawer; focus moves into input on open
  useEffect(() => {
    if (!isOpen) return undefined;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;


  const handleCopyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSend = async (textToSend) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    // Show login required message if not authenticated
    if (!user) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'user',
          text: q,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          sender: 'devta',
          text: '__LOGIN_REQUIRED__',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInput('');
      return;
    }

    const userMsg = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askDevtaAI({ question: q });
      const devtaMsg = {
        sender: 'devta',
        text: res.data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, devtaMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'devta',
          text: err.response?.data?.fallbackAnswer || 'Teach Devta encountered an issue. Please try again or check connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Explain React useEffect lifecycle',
    'Props vs State in React with code',
    'How do I pass teacher skill verification?',
    'Best practices for peer learning',
  ];

  return (
    <div className="devta-drawer-overlay" onClick={onClose}>
      <div className="devta-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="devta-drawer-header">
          <div className="devta-drawer-title-wrap">
            <div className="devta-ai-avatar-badge">🤖</div>
            <div>
              <h3 className="devta-drawer-title">Teach Devta</h3>
              <span className="devta-drawer-sub">Your AI Learning Assistant • Always Here to Help</span>
            </div>
          </div>
          <button className="devta-drawer-close" onClick={onClose} aria-label="Close Drawer">
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="devta-quick-chips">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="devta-chip"
              onClick={() => handleSend(p)}
              disabled={loading}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="devta-messages-stream" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`devta-msg-row ${m.sender === 'user' ? 'user-row' : 'devta-row'}`}
            >
              {m.sender === 'devta' && <span className="devta-mini-avatar">🤖</span>}
              <div className={`devta-msg-bubble ${m.sender === 'user' ? 'user-bubble' : 'devta-bubble'}`}>
                {m.sender === 'devta' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                      🤖 Teach Devta
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => handleCopyText(m.text, i)}
                      title="Copy full text to paste in chat"
                    >
                      {copiedIdx === i ? '✓ Copied!' : '📋 Copy Text'}
                    </button>
                  </div>
                )}
                <div className="devta-msg-content">
                  {m.sender === 'devta' ? (
                    m.text === '__LOGIN_REQUIRED__' ? (
                      <div className="devta-login-required">
                        <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>🔐</div>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Login Required</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                          Teach Devta use karne ke liye pehle login karo! 🙏
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => { onClose(); navigate('/login'); }}
                          >
                            Login Karo
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { onClose(); navigate('/signup'); }}
                          >
                            Sign Up
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={m.text} />
                    )
                  ) : (
                    m.text
                  )}
                </div>
                <span className="devta-msg-time">{m.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="devta-msg-row devta-row">
              <span className="devta-mini-avatar">🤖</span>
              <div className="devta-msg-bubble devta-bubble devta-typing" role="status" aria-live="polite" aria-label="Teach Devta is typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          className="devta-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            id="devta-drawer-input"
            type="text"
            className="devta-input-field"
            placeholder="Ask Teach Devta anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label="Ask Teach Devta a question"
          />
          <button
            type="submit"
            className="devta-send-btn"
            disabled={!input.trim() || loading}
            aria-label="Send question to Teach Devta"
          >
            {loading ? '…' : '⚡ Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
