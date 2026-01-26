
import React from 'react';
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

const data = [
  { name: 'Dl', hours: 8.2 },
  { name: 'Dt', hours: 7.8 },
  { name: 'Dc', hours: 8.5 },
  { name: 'Dj', hours: 8.0 },
  { name: 'Dv', hours: 4.0 },
  { name: 'Ds', hours: 0 },
  { name: 'Dg', hours: 0 },
];

const Reports: React.FC<ReportsProps> = ({ entries }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Hores per Dia (Aquesta Setmana)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="hours" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Tendència d'Hores (Mensual)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                {month: 'Gen', val: 160}, {month: 'Feb', val: 155}, {month: 'Mar', val: 172}, {month: 'Abr', val: 140}
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <h3 className="text-xl font-bold mb-6">Detall de Registres Mensuals</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="pb-4 font-bold">Data</th>
              <th className="pb-4 font-bold">Entrada</th>
              <th className="pb-4 font-bold">Sortida</th>
              <th className="pb-4 font-bold">Total Hores</th>
              <th className="pb-4 font-bold">Estat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 font-medium text-slate-700">{i} de Maig, 2024</td>
                <td className="py-4 font-mono text-slate-500 text-sm">08:32:12</td>
                <td className="py-4 font-mono text-slate-500 text-sm">17:45:01</td>
                <td className="py-4 font-bold text-slate-800">8h 12m</td>
                <td className="py-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Validat</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
