
import React, { useState } from 'react';
import { VacationRequest } from '../types';
import { Check, X, Clock, User, RefreshCw } from 'lucide-react';

interface VacationAdminProps {
  vacations: VacationRequest[];
  onUpdateStatus: (id: string, status: 'Aprovada' | 'Denegada') => void;
  onRefresh?: () => Promise<void>;
}

const VacationAdmin: React.FC<VacationAdminProps> = ({ vacations, onUpdateStatus, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pending = vacations.filter(v => v.status === 'Pendent');
  const processed = vacations.filter(v => v.status !== 'Pendent').reverse();

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Panell d'Administració</h2>
        {onRefresh && (
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Actualitzar dades
          </button>
        )}
      </div>

      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="text-amber-500" /> Sol·licituds Pendents
        </h3>
        {pending.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
            No hi ha cap petició pendent de revisió.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(v => (
              <div key={v.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{v.employeeName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{v.type}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl mb-4">
                    <p className="text-sm font-medium text-slate-600">Del {new Date(v.startDate).toLocaleDateString('ca-ES')} al {new Date(v.endDate).toLocaleDateString('ca-ES')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onUpdateStatus(v.id, 'Aprovada')} className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                    <Check size={18} /> Aprovar
                  </button>
                  <button onClick={() => onUpdateStatus(v.id, 'Denegada')} className="flex-1 bg-rose-50 text-rose-500 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors">
                    <X size={18} /> Denegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-700 mb-4">Historial de Respostes</h3>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="p-4">Treballador</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Estat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processed.map(v => (
                <tr key={v.id}>
                  <td className="p-4 font-bold text-sm text-slate-700">{v.employeeName}</td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(v.startDate).toLocaleDateString('ca-ES')} - {new Date(v.endDate).toLocaleDateString('ca-ES')}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      v.status === 'Aprovada' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default VacationAdmin;
