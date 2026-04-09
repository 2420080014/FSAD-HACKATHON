import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, ArrowRight, Archive, Loader2, User } from 'lucide-react';

const ChatHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/chats/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
    setLoading(false);
  };

  const handleCloseSession = async (roomId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/chats/sessions/${roomId}/close`);
      setSessions(sessions.map(s => s._id === roomId ? { ...s, status: 'Closed' } : s));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Clock className="w-8 h-8 text-accent-500" /> Session History
        </h1>
        <p className="text-slate-400 mt-2">Review your past conversations and track your emotional journey.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-16 text-center">
          <Archive className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold mb-2 text-slate-300">No chat sessions yet</h3>
          <p className="text-slate-500">Your conversations will appear here once you've had a session.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const otherUser = user.role === 'Seeker'
              ? session.listener_id
              : session.seeker_id;
            const isActive = session.status === 'Active';

            return (
              <div
                key={session._id}
                className={`bg-white/5 border rounded-2xl p-6 transition-all hover:bg-white/10 ${
                  isActive ? 'border-accent-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-tr from-accent-500 to-primary-500'
                        : 'bg-slate-700'
                    }`}>
                      <User className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {otherUser?.nickname || (user.role === 'Seeker' ? 'Anonymous Listener' : 'Anonymous Seeker')}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {session.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(session.createdAt).toLocaleDateString()} • {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isActive && (
                      <button
                        onClick={() => handleCloseSession(session._id)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-medium transition-all"
                      >
                        End Session
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/chat/${session._id}`)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                        isActive
                          ? 'bg-accent-600 hover:bg-accent-500 text-white'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {isActive ? 'Continue' : 'View'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
