import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Trash2, CheckCircle, RefreshCw, BarChart3, MessageSquare, UserCheck, UserX, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/admin/stats'),
        axios.get('http://127.0.0.1:5000/api/admin/reports'),
        axios.get('http://127.0.0.1:5000/api/admin/users'),
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
    setLoading(false);
  };

  const handleDeactivate = async (userId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/users/${userId}/deactivate`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/users/${userId}/activate`);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: true } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/reports/${reportId}`, { status: 'Resolved' });
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'Resolved' } : r));
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
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8 border-b border-red-500/20 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-red-500">
            <ShieldAlert className="w-8 h-8"/> Moderation Hub
          </h1>
          <p className="text-slate-400 mt-2">Oversee reports and manage user access to maintain a safe environment.</p>
        </div>
        <button onClick={fetchAll} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-semibold text-sm">Pending Reports</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">{stats?.pendingReports || 0}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-5 h-5 text-green-400" />
            <h3 className="text-green-400 font-semibold text-sm">Active Listeners</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">{stats?.activeListeners || 0}</p>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            <h3 className="text-primary-400 font-semibold text-sm">Active Chats</h3>
          </div>
          <p className="text-3xl font-bold text-primary-500">{stats?.activeChats || 0}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h3 className="text-slate-400 font-semibold text-sm">Total Users</h3>
          </div>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
            activeTab === 'reports'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          Reports ({reports.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
            activeTab === 'users'
              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All Users ({users.length})
        </button>
      </div>

      {/* Reports Panel */}
      {activeTab === 'reports' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> User Reports
          </h2>
          {reports.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No reports have been filed yet. The community is safe! ✨</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 px-4 font-medium text-sm">Reported User</th>
                    <th className="py-3 px-4 font-medium text-sm">Reporter</th>
                    <th className="py-3 px-4 font-medium text-sm">Reason</th>
                    <th className="py-3 px-4 font-medium text-sm">Status</th>
                    <th className="py-3 px-4 font-medium text-sm">Date</th>
                    <th className="py-3 px-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-semibold text-white">
                        {report.reported_user_id?.nickname || 'Unknown'}
                        <span className="text-xs text-slate-500 ml-2">({report.reported_user_id?.role})</span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{report.reporter_id?.nickname || 'Unknown'}</td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">{report.reason}</td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          report.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          report.status === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {report.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleResolveReport(report._id)}
                                className="bg-green-500/20 hover:bg-green-500/40 text-green-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3" /> Resolve
                              </button>
                              <button
                                onClick={() => handleDeactivate(report.reported_user_id?._id)}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Deactivate
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Panel */}
      {activeTab === 'users' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" /> Registered Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-4 font-medium text-sm">Nickname</th>
                  <th className="py-3 px-4 font-medium text-sm">Role</th>
                  <th className="py-3 px-4 font-medium text-sm">Status</th>
                  <th className="py-3 px-4 font-medium text-sm">Joined</th>
                  <th className="py-3 px-4 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          u.role === 'Seeker' ? 'bg-accent-500/20 text-accent-400' :
                          u.role === 'Listener' ? 'bg-primary-500/20 text-primary-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {u.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{u.nickname}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        u.role === 'Seeker' ? 'bg-accent-500/20 text-accent-400' :
                        u.role === 'Listener' ? 'bg-primary-500/20 text-primary-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      {u.role !== 'Admin' && (
                        u.isActive ? (
                          <button
                            onClick={() => handleDeactivate(u._id)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ml-auto"
                          >
                            <UserX className="w-3 h-3" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u._id)}
                            className="bg-green-500/20 hover:bg-green-500/40 text-green-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ml-auto"
                          >
                            <UserCheck className="w-3 h-3" /> Reactivate
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
