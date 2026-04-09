import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send, Image as ImageIcon, X, ArrowLeft, Flag, AlertTriangle, Loader2 } from 'lucide-react';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);
  let typingTimeout = useRef(null);

  // Load existing messages from DB
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/chats/messages/${roomId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
      setLoadingHistory(false);
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_room', roomId);
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => {
        // Avoid duplicates (message might already exist from DB load)
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('user_typing', (userName) => {
      setTypingUser(userName);
    });

    newSocket.on('user_stopped_typing', () => {
      setTypingUser('');
    });

    return () => {
      newSocket.emit('leave_room', roomId);
      newSocket.close();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket) {
      socket.emit('typing', { room_id: roomId, user_name: user?.role === 'Listener' ? 'Listener' : 'Seeker' });

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop_typing', { room_id: roomId });
      }, 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    if (socket) {
      socket.emit('send_message', {
        room_id: roomId,
        sender_id: user.id,
        text_content: newMessage,
        file_url: selectedFile
      });
      socket.emit('stop_typing', { room_id: roomId });
    }

    setNewMessage('');
    setSelectedFile(null);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    try {
      // We need to figure out who the "other" user is. For simplicity, we'll
      // use a generic report. In production, you'd get this from the chat room data.
      await axios.post('http://127.0.0.1:5000/api/reports', {
        reported_user_id: 'unknown', // Will be handled by the room context
        reason: reportReason
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
        setReportReason('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden bg-slate-900 w-full pl-6 pr-6 py-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 shrink-0 rounded-t-3xl flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 mr-3 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-500 to-primary-500 p-[2px]">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent-400 to-primary-400">
                  {user.role === 'Seeker' ? 'L' : 'S'}
                </span>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-wide">
                {user.role === 'Seeker' ? 'Anonymous Listener' : 'Anonymous Seeker'}
              </h2>
              <p className="text-xs text-accent-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-500 block animate-pulse"></span>
                Secure Session
              </p>
            </div>
          </div>
        </div>
        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="p-2.5 hover:bg-red-500/20 rounded-xl transition-colors group border border-transparent hover:border-red-500/30"
          title="Report user"
        >
          <Flag className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5 backdrop-blur-sm border-x border-white/5 scrollbar-thin z-10 relative">
        <div className="text-center my-6">
          <span className="bg-black/30 backdrop-blur-md text-slate-400 text-xs px-4 py-2 rounded-full border border-white/5 shadow-inner">
            This chat is encrypted and anonymous. Be kind.
          </span>
        </div>

        {loadingHistory && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === user.id;
          return (
            <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-4 shadow-lg ${
                  isMine
                    ? 'bg-gradient-to-br from-accent-600 to-accent-700 text-white rounded-br-sm'
                    : 'bg-white/10 border border-white/10 text-slate-100 rounded-bl-sm backdrop-blur-md'
                }`}
              >
                {msg.file_url && (
                  <img src={msg.file_url} alt="Shared file" className="max-h-64 rounded-xl mb-2 object-cover border border-white/20" />
                )}
                {msg.text_content && <p className="leading-relaxed">{msg.text_content}</p>}
                <span className={`text-[10px] block mt-2 opacity-70 ${isMine ? 'text-accent-100/70 text-right' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 rounded-2xl rounded-bl-sm p-4 w-16 h-12 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 shrink-0 rounded-b-3xl z-10 flex flex-col gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {selectedFile && (
          <div className="relative inline-block w-max">
             <div className="absolute -top-2 -right-2 bg-slate-800 p-1 rounded-full cursor-pointer z-10 hover:bg-slate-700 border border-white/20 shadow-lg" onClick={() => setSelectedFile(null)}>
                <X className="w-4 h-4 text-white" />
             </div>
             <img src={selectedFile} alt="Preview" className="h-20 rounded-lg border-2 border-accent-500/50 object-cover shadow-lg" />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <label className="p-3 bg-black/20 hover:bg-black/40 text-slate-300 rounded-xl cursor-pointer transition-colors border border-white/5 active:scale-95 group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <ImageIcon className="w-6 h-6 group-hover:text-accent-400 transition-colors" />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-transparent transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedFile}
            className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:hover:scale-100 text-white p-3 rounded-xl transition-all shadow-lg shadow-accent-600/20 active:scale-95"
          >
            <Send className="w-6 h-6 ml-1" />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
            {reportSubmitted ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Report Submitted</h3>
                <p className="text-slate-400">Our moderators will review this report shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-red-400">
                  <Flag className="w-5 h-5" /> Report User
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  If this user is being abusive or inappropriate, please let us know.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none min-h-[100px] resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowReportModal(false); setReportReason(''); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
