
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  LogIn, 
  LogOut,
  Power,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { ClockType, ClockEntry, VacationRequest, ViewType, UserState } from './types';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Reports from './components/Reports';
import LoginScreen from './components/LoginScreen';
import SettingsView from './components/SettingsView';
import VacationAdmin from './components/VacationAdmin';
import { syncToSheets, fetchVacations } from './sheetsService';
import { WAREHOUSE_COORDS, GEOFENCE_RADIUS_METERS } from './constants';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // Metres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserState>({ 
    employeeCode: null, 
    employeeName: null, 
    isAuthenticated: false, 
    sheetsUrl: '',
    isAdmin: false
  });
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [allEntries, setAllEntries] = useState<ClockEntry[]>([]);
  const [allVacations, setAllVacations] = useState<VacationRequest[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [rescueMessage, setRescueMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('horaripro_entries');
    const savedVacations = localStorage.getItem('horaripro_vacations');
    const savedSession = localStorage.getItem('horaripro_session');
    const savedSheetsUrl = localStorage.getItem('horaripro_sheets_url');

    if (savedEntries) setAllEntries(JSON.parse(savedEntries));
    if (savedVacations) setAllVacations(JSON.parse(savedVacations));
    
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setUser({ ...session, sheetsUrl: savedSheetsUrl || '' });
    } else if (savedSheetsUrl) {
      setUser(prev => ({ ...prev, sheetsUrl: savedSheetsUrl }));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('horaripro_entries', JSON.stringify(allEntries));
    localStorage.setItem('horaripro_vacations', JSON.stringify(allVacations));
    
    if (user.employeeCode && user.isAuthenticated) {
      const { sheetsUrl, ...sessionToSave } = user;
      localStorage.setItem('horaripro_session', JSON.stringify(sessionToSave));
    }

    if (user.sheetsUrl) {
      localStorage.setItem('horaripro_sheets_url', user.sheetsUrl);
    }
  }, [allEntries, allVacations, user]);

  useEffect(() => {
    if (user.employeeCode && allEntries.length > 0) {
      const userEntries = allEntries.filter(e => e.employeeCode === user.employeeCode);
      const lastEntry = userEntries[userEntries.length - 1];
      
      if (lastEntry && lastEntry.type === ClockType.IN) {
        const lastDate = new Date(lastEntry.timestamp).setHours(0,0,0,0);
        const todayDate = new Date().setHours(0,0,0,0);
        
        if (lastDate < todayDate) {
          // Rescat automàtic
          const rescueDate = new Date(lastEntry.timestamp);
          rescueDate.setHours(15, 30, 0, 0);
          
          const rescueEntry: ClockEntry = {
            id: crypto.randomUUID(),
            employeeCode: user.employeeCode,
            employeeName: user.employeeName || 'Desconegut',
            type: ClockType.OUT,
            timestamp: rescueDate.getTime(),
            syncStatus: 'Pendent',
            locationName: 'RESCAT AUTOMÀTIC'
          };
          
          setAllEntries(prev => [...prev, rescueEntry]);
          setRescueMessage(`S'ha tancat automàticament la sessió d'ahir a les 15:30 (Rescat Automàtic).`);
          
          if (user.sheetsUrl) {
            syncToSheets(rescueEntry, user.sheetsUrl).then(success => {
              if (success) {
                setAllEntries(prev => prev.map(e => e.id === rescueEntry.id ? { ...e, syncStatus: 'Sincronitzat' } : e));
              }
            });
          }
        }
      }
    }
  }, [user.employeeCode, user.isAuthenticated]);

  useEffect(() => {
    if (user.employeeCode) {
      const entries = allEntries.filter(e => e.employeeCode === user.employeeCode);
      setIsClockedIn(entries.length > 0 && entries[entries.length - 1].type === ClockType.IN);
    }
  }, [allEntries, user.employeeCode]);

  const handleLogin = (code: string, name?: string) => {
    const isAdmin = code === '9999';
    setUser(prev => ({ 
      ...prev, 
      employeeCode: prev.employeeCode || code,
      employeeName: name || prev.employeeName, 
      isAuthenticated: true,
      isAdmin: isAdmin || prev.isAdmin
    }));
  };

  const handleLogout = () => {
    const newState = { ...user, isAuthenticated: false };
    setUser(newState);
    localStorage.setItem('horaripro_session', JSON.stringify(newState));
  };

  const handleResetProfile = () => {
    if (window.confirm("ATENCIÓ: Vols esborrar totes les dades d'aquest mòbil? Hauràs de tornar a introduir el teu nom per identificar-te.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUpdateSheetsUrl = (url: string) => {
    setUser(prev => ({ ...prev, sheetsUrl: url }));
    localStorage.setItem('horaripro_sheets_url', url);
  };

  const handleSyncPending = async () => {
    if (!user.sheetsUrl) {
      alert("Configura la URL de l'Excel a la secció de Configuració.");
      return;
    }

    const pendingEntries = allEntries.filter(e => e.syncStatus !== 'Sincronitzat' && e.employeeCode === user.employeeCode);
    if (pendingEntries.length === 0) return;

    let updatedEntries = [...allEntries];
    let count = 0;

    for (const entry of pendingEntries) {
      const success = await syncToSheets(entry, user.sheetsUrl);
      if (success) {
        updatedEntries = updatedEntries.map(e => e.id === entry.id ? { ...e, syncStatus: 'Sincronitzat' } : e);
        count++;
      }
    }
    
    setAllEntries(updatedEntries);
    if (count > 0) {
      alert(`S'han sincronitzat ${count} registres.`);
    }
  };

  const handleClockAction = async () => {
    if (!user.employeeCode || !user.employeeName) return;
    const newType = isClockedIn ? ClockType.OUT : ClockType.IN;
    const newEntry: ClockEntry = {
      id: crypto.randomUUID(),
      employeeCode: user.employeeCode,
      employeeName: user.employeeName,
      type: newType,
      timestamp: Date.now(),
      syncStatus: 'Pendent'
    };

    // Actualitzem l'estat local immediatament per a una resposta instantània
    setAllEntries(prev => [...prev, newEntry]);
    setIsClockedIn(newType === ClockType.IN);

    const updateWithGeo = (pos?: GeolocationPosition) => {
      if (pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = calculateDistance(lat, lng, WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng);
        
        const updatedEntry = { 
          ...newEntry, 
          location: { lat, lng },
          locationName: dist <= GEOFENCE_RADIUS_METERS ? 'MAGATZEM' : undefined
        };
        setAllEntries(prev => prev.map(e => e.id === newEntry.id ? updatedEntry : e));
        
        if (user.sheetsUrl) {
          syncToSheets(updatedEntry, user.sheetsUrl).then(success => {
            if (success) {
              setAllEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, syncStatus: 'Sincronitzat' } : e));
            }
          });
        }
      } else if (user.sheetsUrl) {
        syncToSheets(newEntry, user.sheetsUrl).then(success => {
          if (success) {
            setAllEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, syncStatus: 'Sincronitzat' } : e));
          }
        });
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateWithGeo(pos), 
        (err) => updateWithGeo(),
        { timeout: 5000 } // Posem un timeout per no esperar eternament
      );
    } else {
      updateWithGeo();
    }
  };

  const addVacation = (vac: Omit<VacationRequest, 'id' | 'status' | 'employeeCode' | 'employeeName'>) => {
    const newVac: VacationRequest = {
      ...vac,
      id: crypto.randomUUID(),
      employeeCode: user.employeeCode || '0000',
      employeeName: user.employeeName || 'Desconegut',
      status: 'Pendent'
    };
    setAllVacations(prev => [...prev, newVac]);
    
    if (user.sheetsUrl) {
      syncToSheets(newVac, user.sheetsUrl).then(success => {
        if (success) {
          console.log("Vacances sincronitzades correctament");
        }
      });
    }
  };

  const updateVacationStatus = async (id: string, status: 'Aprovada' | 'Denegada') => {
    const vacation = allVacations.find(v => v.id === id);
    if (!vacation) return;

    const updatedVacation = { ...vacation, status };
    setAllVacations(prev => prev.map(v => v.id === id ? updatedVacation : v));

    if (user.sheetsUrl) {
      const success = await syncToSheets({ ...updatedVacation, action: 'updateStatus' } as any, user.sheetsUrl);
      if (success) {
        console.log("Estat de vacances actualitzat a Sheets");
        // Després d'actualitzar, forcem un refresh per assegurar que tenim la versió del servidor
        await refreshVacations();
      }
    }
  };

  const refreshVacations = async () => {
    if (!user.sheetsUrl) return;
    const remoteVacations = await fetchVacations(user.sheetsUrl);
    if (remoteVacations.length > 0) {
      setAllVacations(remoteVacations);
    }
  };

  useEffect(() => {
    if (user.isAuthenticated && user.sheetsUrl) {
      refreshVacations();
    }
  }, [user.isAuthenticated, user.sheetsUrl, activeView]);

  const pendingCount = allEntries.filter(e => e.syncStatus !== 'Sincronitzat' && e.employeeCode === user.employeeCode).length;

  if (!user.isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} savedName={user.employeeName} savedCode={user.employeeCode} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 pb-20 md:pb-0">
      <nav className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-4 flex md:flex-col gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 mb-0 md:mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Clock size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">HorariPro</h1>
        </div>

        <div className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<BarChart3 size={20} />} label="Inici" />
          <NavItem active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<CalendarIcon size={20} />} label="Calendari i Permisos" />
          {user.isAdmin && <NavItem active={activeView === 'admin'} onClick={() => setActiveView('admin')} icon={<ShieldCheck size={20} />} label="Administració" />}
          <NavItem active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={20} />} label="Configuració" />
        </div>

        <div className="hidden md:flex flex-col mt-auto gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-indigo-50 rounded-xl">
             <p className="text-[10px] font-bold text-indigo-700 uppercase truncate">{user.employeeName}</p>
             <p className="text-[10px] text-slate-500">
                {pendingCount > 0 ? `${pendingCount} pendents` : 'Sincronitzat'}
             </p>
          </div>
          <button onClick={handleClockAction} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${isClockedIn ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-indigo-600 text-white shadow-indigo-100 shadow-lg'}`}>
            {isClockedIn ? <LogOut size={18} /> : <LogIn size={18} />}
            {isClockedIn ? 'Sortida' : 'Entrada'}
          </button>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-rose-500 flex items-center justify-center gap-2 transition-colors py-2">
            <Power size={14} /> Tancar Sessió
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeView === 'dashboard' && (
            <Dashboard 
              entries={allEntries.filter(e => e.employeeCode === user.employeeCode)} 
              isClockedIn={isClockedIn} 
              onClockAction={handleClockAction} 
              onSyncPending={handleSyncPending}
              isAdmin={user.isAdmin || false}
              rescueMessage={rescueMessage}
              onClearRescueMessage={() => setRescueMessage(null)}
            />
          )}
          {activeView === 'calendar' && (
            <CalendarView 
              vacations={allVacations} 
              currentUserId={user.employeeCode || ''} 
              onAddVacation={addVacation} 
              onRefresh={refreshVacations}
            />
          )}
          {activeView === 'admin' && <VacationAdmin vacations={allVacations} onUpdateStatus={updateVacationStatus} onRefresh={refreshVacations} />}
          {activeView === 'settings' && (
            <SettingsView 
              sheetsUrl={user.sheetsUrl || ''} 
              onUpdateUrl={handleUpdateSheetsUrl} 
              onResetProfile={handleResetProfile} 
              onClearHistory={() => setAllEntries([])} 
              employeeName={user.employeeName || ''}
              isAdmin={user.isAdmin || false}
              installPrompt={deferredPrompt}
              onInstall={async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') setDeferredPrompt(null);
                }
              }}
            />
          )}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button 
          onClick={handleClockAction} 
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isClockedIn ? 'bg-rose-500 text-white ring-4 ring-rose-100' : 'bg-indigo-600 text-white ring-4 ring-indigo-100'}`}
        >
          {isClockedIn ? <LogOut size={28} /> : <Fingerprint size={28} />}
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
    {icon} <span>{label}</span>
  </button>
);

export default App;
