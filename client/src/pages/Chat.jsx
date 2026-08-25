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
    socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
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
  }, [id]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const otherParticipant = chat?.participants?.find(
    (p) => p._id !== user?._id
  );

  const isCompleted = chat?.status === 'completed';

  // Determine roles
  const studentId =
    chat?.request?.student?._id || chat?.request?.student;
  const teacherId =
    chat?.request?.selectedTeacher?._id || chat?.request?.selectedTeacher;

  const amITeacher =
    teacherId && user?._id && teacherId.toString() === user._id.toString();
  const amIStudent =
    studentId && user?._id && studentId.toString() === user._id.toString();

  // If role is determined
  const myRole = amITeacher ? 'Teacher' : 'Student';
  const otherRole = amITeacher ? 'Student' : 'Teacher';

  const myRoleBadge = amITeacher ? '👨‍🏫 Teacher' : '🎓 Student';
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
    // Shift+Enter → new line; Enter alone → send
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
    <div className="page-body page-enter" style={{ paddingBottom: 20 }}>
      <div className="container">
        <div className="chat-page">
          {/* ── Chat Header ── */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="chat-back-btn" onClick={() => navigate(-1)} title="Back">
                ←
              </button>
              <div className="chat-header-info">
                <div className="chat-header-title">
                  {chat.skill || 'Peer Learning Session'}
                </div>
                <div className="chat-header-sub">
                  {isCompleted ? (
                    '✅ Session Completed'
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Complete Session button */}
              {!isCompleted && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCompleteSession}
                  disabled={completing}
                  style={{ fontSize: '0.8rem' }}
                  title="Mark session as complete"
                >
                  {completing ? '…' : '✔ Complete Session'}
                </button>
              )}

              {/* Other Participant Pill */}
              {otherParticipant && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-inset)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                  <div className="profile-avatar" style={{ width: 26, height: 26, fontSize: '0.8rem' }}>
                    {(otherParticipant?.name?.[0] || otherParticipant?.username?.[0] || 'P').toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {otherParticipant?.name || otherParticipant?.username || 'Peer'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                      {otherRoleBadge}
                    </span>
                  </div>
                </div>
              )}

              {/* Current User Role Badge */}
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                You: {myRoleBadge}
              </span>
            </div>
          </div>

          {/* Session completed banner */}
          {isCompleted && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(99, 102, 241, 0.1))',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              margin: '0 0 12px',
              textAlign: 'center',
              color: 'var(--success)',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}>
              ✅ This session was completed on {new Date(chat.completedAt).toLocaleDateString()}. 
              Thank you for learning together!
            </div>
          )}

          {/* Messages Stream */}
          <div className="chat-messages">
            {chat.messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', margin: 'auto' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👋</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No messages yet.</p>
                <p>
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
                    <div style={{ maxWidth: '80%' }}>
                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: isMe ? 'var(--text-muted)' : 'var(--accent-indigo)',
                        marginBottom: 3,
                        textAlign: isMe ? 'right' : 'left',
                      }}>
                        {senderName} • {senderRole}
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
            <div style={{
              padding: '14px 20px',
              background: 'var(--surface-inset)',
              borderTop: '1px solid var(--border)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}>
              Session completed — messaging is closed.
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
                className="chat-input-field"
                placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                style={{ resize: 'none', overflowY: 'hidden', lineHeight: '1.5' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
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
          )}
        </div>
      </div>
    </div>
  );
}
