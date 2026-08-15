import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChat, sendMessage as apiSendMessage } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const [chat,    setChat]    = useState(null);
  const [input,   setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef        = useRef(null);
  const inputRef              = useRef(null);

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
    inputRef.current.style.height = 'auto';
    try {
      const { data } = await apiSendMessage(id, text);
      setChat(data);
    } catch {
      setInput(text); // restore on fail
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!chat) return <div className="splash-loader"><div className="spinner" /></div>;

  return (
    <div className="chat-page page-enter">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate('/learn')}>←</button>
        <div className="chat-header-info">
          <div className="chat-header-title">{chat.skill || 'Learning Session'}</div>
          <div className="chat-header-sub">
            {otherParticipant ? `With ${otherParticipant.name}` : 'Chat'}
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

      {/* Messages */}
      <div className="chat-messages">
        {chat.messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 40 }}>
            No messages yet. Say hi to start learning! 👋
          </div>
        )}
        {chat.messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          const initial = msg.sender?.name?.[0]?.toUpperCase() ?? '?';
          return (
            <div className={`chat-msg ${isMe ? 'me' : ''}`} key={msg._id}>
              <div className="chat-msg-avatar">{initial}</div>
              <div>
                <div className="chat-bubble">{msg.content}</div>
                <span className="chat-time">{formatTime(msg.sentAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <div className="chat-input-bar-inner">
          <button className="chat-attach-btn" title="Attach document">📎</button>
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Type a message…"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={sending} title="Send">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
