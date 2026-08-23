import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChat, sendMessage as apiSendMessage } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getChat(id)
      .then((r) => setChat(r.data))
      .catch(() => navigate('/learn'));
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const otherParticipant = chat?.participants?.find(
    (p) => p._id !== user?._id
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      const { data } = await apiSendMessage(id, text);
      setChat(data);
    } catch {
      setInput(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!chat) {
    return (
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-body page-enter" style={{ paddingBottom: 20 }}>
      <div className="container">
        <div className="chat-page">
          {/* Chat Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="chat-back-btn" onClick={() => navigate('/learn')} title="Back to Learn">
                ←
              </button>
              <div className="chat-header-info">
                <div className="chat-header-title">{chat.skill || 'Peer Learning Session'}</div>
                <div className="chat-header-sub">
                  {otherParticipant ? `1-on-1 with ${otherParticipant.name}` : 'Live Session'}
                </div>
              </div>
            </div>

            {otherParticipant && (
              <div className="profile-btn" style={{ pointerEvents: 'none' }}>
                <div className="profile-avatar">
                  {otherParticipant.name[0].toUpperCase()}
                </div>
                <span className="profile-name">{otherParticipant.name.split(' ')[0]}</span>
              </div>
            )}
          </div>

          {/* Messages Stream */}
          <div className="chat-messages">
            {chat.messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', margin: 'auto' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👋</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet.</p>
                <p>Say hello to your peer to begin this learning session!</p>
              </div>
            ) : (
              chat.messages.map((msg) => {
                const isMe = msg.sender?._id === user?._id;
                const initial = msg.sender?.name?.[0]?.toUpperCase() ?? '?';
                return (
                  <div className={`chat-msg ${isMe ? 'me' : ''}`} key={msg._id || Math.random()}>
                    <div className="chat-msg-avatar">{initial}</div>
                    <div>
                      <div className="chat-bubble">{msg.content}</div>
                      <span className="chat-time">{formatTime(msg.sentAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              className="chat-input-field"
              type="text"
              placeholder="Type your message (Press Enter to send)…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || sending}
              title="Send message"
            >
              {sending ? '…' : '➤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
