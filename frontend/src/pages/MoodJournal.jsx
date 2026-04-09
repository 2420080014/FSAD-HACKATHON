import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Smile, Frown, Meh, Activity, TrendingDown, TrendingUp, Minus } from 'lucide-react';

const questions = [
  "How often have you felt down, depressed or hopeless this week?",
  "How often have you had little interest or pleasure in doing things?",
  "How often have you felt nervous, anxious or on edge?",
  "How often have you not been able to stop or control worrying?",
  "How often have you felt lonely or isolated?",
  "How often have you had trouble falling or staying asleep?",
  "How often have you felt tired or had little energy?",
  "How often have you had poor appetite or been overeating?",
  "How often have you had trouble concentrating on things?",
  "How often have you felt bad about yourself or that you are a failure?",
];

const MoodJournal = () => {
  const { user } = useAuth();
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/moods/profile');
      setMoods(res.data.mood_history || []);
      setQuizScore(res.data.stress_score);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogMood = async (moodType) => {
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/moods/log', { mood: moodType });
      setMoods(res.data.mood_history);
      setSelectedMood(moodType);
      setTimeout(() => setSelectedMood(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate score out of 100
      const maxScore = questions.length * 3;
      const total = newAnswers.reduce((a, b) => a + b, 0);
      const scorePercentage = Math.round((total / maxScore) * 100);

      submitScore(scorePercentage);
    }
  };

  const submitScore = async (score) => {
    try {
      await axios.post('http://127.0.0.1:5000/api/moods/stress-score', { score });
      setQuizScore(score);
      setShowQuiz(false);
      setAnswers([]);
      setCurrentQuestion(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskCategory = (score) => {
    if (score < 30) return { label: 'Low Stress', color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingDown };
    if (score < 70) return { label: 'Moderate Stress', color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Minus };
    return { label: 'High Stress — Please consider reaching out', color: 'text-red-500', bg: 'bg-red-500/10', icon: TrendingUp };
  };

  // Mood trend mini-chart
  const recentMoods = [...moods].reverse().slice(0, 7).reverse();
  const moodToValue = { 'Happy': 3, 'Neutral': 2, 'Sad': 1, 'Stressed': 0 };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Your Emotional Journey</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Mood Logger */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-semibold mb-6">Daily Check-In</h2>
          <p className="text-slate-400 mb-6 text-sm">How are you feeling today?</p>

          <div className="flex gap-4">
            <button onClick={() => handleLogMood('Happy')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-accent-500 border border-transparent transition-all hover:-translate-y-1">
              <Smile className="w-10 h-10 text-green-400" />
              <span className="text-sm font-medium">Good</span>
            </button>
            <button onClick={() => handleLogMood('Neutral')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-accent-500 border border-transparent transition-all hover:-translate-y-1">
              <Meh className="w-10 h-10 text-yellow-400" />
              <span className="text-sm font-medium">Okay</span>
            </button>
            <button onClick={() => handleLogMood('Sad')} className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-accent-500 border border-transparent transition-all hover:-translate-y-1">
              <Frown className="w-10 h-10 text-red-400" />
              <span className="text-sm font-medium">Struggling</span>
            </button>
          </div>
          {selectedMood && <p className="text-green-400 text-sm mt-4 text-center animate-pulse">Mood logged successfully!</p>}
        </div>

        {/* Stress Score Widget */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-between">
          <div>
             <h2 className="text-xl font-semibold mb-2">Self-Assessment</h2>
             <p className="text-slate-400 text-sm mb-6">10-question stress evaluation based on PHQ standards.</p>
             {quizScore !== null && quizScore !== undefined && !showQuiz ? (
                <div className={`p-5 rounded-2xl border flex items-center justify-between ${getRiskCategory(quizScore).bg} border-white/5`}>
                   <div>
                      <p className="text-3xl font-bold">{quizScore}%</p>
                      <p className={`font-semibold text-sm mt-1 ${getRiskCategory(quizScore).color}`}>{getRiskCategory(quizScore).label}</p>
                   </div>
                   {React.createElement(getRiskCategory(quizScore).icon, {
                     className: `w-10 h-10 ${getRiskCategory(quizScore).color} opacity-50`
                   })}
                </div>
             ) : (
                <div className="p-5 bg-white/5 rounded-2xl text-center text-slate-400">
                    No active score. Take the 10-question test below.
                </div>
             )}
          </div>
          <button
             onClick={() => { setShowQuiz(true); setAnswers([]); setCurrentQuestion(0); }}
             className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg mt-6"
          >
            {quizScore !== null && !showQuiz ? 'Retake Assessment' : 'Start Assessment'}
          </button>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl"></div>

               {/* Progress Bar */}
               <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
                 <div
                   className="bg-accent-500 h-1.5 rounded-full transition-all duration-500"
                   style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                 />
               </div>

               <div className="mb-8">
                  <p className="text-accent-500 font-semibold mb-2 text-sm uppercase tracking-wider">Question {currentQuestion + 1} of {questions.length}</p>
                  <h3 className="text-2xl font-semibold leading-tight">{questions[currentQuestion]}</h3>
               </div>
               <div className="space-y-3">
                  {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((opt, idx) => (
                     <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className="w-full text-left px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-accent-500/20 hover:border-accent-500/50 transition-all font-medium"
                     >
                        {opt}
                     </button>
                  ))}
               </div>
               <button onClick={() => setShowQuiz(false)} className="mt-8 text-sm text-slate-500 hover:text-slate-300 mx-auto block">Cancel Assessment</button>
            </div>
         </div>
      )}

      {/* Mood Trend Visualization */}
      {recentMoods.length > 1 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">7-Day Mood Trend</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-end justify-between gap-2 h-32">
              {recentMoods.map((m, i) => {
                const val = moodToValue[m.mood] || 1;
                const height = (val / 3) * 100;
                const colors = {
                  'Happy': 'bg-green-500',
                  'Neutral': 'bg-yellow-500',
                  'Sad': 'bg-red-500',
                  'Stressed': 'bg-orange-500',
                };
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${colors[m.mood] || 'bg-slate-600'}`}
                      style={{ height: `${Math.max(height, 15)}%` }}
                    />
                    <span className="text-[10px] text-slate-500">
                      {new Date(m.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>Good</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>Okay</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Struggling</span>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div>
         <h2 className="text-xl font-semibold mb-6">Recent History</h2>
         {moods.length === 0 ? (
            <p className="text-slate-500 italic">No mood recorded yet. Check-in to see your history here.</p>
         ) : (
            <div className="space-y-3">
               {[...moods].reverse().slice(0, 10).map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-3">
                        {m.mood === 'Happy' && <Smile className="text-green-500 w-6 h-6"/>}
                        {m.mood === 'Sad' && <Frown className="text-red-500 w-6 h-6"/>}
                        {m.mood === 'Neutral' && <Meh className="text-yellow-500 w-6 h-6"/>}
                        {m.mood === 'Stressed' && <Activity className="text-orange-500 w-6 h-6"/>}
                        <span className="font-semibold">{m.mood}</span>
                     </div>
                     <span className="text-sm text-slate-400">{new Date(m.date).toLocaleString()}</span>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};

export default MoodJournal;
