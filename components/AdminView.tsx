
import React from 'react';
import { Check, X, Shield, Clock, MapPin, Download, ExternalLink, Users, Calendar, Circle } from 'lucide-react';
import { VacationRequest, TimeEntry, User } from '../types';

interface AdminProps {
  vacations: VacationRequest[];
  allEntries: TimeEntry[];
  users: User[];
  onUpdate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const AdminView: React.FC<AdminProps> = ({ vacations, allEntries, users, onUpdate }) => {
  const pending = vacations.filter(v => v.status === 'PENDING');
  const lastMovements = [...allEntries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

  const getUserStatus = (userId: string) => {
    const today = new Date().toDateString();
    const userTodayEntries = allEntries
      .filter(e => e.userId === userId && e.timestamp.toDateString() === today)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (userTodayEntries.length === 0) return { status: 'OFF', label: 'No ha entrat' };
    return userTodayEntries[0].type === 'IN' 
      ? { status: 'IN', label: 'Treballant', time: userTodayEntries[0].timestamp } 
      : { status: 'OUT', label: 'Ha sortit', time: userTodayEntries[0].timestamp };
  };

  const exportCSV = () => {
    const headers = ["Empleat", "Tipus", "Data", "Hora", "Lat", "Long"];
    const rows = allEntries.map(e => [
      e.userName || 'N/A',
      e.type === 'IN' ? 'ENTRADA' : 'SORTIDA',
      e.timestamp.toLocaleDateString(),
      e.timestamp.toLocaleTimeString(),
      e.location?.latitude || '',
      e.location?.longitude || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "registre_horari.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administració</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gestió de Personal i Seguretat</p>
          </div>
        </div>
        <button onClick={exportCSV} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
          <Download size={20} /> EXPORTAR CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol·licituds i Registre GPS */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" /> Vacances Pendents
              </h3>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full">{pending.length} Pendents</span>
            </div>
            <div className="divide-y divide-slate-100">
              {pending.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs">Tot al dia! No hi ha sol·licituds.</div>
              ) : (
                pending.map(v => (
                  <div key={v.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">{v.userName.charAt(0)}</div>
                      <div>
                        <div className="font-black text-slate-900">{v.userName}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{v.startDate.toLocaleDateString()} ➔ {v.endDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onUpdate(v.id, 'REJECTED')} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><X size={20}/></button>
                      <button onClick={() => onUpdate(v.id, 'APPROVED')} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-xs uppercase hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">APROVAR</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500" /> Registre recent amb GPS
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {lastMovements.map(e => (
                <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${e.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {e.type === 'IN' ? 'E' : 'S'}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-sm">{e.userName}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">{e.timestamp.toLocaleTimeString()} • {e.timestamp.toLocaleDateString()}</div>
                    </div>
                  </div>
                  {e.location && (
                    <a href={`https://www.google.com/maps?q=${e.location.latitude},${e.location.longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-white border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      MAPA <ExternalLink size={12}/>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Estat de tota la plantilla */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Users size={24} className="text-indigo-400" />
              <h3 className="text-xl font-black tracking-tight">Estat Plantilla</h3>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {users.map(user => {
                const info = getUserStatus(user.id);
                return (
                  <div key={user.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                        info.status === 'IN' ? 'bg-emerald-400 shadow-emerald-400' : 
                        info.status === 'OUT' ? 'bg-rose-400 shadow-rose-400' : 'bg-slate-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-black tracking-tight">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          {info.label} {info.time && `• ${info.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </p>
                      </div>
                    </div>
                    {user.role === 'ADMIN' && (
                      <div className="text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black uppercase">Admin</div>
                    )}
                  </div>
                );
              })}
              {users.length === 0 && (
                <p className="text-slate-500 text-xs italic text-center py-4">No hi ha usuaris registrats.</p>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-3xl font-black text-emerald-400">
                  {users.filter(u => getUserStatus(u.id).status === 'IN').length}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Actius ara</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-400">{users.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total plantilla</p>
              </div>
            </div>
          </section>

          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Rendiment Avui</h3>
            <div className="text-5xl font-black mb-2">98.4%</div>
            <p className="text-[10px] font-bold opacity-70">Puntualitat d'entrada de la plantilla.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
