
import React, { useState, useEffect } from 'react';
import { Play, Square, Coffee, MapPin, Loader2, History, Timer, CheckCircle2 } from 'lucide-react';
import { TimeEntry, LocationData } from '../types';

interface TimeTrackerProps {
  userId: string;
  userName: string;
  entries: TimeEntry[];
  onAddEntry: (entry: TimeEntry) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ userId, userName, entries, onAddEntry }) => {
  const [timer, setTimer] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  
  const todayEntries = entries.filter(e => e.timestamp.toDateString() === new Date().toDateString());
  const isWorking = todayEntries.length > 0 && todayEntries[0].type === 'IN';

  useEffect(() => {
    let interval: any;
    if (isWorking && todayEntries[0]) {
      const startTime = todayEntries[0].timestamp.getTime();
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isWorking, todayEntries]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getGeolocation = (): Promise<LocationData | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          setLocating(false);
          resolve(undefined);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const handleAction = async (type: 'IN' | 'OUT') => {
    setLoading(true);
    const location = await getGeolocation();
    
    const newEntry: TimeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      timestamp: new Date(),
      type,
      location
    };
    
    onAddEntry(newEntry);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hola, {userName}</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {new Date().toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isWorking ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          {isWorking ? <Timer className="animate-pulse" /> : <CheckCircle2 />}
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${isWorking ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        
        <div className="mt-4 mb-10">
          <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] block mb-2">Jornada Actual</span>
          <div className="text-7xl font-black text-slate-900 font-mono tracking-tighter">
            {formatTime(timer)}
          </div>
        </div>

        <button
          disabled={loading || locating}
          onClick={() => handleAction(isWorking ? 'OUT' : 'IN')}
          className={`w-full h-28 rounded-[2rem] font-black text-3xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl disabled:opacity-50 ${
            isWorking ? 'bg-rose-600 text-white shadow-rose-100' : 'bg-indigo-600 text-white shadow-indigo-100'
          }`}
        >
          {loading || locating ? <Loader2 className="animate-spin" size={36} /> : (isWorking ? <Square fill="currentColor" size={32}/> : <Play fill="currentColor" size={32}/>)}
          {locating ? 'LOCATING...' : (isWorking ? 'SORTIR' : 'ENTRAR')}
        </button>

        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          <MapPin size={14} className={isWorking ? "text-emerald-500" : "text-indigo-500"} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            GPS Actiu • {locating ? 'Capturant...' : 'Verificat'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-black text-slate-800 text-sm flex items-center gap-2 mb-4 uppercase tracking-widest">
          <History size={16} className="text-indigo-600" /> Moviments d'avui
        </h3>
        <div className="space-y-3">
          {todayEntries.map(e => (
            <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${e.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {e.type === 'IN' ? <Play size={14} fill="currentColor" /> : <Square size={14} fill="currentColor" />}
                </div>
                <span className="text-xs font-bold text-slate-700">{e.type === 'IN' ? 'Entrada' : 'Sortida'}</span>
              </div>
              <span className="text-sm font-black text-slate-900 font-mono">
                {e.timestamp.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {todayEntries.length === 0 && <p className="text-center text-slate-400 text-xs py-4">No hi ha moviments registrats avui.</p>}
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
