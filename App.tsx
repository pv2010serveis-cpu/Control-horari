
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
    const saved = localStorage.getItem('horari_entries');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('horari_users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [vacations, setVacations] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('horari_vacations');
    if (saved) return JSON.parse(saved).map((v: any) => ({ ...v, startDate: new Date(v.startDate), endDate: new Date(v.endDate) }));
    
    // Festius 2026 segons Calendari Construcció Tarragona (UGT)
    const holidays: VacationRequest[] = [
      // Festius Oficials (Vermells)
      { id: 'h1', userId: 'system', userName: 'Any nou', startDate: new Date(2026, 0, 1), endDate: new Date(2026, 0, 1), status: 'APPROVED' },
      { id: 'h2', userId: 'system', userName: 'Reis', startDate: new Date(2026, 0, 6), endDate: new Date(2026, 0, 6), status: 'APPROVED' },
      { id: 'h3', userId: 'system', userName: 'Divendres Sant', startDate: new Date(2026, 3, 3), endDate: new Date(2026, 3, 3), status: 'APPROVED' },
      { id: 'h4', userId: 'system', userName: 'Dilluns de Pasqua', startDate: new Date(2026, 3, 6), endDate: new Date(2026, 3, 6), status: 'APPROVED' },
      { id: 'h5', userId: 'system', userName: 'Festa del Treball', startDate: new Date(2026, 4, 1), endDate: new Date(2026, 4, 1), status: 'APPROVED' },
      { id: 'h6', userId: 'system', userName: 'Sant Joan', startDate: new Date(2026, 5, 24), endDate: new Date(2026, 5, 24), status: 'APPROVED' },
      { id: 'h7', userId: 'system', userName: 'Assumpció', startDate: new Date(2026, 7, 15), endDate: new Date(2026, 7, 15), status: 'APPROVED' },
      { id: 'h8', userId: 'system', userName: 'Diada de Catalunya', startDate: new Date(2026, 8, 11), endDate: new Date(2026, 8, 11), status: 'APPROVED' },
      { id: 'h9', userId: 'system', userName: 'Dia Hispanitat', startDate: new Date(2026, 9, 12), endDate: new Date(2026, 9, 12), status: 'APPROVED' },
      { id: 'h10', userId: 'system', userName: 'Immaculada', startDate: new Date(2026, 11, 8), endDate: new Date(2026, 11, 8), status: 'APPROVED' },
      { id: 'h11', userId: 'system', userName: 'Nadal', startDate: new Date(2026, 11, 25), endDate: new Date(2026, 11, 25), status: 'APPROVED' },
      { id: 'h12', userId: 'system', userName: 'Sant Esteve', startDate: new Date(2026, 11, 26), endDate: new Date(2026, 11, 26), status: 'APPROVED' },

      // Festes Conveni (Grocs)
      { id: 'c1', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 0, 2), endDate: new Date(2026, 0, 2), status: 'APPROVED' },
      { id: 'c2', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 0, 5), endDate: new Date(2026, 0, 5), status: 'APPROVED' },
      { id: 'c3', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 3, 2), endDate: new Date(2026, 3, 2), status: 'APPROVED' },
      { id: 'c4', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 4, 22), endDate: new Date(2026, 4, 22), status: 'APPROVED' },
      { id: 'c5', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 11, 7), endDate: new Date(2026, 11, 7), status: 'APPROVED' },
      { id: 'c6', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 11, 24), endDate: new Date(2026, 11, 24), status: 'APPROVED' },
      { id: 'c7', userId: 'conveni', userName: 'Festa Conveni', startDate: new Date(2026, 11, 31), endDate: new Date(2026, 11, 31), status: 'APPROVED' }
    ];
    return holidays;
  });

  useEffect(() => {
    localStorage.setItem('horari_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('horari_vacations', JSON.stringify(vacations));
  }, [vacations]);

  useEffect(() => {
    localStorage.setItem('horari_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    const session = localStorage.getItem('horari_session');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('horari_session', JSON.stringify(user));
    const savedUsers = JSON.parse(localStorage.getItem('horari_users') || '[]');
    setUsers(savedUsers);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('horari_session');
  };

  if (!currentUser) return <Auth onLogin={handleLogin} onUserCreated={(u) => setUsers(prev => [...prev, u])} />;

  const userEntries = entries.filter(e => e.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col md:flex-row pb-24 md:pb-0">
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Clock size={20} />
          </div>
          <span className="font-bold text-slate-800 tracking-tight leading-none text-lg uppercase">CONTROL<br/>HORARI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Inici
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <CalendarIcon size={18} /> Calendari
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BarChart3 size={18} /> Informes
          </button>
          
          {currentUser.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-slate-50">
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <ShieldCheck size={18} /> Administració
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-slate-800">{currentUser.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-rose-500 font-medium hover:underline">Sortir</button>
            </div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200/50 px-6 py-3 rounded-full flex gap-8 items-center z-50 shadow-xl">
        <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={22} />
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`${activeTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <CalendarIcon size={22} />
        </button>
        {currentUser.role === 'ADMIN' && (
          <button onClick={() => setActiveTab('admin')} className={`${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <ShieldCheck size={22} />
          </button>
        )}
        <button onClick={handleLogout} className="text-rose-400">
          <LogOut size={22} />
        </button>
      </nav>

      <main className="flex-1 px-4 py-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <TimeTracker user={currentUser} entries={entries} onAddEntry={(e) => setEntries([e, ...entries])} />}
          {activeTab === 'calendar' && <CalendarView userId={currentUser.id} vacations={vacations} onRequest={(s,e) => setVacations([...vacations, {id: Math.random().toString(36).substr(2,9), userId: currentUser.id, userName: currentUser.name, startDate: s, endDate: e, status: 'PENDING'}])} />}
          {activeTab === 'reports' && <Reports entries={userEntries} />}
          {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
            <AdminView vacations={vacations} allEntries={entries} users={users} onUpdate={(id, status) => setVacations(vacations.map(v => v.id === id ? {...v, status} : v))} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
