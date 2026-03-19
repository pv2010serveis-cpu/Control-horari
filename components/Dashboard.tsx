
import React, { useMemo, useState, useEffect } from 'react';
import { ClockEntry, ClockType } from '../types';
import { generateMonthlyInsights } from '../geminiService';
import { Sparkles, ArrowUpRight, ArrowDownRight, Clock, Fingerprint, LogIn, LogOut, AlertTriangle, X } from 'lucide-react';

interface DashboardProps {
  entries: ClockEntry[];
  isClockedIn: boolean;
  onClockAction: () => void;
  onSyncPending: () => void;
  isAdmin: boolean;
  rescueMessage?: string | null;
  onClearRescueMessage?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  entries, 
  isClockedIn, 
  onClockAction, 
  onSyncPending, 
  isAdmin,
  rescueMessage,
  onClearRescueMessage
}) => {
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  const todayEntries = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return entries.filter(e => new Date(e.timestamp).setHours(0,0,0,0) === today);
  }, [entries]);

  const totalMinutesToday = useMemo(() => {
    let total = 0;
    for (let i = 0; i < todayEntries.length; i += 2) {
      const start = todayEntries[i];
      const end = todayEntries[i+1];
      if (start && end && start.type === ClockType.IN && end.type === ClockType.OUT) {
        total += (end.timestamp - start.timestamp) / 60000;
      } else if (start && !end && start.type === ClockType.IN) {
        total += (Date.now() - start.timestamp) / 60000;
      }
    }
    return Math.floor(total);
  }, [todayEntries]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (isAdmin && entries.length > 5 && !aiInsights) {
        setLoadingAi(true);
        const month = new Date().toLocaleString('ca-ES', { month: 'long' });
        const res = await generateMonthlyInsights(entries, month);
        setAiInsights(res);
        setLoadingAi(false);
      }
    };
    fetchInsights();
  }, [entries, isAdmin, aiInsights]);

  return (
    <div className="space-y-6">
      {rescueMessage && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <AlertTriangle size={20} />
            </div>
            <p className="text-sm font-medium text-amber-800">{rescueMessage}</p>
          </div>
          {onClearRescueMessage && (
            <button 
              onClick={onClearRescueMessage}
              className="text-amber-400 hover:text-amber-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Botó de fitxar principal */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col items-center text-center">
        <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center transition-all ${isClockedIn ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
          <Fingerprint size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {isClockedIn ? 'Sessió Activa' : 'Bon dia!'}
        </h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          {isClockedIn ? 'Estàs treballant en aquests moments. No oblidis fitxar la sortida.' : 'Registra la teva entrada per començar la jornada laboral.'}
        </p>
        <button 
          onClick={onClockAction}
          className={`w-full max-w-sm py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
            isClockedIn 
              ? 'bg-rose-500 text-white shadow-rose-100' 
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {isClockedIn ? <LogOut size={24} /> : <LogIn size={24} />}
          {isClockedIn ? 'Registrar Sortida' : 'Registrar Entrada'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <StatCard 
            title="Temps Avui" 
            value={`${Math.floor(totalMinutesToday / 60)}h ${totalMinutesToday % 60}m`} 
            subtitle="Jornada diària"
            icon={<Clock className="text-indigo-600" />}
            progress={(totalMinutesToday / 480) * 100}
          />
          <StatCard 
            title="Darrer Fitxatge" 
            value={entries.length > 0 ? new Date(entries[entries.length - 1].timestamp).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--"} 
            subtitle={entries.length > 0 ? (entries[entries.length - 1].type === ClockType.IN ? 'Entrada' : 'Sortida') : 'Sense activitat'}
            icon={entries[entries.length - 1]?.type === ClockType.IN ? <ArrowUpRight className="text-green-500" /> : <ArrowDownRight className="text-rose-500" />}
          />
        </div>

        {/* Panell d'IA NOMÉS per a l'ADMIN */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-indigo-500" />
              <h3 className="font-bold text-slate-800">Assistent Admin</h3>
            </div>
            {loadingAi ? (
              <div className="animate-pulse space-y-2 text-xs text-slate-400 italic">Generant anàlisi de dades...</div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {aiInsights || "L'anàlisi de Gemini es carregarà quan hi hagi prou dades de fitxatges."}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Historial recent de la pantalla d'inici */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Darrers Moviments</h3>
            {entries.some(e => e.syncStatus === 'Pendent') && (
              <button 
                onClick={onSyncPending}
                className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
              >
                Sincronitzar Pendents
              </button>
            )}
        </div>
        <div className="divide-y divide-slate-50">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-sm">Cap moviment registrat avui</div>
          ) : (
            entries.slice(-10).reverse().map(entry => (
              <div key={entry.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${entry.type === ClockType.IN ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                    {entry.type === ClockType.IN ? <LogIn size={14} /> : <LogOut size={14} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-700">{entry.type === ClockType.IN ? 'Entrada' : 'Sortida'}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit' })} - {new Date(entry.timestamp).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold ${entry.syncStatus === 'Sincronitzat' ? 'text-green-500' : 'text-amber-500'}`}>
                  {entry.syncStatus}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, subtitle: string, icon: React.ReactNode, progress?: number }> = ({ title, value, subtitle, icon, progress }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start mb-4">
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
    </div>
    <div className="flex items-center gap-2">
        {progress !== undefined && (
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
        )}
        <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
    </div>
  </div>
);

export default Dashboard;
