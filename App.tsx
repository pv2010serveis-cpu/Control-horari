
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  BarChart3
} from 'lucide-react';
import TimeTracker from './components/TimeTracker';
import CalendarView from './components/CalendarView';
import AdminView from './components/AdminView';
import Reports from './components/Reports';
import Auth from './components/Auth';
import { TimeEntry, VacationRequest, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'reports' | 'admin'>('dashboard');
  
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('horacerta_entries');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('horacerta_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [vacations, setVacations] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('horacerta_vacations');
    if (saved) return JSON.parse(saved).map((v: any) => ({ ...v, startDate: new Date(v.startDate), endDate: new Date(v.endDate) }));

    return [
      { id: 'h1', userId: 'system', userName: 'Cap d\'Any', startDate: new Date(2026, 0, 1), endDate: new Date(2026, 0, 1), status: 'APPROVED' },
      { id: 'h2', userId: 'system', userName: 'Reis', startDate: new Date(2026, 0, 6), endDate: new Date(2026, 0, 6), status: 'APPROVED' },
      { id: 'h3', userId: 'system', userName: 'Divendres Sant', startDate: new Date(2026, 3, 3), endDate: new Date(2026, 3, 3), status: 'APPROVED' },
      { id: 'h4', userId: 'system', userName: 'Dilluns de Pasqua', startDate: new Date(2026, 3, 6), endDate: new Date(2026, 3, 6), status: 'APPROVED' },
      { id: 'h5', userId: 'system', userName: 'Festa del Treball', startDate: new Date(2026, 4, 1), endDate: new Date(2026, 4, 1), status: 'APPROVED' },
      { id: 'h6', userId: 'system', userName: 'Sant Joan', startDate: new Date(2026, 5, 24), endDate: new Date(2026, 5, 24), status: 'APPROVED' },
      { id: 'h7', userId: 'system', userName: 'Assumpció', startDate: new Date(2026, 7, 15), endDate: new Date(2026, 7, 15), status: 'APPROVED' },
      { id: 'h8', userId: 'system', userName: 'Diada de Catalunya', startDate: new Date(2026, 8, 11), endDate: new Date(2026, 8, 11), status: 'APPROVED' },
      { id: 'h9', userId: 'system', userName: 'Festa Nacional', startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 12), status: 'APPROVED' },
      { id: 'h10', userId: 'system', userName: 'Immaculada', startDate: new Date(2026, 11, 8), endDate: new Date(2026, 11, 8), status: 'APPROVED' },
      { id: 'h11', userId: 'system', userName: 'Nadal', startDate: new Date(2026, 11, 25), endDate: new Date(2026, 11, 25), status: 'APPROVED' },
      { id: 'h12', userId: 'system', userName: 'Sant Esteve', startDate: new Date(2026, 11, 26), endDate: new Date(2026, 11, 26), status: 'APPROVED' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('horacerta_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('horacerta_vacations', JSON.stringify(vacations));
  }, [vacations]);

  useEffect(() => {
    const session = localStorage.getItem('horacerta_session');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    const updatedUsers = JSON.parse(localStorage.getItem('horacerta_users') || '[]');
    setUsers(updatedUsers);
    localStorage.setItem('horacerta_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('horacerta_session');
  };

  const addEntry = (entry: TimeEntry) => {
    setEntries([entry, ...entries]);
  };

  const handleRequestVacation = (start: Date, end: Date) => {
    if (!currentUser) return;
    const newReq: VacationRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      startDate: start,
      endDate: end,
      status: 'PENDING'
    };
    setVacations([...vacations, newReq]);
  };

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setVacations(vacations.map(v => v.id === id ? { ...v, status } : v));
  };

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  const userEntries = entries.filter(e => e.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shadow-sm z-20">
        <div className="p-8 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Clock size={24} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight leading-none">CONTROL<br/>HORARI</span>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={22} /> Inici
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <CalendarIcon size={22} /> Calendari
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BarChart3 size={22} /> Informes
          </button>
          {currentUser.role === 'ADMIN' && (
            <div className="pt-6 border-t border-slate-50 mt-4">
              <p className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gestió</p>
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <ShieldCheck size={22} /> Administració
              </button>
            </div>
          )}
        </nav>
        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate text-slate-800">{currentUser.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 font-bold hover:underline">TANCAR SESSIÓ</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 pb-6 flex justify-around items-center z-50 shadow-lg rounded-t-[2.5rem]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase">Inici</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <CalendarIcon size={24} />
          <span className="text-[10px] font-bold uppercase">Cal</span>
        </button>
        {currentUser.role === 'ADMIN' && (
          <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'admin' ? 'text-amber-600' : 'text-slate-400'}`}>
            <ShieldCheck size={24} />
            <span className="text-[10px] font-bold uppercase">Admin</span>
          </button>
        )}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-rose-400">
          <LogOut size={24} />
          <span className="text-[10px] font-bold uppercase">Surt</span>
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <TimeTracker userId={currentUser.id} userName={currentUser.name} entries={entries} onAddEntry={addEntry} />}
          {activeTab === 'calendar' && <CalendarView userId={currentUser.id} vacations={vacations} onRequest={handleRequestVacation} />}
          {activeTab === 'reports' && <Reports entries={userEntries} />}
          {activeTab === 'admin' && currentUser.role === 'ADMIN' && <AdminView vacations={vacations} allEntries={entries} users={users} onUpdate={handleUpdateStatus} />}
        </div>
      </main>
    </div>
  );
};

export default App;
