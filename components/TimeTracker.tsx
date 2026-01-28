
import React, { useState, useEffect } from 'react';
import { Play, Square, MapPin, Loader2, History, Timer, Map as MapIcon } from 'lucide-react';
import { TimeEntry, LocationData, User } from '../types';

interface TimeTrackerProps {
  user: User;
  entries: TimeEntry[];
  onAddEntry: (entry: TimeEntry) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ user, entries, onAddEntry }) => {
  const [timer, setTimer] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const todayEntries = entries.filter(e => e.userId === user.id && e.timestamp.toDateString() === new Date().toDateString());
  const isWorking = todayEntries.length > 0 && todayEntries[0].type === 'IN';

  // Coordenades Magatzem: 41°10'58.9"N 1°26'53.7"E
  const MAGATZEM_LAT = 41.183028;
  const MAGATZEM_LNG = 1.448250;
  const RADIUS_METERS = 500;

  // Funció per calcular distància entre dos punts (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Radi de la terra en metres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distància en metres
  };

  const getWeeklyHours = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyEntries = entries.filter(e => e.userId === user.id && e.timestamp >= startOfWeek).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
    let totalMs = 0;
    
    for (let i = 0; i < weeklyEntries.length; i++) {
      if (weeklyEntries[i].type === 'IN' && weeklyEntries[i+1]?.type === 'OUT') {
        totalMs += weeklyEntries[i+1].timestamp.getTime() - weeklyEntries[i].timestamp.getTime();
        i++;
      }
    }
    
    if (isWorking) totalMs += Date.now() - todayEntries[0].timestamp.getTime();
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    return { hours, minutes };
  };

  const weeklyStats = getWeeklyHours();

  useEffect(() => {
    let interval: any;
    if (isWorking && todayEntries[0]) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - todayEntries[0].timestamp.getTime()) / 1000));
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

  const handleAction = async (type: 'IN' | 'OUT') => {
    setLoading(true);
    let location: LocationData | undefined;
    let locationLabel = "Sense GPS";

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, enableHighAccuracy: true })
      );
      
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      
      const distance = calculateDistance(location.latitude, location.longitude, MAGATZEM_LAT, MAGATZEM_LNG);
      
      if (distance <= RADIUS_METERS) {
        locationLabel = "MAGATZEM";
      } else {
        locationLabel = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      }
    } catch (e) {
      console.warn("Error obtenint GPS:", e);
    }

    onAddEntry({
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      timestamp: new Date(),
      type,
      location,
      locationLabel
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Hola, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-400 text-xs font-medium">
            {new Date().toLocaleDateString('ca-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div className={`p-2 rounded-full transition-all ${isWorking ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-300'}`}>
          <Timer size={20} className={isWorking ? 'animate-pulse' : ''} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Setmana</span>
          <div className="text-lg font-bold text-indigo-600">{weeklyStats.hours}h {weeklyStats.minutes}m</div>
        </div>
        <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-md shadow-indigo-100">
          <span className="text-[10px] font-bold opacity-70 uppercase tracking-wider block mb-1">Objectiu</span>
          <div className="text-lg font-bold">40h 00m</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="mb-6">
          <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px] block mb-2">Temps en curs</span>
          <div className="text-5xl font-bold text-slate-800 font-mono tracking-tight tabular-nums">
            {formatTime(timer)}
          </div>
        </div>

        <button
          disabled={loading}
          onClick={() => handleAction(isWorking ? 'OUT' : 'IN')}
          className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 ${
            isWorking ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-indigo-600 text-white shadow-indigo-100'
          }`}
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (isWorking ? <Square fill="currentColor" size={20}/> : <Play fill="currentColor" size={20}/>)}
          {isWorking ? 'ATURAR' : 'INICIAR'}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2">
          <MapPin size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPS Verificat</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <History size={14} className="text-indigo-600" /> Moviments d'avui
        </h3>
        <div className="space-y-2">
          {todayEntries.map(e => (
            <div key={e.id} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${e.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {e.type === 'IN' ? <Play size={12} fill="currentColor" /> : <Square size={12} fill="currentColor" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-600">{e.type === 'IN' ? 'Entrada' : 'Sortida'}</p>
                  <p className={`text-[9px] font-bold truncate ${e.locationLabel === 'MAGATZEM' ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {e.locationLabel || 'Sense dades'}
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800 font-mono shrink-0">
                {e.timestamp.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {todayEntries.length === 0 && (
            <p className="text-center py-4 text-[10px] font-bold text-slate-300 uppercase">Sense registres</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
