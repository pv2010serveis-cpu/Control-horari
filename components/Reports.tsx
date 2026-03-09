
import React, { useMemo, useState } from 'react';
import { ClockEntry, ClockType } from '../types';
import { Download, MapPin, Clock as ClockIcon, Calendar as CalendarIcon, CloudUpload, CheckCircle2, RefreshCw } from 'lucide-react';

interface ReportsProps {
  entries: ClockEntry[];
  employeeCode: string;
  onSyncPending?: () => Promise<void>;
}

interface Session {
  date: string;
  in?: ClockEntry;
  out?: ClockEntry;
}

const Reports: React.FC<ReportsProps> = ({ entries, employeeCode, onSyncPending }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  // Organitzem els registres en "sessions" (Entrada + Sortida)
  const sessions = useMemo(() => {
    const result: Session[] = [];
    const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    
    sorted.forEach(entry => {
      const dateKey = new Date(entry.timestamp).toLocaleDateString('ca-ES');
      
      if (entry.type === ClockType.IN) {
        result.push({ date: dateKey, in: entry });
      } else {
        const lastSessionWithoutOut = [...result].reverse().find(s => !s.out && s.date === dateKey);
        if (lastSessionWithoutOut) {
          lastSessionWithoutOut.out = entry;
        } else {
          result.push({ date: dateKey, out: entry });
        }
      }
    });

    return result.reverse();
  }, [entries]);

  const pendingCount = useMemo(() => {
    return entries.filter(e => e.syncStatus !== 'Sincronitzat').length;
  }, [entries]);

  const calculateDuration = (session: Session) => {
    if (session.in && session.out) {
      const diff = session.out.timestamp - session.in.timestamp;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }
    return '--';
  };

  const handleManualSync = async () => {
    if (!onSyncPending || pendingCount === 0 || isSyncing) return;
    setIsSyncing(true);
    await onSyncPending();
    setIsSyncing(false);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data;Hora Entrada;Loc Entrada;Hora Sortida;Loc Sortida;Durada;ID Unic\n";
    
    sessions.forEach(s => {
      const hEntrada = s.in ? new Date(s.in.timestamp).toLocaleTimeString('ca-ES') : "";
      const lEntrada = s.in?.location ? `${s.in.location.lat},${s.in.location.lng}` : "";
      const hSortida = s.out ? new Date(s.out.timestamp).toLocaleTimeString('ca-ES') : "";
      const lSortida = s.out?.location ? `${s.out.location.lat},${s.out.location.lng}` : "";
      const durada = calculateDuration(s);
      const idUnic = s.in?.id || s.out?.id || "";
      
      csvContent += `${s.date};${hEntrada};${lEntrada};${hSortida};${lSortida};${durada};${idUnic}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HorariPro_Resum_${employeeCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Resum de Jornades</h3>
            <p className="text-sm text-slate-500">ID Empleat: {employeeCode}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <button 
            onClick={handleManualSync}
            disabled={pendingCount === 0 || isSyncing}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
              pendingCount > 0 
                ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <CloudUpload size={18} />}
            {isSyncing ? 'Sincronitzant...' : `Pujar a Excel (${pendingCount})`}
          </button>
          
          <button 
            onClick={exportToCSV} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Entrada</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sortida</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Durada</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Estat Núvol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.map((session, idx) => {
                const isSynced = (session.in ? session.in.syncStatus === 'Sincronitzat' : true) && 
                                 (session.out ? session.out.syncStatus === 'Sincronitzat' : true);
                
                return (
                  <tr key={`${session.date}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-700">{session.date}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-green-600">
                          {session.in ? new Date(session.in.timestamp).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                        {session.in?.location && (
                          <span className="flex items-center gap-0.5 text-[8px] text-slate-400 mt-1">
                            <MapPin size={8} /> GPS OK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-rose-500">
                          {session.out ? new Date(session.out.timestamp).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                        {session.out?.location && (
                          <span className="flex items-center gap-0.5 text-[8px] text-slate-400 mt-1">
                            <MapPin size={8} /> GPS OK
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                        <ClockIcon size={12} />
                        {calculateDuration(session)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {isSynced ? (
                        <div className="flex items-center justify-end gap-1 text-green-500">
                           <CheckCircle2 size={14} />
                           <span className="text-[10px] font-bold uppercase">Sincronitzat</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-amber-500">
                           <RefreshCw size={14} />
                           <span className="text-[10px] font-bold uppercase">Pendent</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                    Encara no hi ha cap jornada registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
          <RefreshCw size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Tens <strong>{pendingCount} fitxatges</strong> que només estan guardats en aquest dispositiu. 
            Prem el botó de pujar per assegurar-te que l'empresa els rep al full d'Excel. 
            <em> Nota: L'Excel no duplicarà fitxatges encara que els pugis dues vegades.</em>
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
