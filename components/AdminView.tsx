
import React from 'react';
import { Shield, MapPin, Download, ExternalLink, Users, Calendar, X, Check, Circle } from 'lucide-react';
import { VacationRequest, TimeEntry, User } from '../types';

interface AdminProps {
  vacations: VacationRequest[];
  allEntries: TimeEntry[];
  users: User[];
  onUpdate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const AdminView: React.FC<AdminProps> = ({ vacations, allEntries, users, onUpdate }) => {
  const pending = vacations.filter(v => v.status === 'PENDING');
  
  const getUserStatus = (userId: string) => {
    const today = new Date().toDateString();
    const userTodayEntries = allEntries
      .filter(e => e.userId === userId && e.timestamp.toDateString() === today)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (userTodayEntries.length === 0) return { status: 'OFF', label: 'No actiu' };
    return userTodayEntries[0].type === 'IN' 
      ? { status: 'IN', label: 'Treballant', time: userTodayEntries[0].timestamp } 
      : { status: 'OUT', label: 'Fora', time: userTodayEntries[0].timestamp };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <Shield size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Equip</h2>
        </div>
        <button className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
          <Download size={18} />
        </button>
      </header>

      {/* Estat de la Plantilla - Més compacte */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} /> Estat de la Plantilla
          </h3>
          <span className="text-[10px] font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">
            {users.filter(u => getUserStatus(u.id).status === 'IN').length} Actius
          </span>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {users.map(u => {
            const info = getUserStatus(u.id);
            return (
              <div key={u.id} className="p-3 bg-slate-50/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px] text-slate-400 uppercase">
                      {u.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      info.status === 'IN' ? 'bg-emerald-500 animate-pulse' : 
                      info.status === 'OUT' ? 'bg-rose-400' : 'bg-slate-300'
                    }`}></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{u.name}</p>
                    <p className="text-[9px] font-medium text-slate-400 uppercase">
                      {info.label} {info.time && `• ${info.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </p>
                  </div>
                </div>
                {u.role === 'ADMIN' && <Shield size={10} className="text-amber-400" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* Vacances Pendents */}
      {pending.length > 0 && (
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar size={14} /> Sol·licituds
          </h3>
          <div className="space-y-3">
            {pending.map(v => (
              <div key={v.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">{v.userName}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">
                    {v.startDate.toLocaleDateString([], {day:'numeric', month:'short'})} - {v.endDate.toLocaleDateString([], {day:'numeric', month:'short'})}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onUpdate(v.id, 'REJECTED')} className="p-2 bg-white text-rose-500 rounded-lg border border-slate-100"><X size={16}/></button>
                  <button onClick={() => onUpdate(v.id, 'APPROVED')} className="p-2 bg-indigo-600 text-white rounded-lg"><Check size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Moviments GPS - Compacte */}
      <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={14} /> GPS Recent
        </h3>
        <div className="space-y-2">
          {allEntries.slice(0, 4).map(e => (
            <div key={e.id} className="flex items-center justify-between p-2 bg-slate-50/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${e.type === 'IN' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">{e.userName}</span>
              </div>
              {e.location && (
                <a href={`https://www.google.com/maps?q=${e.location.latitude},${e.location.longitude}`} target="_blank" className="text-indigo-500">
                  <ExternalLink size={12}/>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminView;
