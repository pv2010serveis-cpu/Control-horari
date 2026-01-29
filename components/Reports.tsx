
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { TimeEntry } from '../types';

interface ReportsProps {
  entries: TimeEntry[];
}

const Reports: React.FC<ReportsProps> = ({ entries }) => {
  // Calculem les hores per dia de la setmana actual
  const weeklyData = useMemo(() => {
    const days = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0,0,0,0);

    const result = [
      { name: 'Dl', hours: 0 },
      { name: 'Dt', hours: 0 },
      { name: 'Dc', hours: 0 },
      { name: 'Dj', hours: 0 },
      { name: 'Dv', hours: 0 },
      { name: 'Ds', hours: 0 },
      { name: 'Dg', hours: 0 },
    ];

    // Només processem fitxatges tancats (IN seguit d'OUT)
    const sorted = [...entries].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    for(let i=0; i < sorted.length; i++) {
      if(sorted[i].type === 'IN' && sorted[i+1]?.type === 'OUT') {
        const d = sorted[i].timestamp;
        if(d >= startOfWeek) {
          const dayName = days[d.getDay()];
          const diffMs = sorted[i+1].timestamp.getTime() - sorted[i].timestamp.getTime();
          const hours = diffMs / 3600000;
          
          const target = result.find(r => r.name === dayName);
          if(target) target.hours += Number(hours.toFixed(2));
        }
        i++;
      }
    }
    return result;
  }, [entries]);

  // Calculem historial mensual (últims 4 mesos)
  const monthlyData = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Abr', 'Maig', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Des'];
    const result: any[] = [];
    
    const sorted = [...entries].sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());
    const totals: Record<string, number> = {};

    for(let i=0; i < sorted.length; i++) {
      if(sorted[i].type === 'IN' && sorted[i+1]?.type === 'OUT') {
        const m = months[sorted[i].timestamp.getMonth()];
        const diff = (sorted[i+1].timestamp.getTime() - sorted[i].timestamp.getTime()) / 3600000;
        totals[m] = (totals[m] || 0) + diff;
        i++;
      }
    }

    Object.keys(totals).forEach(m => {
      result.push({ month: m, val: Math.round(totals[m]) });
    });

    return result.length > 0 ? result : [{month: '-', val: 0}];
  }, [entries]);

  // Registres agrupats per dia per a la taula
  const tableRows = useMemo(() => {
    const rows: any[] = [];
    const sorted = [...entries].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

    for(let i=0; i < sorted.length; i++) {
      // Busquem l'entrada corresponent a una sortida (estan ordenats desc)
      if(sorted[i].type === 'OUT' && sorted[i+1]?.type === 'IN' && 
         sorted[i].timestamp.toDateString() === sorted[i+1].timestamp.toDateString()) {
        
        const inTime = sorted[i+1].timestamp;
        const outTime = sorted[i].timestamp;
        const diffMs = outTime.getTime() - inTime.getTime();
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);

        rows.push({
          date: inTime.toLocaleDateString('ca-ES', { day:'numeric', month:'long' }),
          in: inTime.toLocaleTimeString('ca-ES', { hour:'2-digit', minute:'2-digit' }),
          out: outTime.toLocaleTimeString('ca-ES', { hour:'2-digit', minute:'2-digit' }),
          total: `${hours}h ${mins}m`,
          status: 'Validat'
        });
        i++;
      }
    }
    return rows;
  }, [entries]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Hores Setmanals</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}}
                />
                <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Resum Mensual (Hores)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px'}} />
                <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Detall de Jornades</h3>
        <div className="overflow-x-auto -mx-6 md:mx-0">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-50">
                <th className="pb-4 px-6 font-bold">Data</th>
                <th className="pb-4 px-6 font-bold">Entrada</th>
                <th className="pb-4 px-6 font-bold">Sortida</th>
                <th className="pb-4 px-6 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-xs font-bold text-slate-700">{row.date}</td>
                  <td className="py-4 px-6 font-mono text-slate-500 text-xs">{row.in}</td>
                  <td className="py-4 px-6 font-mono text-slate-500 text-xs">{row.out}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {row.total}
                    </span>
                  </td>
                </tr>
              ))}
              {tableRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                    No hi ha jornades completades
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
