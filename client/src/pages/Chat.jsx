import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getChat, sendMessage as apiSendMessage, completeChat } from '../api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

let socket;

export default function Chat() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [chat, setChat]             = useState(null);
  const [input, setInput]           = useState('');
  const [sending, setSending]       = useState(false);
  const [completing, setCompleting] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Socket.IO setup ──
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');
    socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.emit('join_chat', id);

    socket.on('new_message', (updatedChat) => {
      setChat(updatedChat);
    });

    socket.on('session_completed', (updatedChat) => {
      setChat(updatedChat);
    });

    return () => {
      socket.emit('leave_chat', id);
      socket.disconnect();
    };
  }, [id]);

  // ── Load initial chat ──
  useEffect(() => {
    getChat(id)
      .then((r) => setChat(r.data))
      .catch(() => navigate('/learn'));
  }, [id, navigate]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const otherParticipant = chat?.participants?.find(
    (p) => p._id !== user?._id
  );

  const isCompleted = chat?.status === 'completed';

  // Determine roles
  const teacherId =
    chat?.request?.selectedTeacher?._id || chat?.request?.selectedTeacher;

  const amITeacher =
    teacherId && user?._id && teacherId.toString() === user._id.toString();

  const myRoleBadge    = amITeacher ? '👨‍🏫 Teacher' : '🎓 Student';
  const otherRoleBadge = amITeacher ? '🎓 Student' : '👨‍🏫 Teacher';

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || isCompleted) return;
    setSending(true);
    setInput('');
    try {
      const { data } = await apiSendMessage(id, text);
      setChat(data);
    } catch {
      setInput(text);
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

  const handleCompleteSession = async () => {
    if (!confirm('Mark this session as complete? Messaging will be closed.')) return;
    setCompleting(true);
    try {
      const { data } = await completeChat(id);
      setChat(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete session.');
    } finally {
      setCompleting(false);
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
    <div className="page-body chat-page-wrapper">
      <div className="chat-page">

        {/* ── Chat Header ── */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="chat-back-btn" onClick={() => navigate(-1)} title="Back" aria-label="Go back">
              ←
            </button>
            <div className="chat-header-info">
              <div className="chat-header-title">
                {chat.skill || 'Peer Learning Session'}
              </div>
              <div className="chat-header-sub">
                {isCompleted ? (
                  <span style={{ color: 'var(--success)' }}>✅ Session Completed</span>
                ) : otherParticipant ? (
                  amITeacher ? (
                    <span>🎓 Student: <strong>{otherParticipant.name}</strong></span>
                  ) : (
                    <span>👨‍🏫 Teacher: <strong>{otherParticipant.name}</strong></span>
                  )
                ) : (
                  'Live Session'
                )}
              </div>
            </div>
          </div>

          <div className="chat-header-right">
            {/* Role badge */}
            <span className="badge badge-indigo chat-role-badge">
              {myRoleBadge}
            </span>

            {/* Other participant pill */}
            {otherParticipant && (
              <div className="chat-peer-pill">
                <div className="profile-avatar" style={{ width: 28, height: 28, fontSize: '0.78rem', flexShrink: 0 }}>
                  {(otherParticipant?.name?.[0] || 'P').toUpperCase()}
                </div>
                <div className="chat-peer-info">
                  <span className="chat-peer-name">
                    {otherParticipant?.name || 'Peer'}
                  </span>
                  <span className="chat-peer-role">{otherRoleBadge}</span>
                </div>
              </div>
            )}

            {/* Complete Session button — desktop only */}
            {!isCompleted && (
              <button
                className="btn btn-secondary btn-sm chat-complete-btn"
                onClick={handleCompleteSession}
                disabled={completing}
                title="Mark session as complete"
              >
                {completing ? '…' : '✔ Complete'}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile: Complete Session bar ── */}
        {!isCompleted && (
          <div className="chat-mobile-action-bar">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCompleteSession}
              disabled={completing}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {completing ? 'Completing…' : '✔ Mark Session Complete'}
            </button>
          </div>
        )}

        {/* Session completed banner */}
        {isCompleted && (
          <div className="chat-completed-banner">
            ✅ This session was completed on {new Date(chat.completedAt).toLocaleDateString()}.
            Thank you for learning together!
          </div>
        )}

        {/* Messages Stream */}
        <div className="chat-messages" role="log" aria-live="polite" aria-relevant="additions text">
          {chat.messages.length === 0 ? (
            <div className="chat-empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👋</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No messages yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {amITeacher
                  ? `Say hello to your student (${otherParticipant?.name || 'Student'}) to begin!`
                  : `Say hello to your teacher (${otherParticipant?.name || 'Teacher'}) to begin!`}
              </p>
            </div>
          ) : (
            chat.messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              const initial = msg.sender?.name?.[0]?.toUpperCase() ?? (isMe ? 'U' : '?');
              const senderName = isMe ? 'You' : (msg.sender?.name || otherParticipant?.name || 'Peer');
              const senderRole = isMe ? myRoleBadge : otherRoleBadge;

              return (
                <div className={`chat-msg ${isMe ? 'me' : ''}`} key={msg._id || Math.random()}>
                  <div className="chat-msg-avatar">{initial}</div>
                  <div className="chat-msg-body">
                    <div className={`chat-msg-meta ${isMe ? 'me' : ''}`}>
                      {senderName} · {senderRole}
                    </div>
                    <div className="chat-bubble">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                    <span className="chat-time">{formatTime(msg.sentAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        {isCompleted ? (
          <div className="chat-closed-bar">
            🔒 Session completed — messaging is closed.
          </div>
        ) : (
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              id="chat-message-input"
              className="chat-input-field"
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              rows={1}
              aria-label="Type a message"
              aria-describedby="chat-message-help"
              style={{ resize: 'none', overflowY: 'hidden', lineHeight: '1.5' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <span id="chat-message-help" className="sr-only">Press Enter to send and Shift plus Enter for a new line.</span>
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || sending}
              title="Send message"
              aria-label="Send message"
            >
              {sending ? '…' : '➤'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
