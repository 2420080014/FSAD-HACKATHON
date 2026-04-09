import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Send, CheckCircle, XCircle, Wifi, WifiOff, Inbox, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Seeker State
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Listener State
  const [requests, setRequests] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect Socket
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register_user', { userId: user.id, role: user.role });
    });

    if (user.role === 'Listener') {
      newSocket.on('incoming_request', (req) => {
        setRequests(prev => {
          // Avoid duplicates
          if (prev.find(r => r._id === req._id)) return prev;
          return [req, ...prev];
        });
      });
    }

    newSocket.on('request_accepted', (data) => {
      navigate(`/chat/${data.room_id}`);
    });

    return () => newSocket.close();
  }, [user, navigate]);

  useEffect(() => {
    if (user.role === 'Seeker') {
      fetchPosts();
    }
  }, [user.role]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/posts', { content: newPost });
      setPosts([res.data, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestChat = () => {
    if (socket) {
      socket.emit('send_request', { seeker_id: user.id });
      setRequestSent(true);
      setTimeout(() => setRequestSent(false), 5000);
    }
  };

  const handleAcceptRequest = (requestId) => {
    if (socket) {
      socket.emit('accept_request', { request_id: requestId, listener_id: user.id });
      setRequests(requests.filter(r => r._id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(requests.filter(r => r._id !== requestId));
  };

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (socket) {
      socket.emit('toggle_online', { userId: user.id, isOnline: newStatus });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold">Welcome, {user.nickname}</h1>
        <p className="text-slate-400">Your secure space to {user.role === 'Seeker' ? 'share and seek support' : 'listen and help others'}.</p>
      </div>

      {user.role === 'Seeker' && (
        <div className="space-y-8">
          {/* Create Post */}
          <form onSubmit={handleCreatePost} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><PenSquare className="w-5 h-5 text-accent-500" /> Share what's on your mind</h2>
            <textarea
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-accent-500 focus:outline-none min-h-[120px] resize-none"
              placeholder="It's completely anonymous..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button disabled={!newPost.trim()} className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95">
                <Send className="w-4 h-4"/> Post
              </button>
            </div>
          </form>

          {/* Connect Button */}
          <div className="bg-gradient-to-r from-primary-600/20 to-accent-500/20 border border-white/10 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent-500" /> Need someone to talk to?</h3>
              <p className="text-slate-400 text-sm mt-1">Connect with an available listener for a private, anonymous chat.</p>
            </div>
            <button
              onClick={handleRequestChat}
              disabled={requestSent}
              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 ${
                requestSent
                  ? 'bg-green-600/80 text-white cursor-default'
                  : 'bg-primary-600 hover:bg-primary-500 text-white'
              }`}
            >
              {requestSent ? '✓ Request Sent' : 'Connect with a Listener'}
            </button>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Community Support Feed</h2>
            {posts.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center text-slate-400">
                <PenSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet. Be the first to share.</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                        {post.author?.nickname?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{post.author?.nickname || 'Anonymous'}</h3>
                        <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {user.role === 'Listener' && (
        <div className="space-y-6">
          {/* Availability Toggle */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-4">
              {isOnline ? (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-green-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {isOnline ? 'You\'re Available' : 'You\'re Offline'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isOnline ? 'Seekers can now send you chat requests.' : 'Toggle online to start receiving requests.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleOnline}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${isOnline ? 'left-9' : 'left-1'}`} />
            </button>
          </div>

          <h2 className="text-xl font-semibold">Incoming Chat Requests</h2>
          {requests.length === 0 ? (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center">
              <Inbox className="w-12 h-12 mb-4 opacity-50" />
              <p>No active requests right now.</p>
              <p className="text-sm mt-2">Check back later or wait for notifications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div key={req._id || req.seeker_id} className="bg-white/5 border border-accent-500/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/10 rounded-bl-full blur-2xl"></div>
                  <h3 className="font-semibold text-lg mb-1">
                    {req.seeker_id?.nickname || 'Anonymous Seeker'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Requested a support chat session.</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleAcceptRequest(req._id)} className="flex-1 bg-accent-600 hover:bg-accent-500 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleDeclineRequest(req._id)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-all">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === 'Admin' && (
        <div className="bg-primary-900/40 border border-primary-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Admin View</h2>
          <p className="text-slate-400">Head over to the Moderation tab to manage users and reports.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
