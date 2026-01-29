
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzPU3bc6TJecgTFH2ZsxJ-NI9WBKXrEpYpGMKlfrX6by2e06kWwRzSMA-b2-4_q8XXb/exec"; 

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'reports' | 'admin'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [holidays, setHolidays] = useState<{date: string, name: string, type: string}[]>([]);
  
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('horari_entries');
    return saved ? JSON.parse(saved).map((e: any) => ({ ...e, timestamp: new Date(e.timestamp) })) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('horari_users');
    const u = saved ? JSON.parse(saved) : [];
    if (!u.find((usr: any) => usr.pin === '9999')) {
      return [{ id: 'admin-albert', name: 'Albert', pin: '9999', role: 'ADMIN' }, ...u];
    }
    return u;
  });
  
  const [vacations, setVacations] = useState<VacationRequest[]>(() => {
    const saved = localStorage.getItem('horari_vacations');
    if (saved) return JSON.parse(saved).map((v: any) => ({ ...v, startDate: new Date(v.startDate), endDate: new Date(v.endDate) }));
    return [];
  });

  const entriesRef = useRef(entries);
  useEffect(() => { entriesRef.current = entries; }, [entries]);

  // Carregar festius des del Sheets (Full 2)
  const fetchHolidays = useCallback(async () => {
    try {
      const res = await fetch(GOOGLE_SHEETS_URL);
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (e) {
      console.error("Error carregant festius:", e);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Inicialitzar calendari segons PDF Construcció Tarragona 2026
  const setupHolidaysFromPDF = async () => {
    const pdfHolidays = [
      // Oficials (Vermell)
      { date: '2026-01-01', name: 'Any Nou', type: 'system' },
      { date: '2026-01-06', name: 'Reis', type: 'system' },
      { date: '2026-04-03', name: 'Divendres Sant', type: 'system' },
      { date: '2026-04-06', name: 'Dilluns Pasqua', type: 'system' },
      { date: '2026-05-01', name: 'Festa Treball', type: 'system' },
      { date: '2026-06-24', name: 'Sant Joan', type: 'system' },
      { date: '2026-08-15', name: 'Assumpció', type: 'system' },
      { date: '2026-09-11', name: 'Diada Nacional', type: 'system' },
      { date: '2026-10-12', name: 'Festa Nacional', type: 'system' },
      { date: '2026-12-08', name: 'Immaculada', type: 'system' },
      { date: '2026-12-25', name: 'Nadal', type: 'system' },
      { date: '2026-12-26', name: 'Sant Esteve', type: 'system' },
      // Conveni (Groc)
      { date: '2026-01-02', name: 'Conveni', type: 'conveni' },
      { date: '2026-01-05', name: 'Conveni', type: 'conveni' },
      { date: '2026-03-19', name: 'Conveni (Sant Josep)', type: 'conveni' },
      { date: '2026-12-07', name: 'Conveni', type: 'conveni' },
      { date: '2026-12-24', name: 'Conveni', type: 'conveni' },
      { date: '2026-12-31', name: 'Conveni', type: 'conveni' },
      // Vacances Sector (Blau) - De 3 a 21 d'agost
      ...Array.from({length: 19}, (_, i) => ({
        date: `2026-08-${(i+3).toString().padStart(2, '0')}`,
        name: 'Vacances Sector',
        type: 'sector'
      }))
    ];

    setIsSyncing(true);
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'SET_HOLIDAYS', holidays: pdfHolidays })
      });
      setHolidays(pdfHolidays);
      alert("Calendari 2026 inicialitzat al Full 2!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncWithSheets = useCallback(async (manualEntries?: TimeEntry[]) => {
    if (!GOOGLE_SHEETS_URL) return;
    const dataToSync = manualEntries || entriesRef.current.filter(e => !e.synced);
    if (dataToSync.length === 0) return;

    setIsSyncing(true);
    try {
      const payload = dataToSync.map(e => ({
        id: e.id,
        userName: e.userName,
        timestamp: e.timestamp.toISOString(),
        type: e.type,
        locationLabel: e.locationLabel || "Sense GPS"
      }));

      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ entries: payload })
      });

      setEntries(prev => prev.map(e => {
        if (dataToSync.find(d => d.id === e.id)) return { ...e, synced: true };
        return e;
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

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

  const handleAddEntry = (entry: TimeEntry) => {
    const newEntry = { ...entry, synced: false };
    setEntries(prev => [newEntry, ...prev]);
    setTimeout(() => syncWithSheets([newEntry]), 500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('horari_session');
    setActiveTab('dashboard');
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} onUserCreated={(u) => setUsers(prev => [...prev, u])} />;

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col md:flex-row pb-24 md:pb-0 overflow-x-hidden">
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

      <main className="flex-1 px-4 py-6 md:p-10 lg:p-12 overflow-y-auto overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <TimeTracker user={currentUser} entries={entries} onAddEntry={handleAddEntry} />}
          {activeTab === 'calendar' && <CalendarView userId={currentUser.id} vacations={vacations} holidays={holidays} onRequest={(s,e) => setVacations([...vacations, {id: Math.random().toString(36).substr(2,9), userId: currentUser.id, userName: currentUser.name, startDate: s, endDate: e, status: 'PENDING'}])} />}
          {activeTab === 'reports' && <Reports entries={entries.filter(e => e.userId === currentUser.id)} />}
          {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
            <AdminView 
              vacations={vacations} 
              allEntries={entries} 
              users={users} 
              onUpdate={(id, status) => setVacations(vacations.map(v => v.id === id ? {...v, status} : v))} 
              onSync={() => syncWithSheets()}
              onSetupHolidays={setupHolidaysFromPDF}
              isSyncing={isSyncing}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
