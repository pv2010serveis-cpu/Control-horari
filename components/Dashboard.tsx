
import React from 'react';
import { Play, Square, Clock, History, ArrowRight, MapPin } from 'lucide-react';
import { TimeEntry } from '../types';

interface DashboardProps {
  entries: TimeEntry[];
  onAddEntry: (type: 'IN' | 'OUT') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, onAddEntry }) => {
  const isWorking = entries.length > 0 && entries[0].type === 'IN';
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <h2 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Control Horari</h2>
        <div className="text-6xl font-black text-slate-800 mb-8 font-mono">
          {new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <div className="flex gap-4 w-full max-w-sm">
          {!isWorking ? (
            <button 
              onClick={() => onAddEntry('IN')}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Play size={20} fill="currentColor" /> Entrada
            </button>
          ) : (
            <button 
              onClick={() => onAddEntry('OUT')}
              className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
            >
              <Square size={20} fill="currentColor" /> Sortida
            </button>
          )}
        </div>
        
        <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
          <MapPin size={14} /> Ubicació verificada (Oficina)
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <History className="text-indigo-600" />
          <h3 className="text-xl font-bold">Últims moviments</h3>
        </div>
        
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-center text-slate-400 py-4 italic">No hi ha registres avui.</p>
          ) : (
            entries.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${e.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="font-bold text-slate-700">{e.type === 'IN' ? 'Entrada' : 'Sortida'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{e.timestamp.toLocaleDateString('ca-ES')}</span>
                  <span className="font-mono font-bold text-indigo-600">{e.timestamp.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
