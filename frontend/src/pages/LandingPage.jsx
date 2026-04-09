import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Shield, Activity, User, Lock, Loader2 } from 'lucide-react';

const LandingPage = () => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Seeker');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-accent-500 w-12 h-12"/></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    let res;
    if (isLogin) {
      res = await login(nickname, password);
    } else {
      res = await register(nickname, password, role);
    }
    setSubmitLoading(false);
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Elemets */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center mb-10 z-10">
        <Heart className="w-16 h-16 mx-auto mb-4 text-accent-500" />
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">True Companion</h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          A secure, anonymous peer-to-peer emotional support ecosystem.
        </p>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-2 font-medium transition-all ${isLogin ? 'text-accent-500 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-2 font-medium transition-all ${!isLogin ? 'text-accent-500 border-b-2 border-accent-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">{error}</div>}
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Anonymous Nickname"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all placeholder:text-slate-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-xl border flex flex-col items-center p-4 transition-all ${role === 'Seeker' ? 'border-accent-500 bg-accent-500/10 text-accent-500' : 'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5'}`}>
                <input type="radio" name="role" value="Seeker" checked={role === 'Seeker'} onChange={() => setRole('Seeker')} className="sr-only" />
                <Activity className="w-6 h-6 mb-2" />
                <span className="font-medium">Need Support</span>
              </label>
              <label className={`cursor-pointer rounded-xl border flex flex-col items-center p-4 transition-all ${role === 'Listener' ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-white/10 bg-black/20 text-slate-400 hover:bg-white/5'}`}>
                <input type="radio" name="role" value="Listener" checked={role === 'Listener'} onChange={() => setRole('Listener')} className="sr-only" />
                <Shield className="w-6 h-6 mb-2" />
                <span className="font-medium">Be a Listener</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-gradient-to-r from-accent-500 to-primary-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {submitLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : (isLogin ? 'Enter Platform' : 'Join Anonymously')}
          </button>
        </form>
      </div>

      <div className="absolute bottom-6 text-slate-500 text-sm flex gap-6">
        <span>100% Anonymous</span>
        <span>Secure Handshake</span>
      </div>
    </div>
  );
};

export default LandingPage;
