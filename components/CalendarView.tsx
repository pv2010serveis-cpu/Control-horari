
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info, Briefcase } from 'lucide-react';
import { VacationRequest } from '../types';

interface CalendarProps {
  userId: string;
  vacations: VacationRequest[];
  onRequest: (start: Date, end: Date) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ userId, vacations, onRequest }) => {
  const [curr, setCurr] = useState(new Date(2026, 0, 1)); // Inici al Gener de 2026
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState({ start: '', end: '' });

  const daysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(curr.getFullYear(), curr.getMonth(), 1).getDay() + 6) % 7;

  const monthNames = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="h-28 bg-slate-50/50 border-b border-r border-slate-100"></div>);
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(curr.getFullYear(), curr.getMonth(), i);
    const dayEntries = vacations.filter(v => {
      const s = new Date(v.startDate);
      const e = new Date(v.endDate);
      s.setHours(0,0,0,0);
      e.setHours(23,59,59,999);
      return d >= s && d <= e && v.status === 'APPROVED';
    });

    const isSystemHoliday = dayEntries.some(v => v.userId === 'system');
    const isUserVacation = dayEntries.some(v => v.userId === userId);

    days.push(
      <div key={i} className={`h-28 p-2 border-b border-r border-slate-100 relative group transition-colors ${isSystemHoliday ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
        <div className="flex justify-between items-start">
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
            d.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white' : 
            isSystemHoliday ? 'text-red-600' : 'text-slate-400'
          }`}>
            {i}
          </span>
          {isSystemHoliday && <Briefcase size={12} className="text-red-400" />}
        </div>
        
        <div className="mt-2 space-y-1 overflow-y-auto max-h-[60px] scrollbar-hide">
          {dayEntries.map(v => {
            let bgColor = 'bg-slate-200 text-slate-600';
            let label = v.userName;

            if (v.userId === 'system') {
              bgColor = 'bg-red-100 text-red-700 border border-red-200';
              label = v.userName;
            } else if (v.userId === userId) {
              bgColor = 'bg-indigo-600 text-white shadow-sm';
              label = 'Les meves';
            } else {
              bgColor = 'bg-amber-100 text-amber-700 border border-amber-200';
            }

            return (
              <div key={v.id} className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-bold uppercase tracking-tighter ${bgColor}`}>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Calendari Laboral Construcció Tarragona 2026</h2>
        <p className="text-slate-500 text-sm">Dies de conveni i festius oficials segons l'acord sectorial de 2026.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={() => setCurr(new Date(curr.getFullYear(), curr.getMonth() - 1))} className="p-1 hover:text-indigo-600"><ChevronLeft size={20}/></button>
          <span className="font-bold text-slate-700 min-w-[140px] text-center">{monthNames[curr.getMonth()]} {curr.getFullYear()}</span>
          <button onClick={() => setCurr(new Date(curr.getFullYear(), curr.getMonth() + 1))} className="p-1 hover:text-indigo-600"><ChevronRight size={20}/></button>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Plus size={18} /> Sol·licitar Vacances
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border-l border-t border-slate-200 shadow-sm overflow-hidden grid grid-cols-7">
        {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(h => (
          <div key={h} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase border-r border-b border-slate-100 bg-slate-50/50">{h}</div>
        ))}
        {days}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm font-bold text-slate-700">Festius i Conveni</span>
          </div>
          <p className="text-xs text-slate-500">Dies no laborables segons el sector de la construcció a Tarragona.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-indigo-600 rounded"></div>
            <span className="text-sm font-bold text-slate-700">Les meves Vacances</span>
          </div>
          <p className="text-xs text-slate-500">Dies aprovats per la direcció.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"></div>
            <span className="text-sm font-bold text-slate-700">Vacances de l'Equip</span>
          </div>
          <p className="text-xs text-slate-500">Consulta la disponibilitat dels companys.</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Nova sol·licitud</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data d'inici</label>
                <input type="date" min="2026-01-01" max="2026-12-31" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500" onChange={e => setRange({...range, start: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Data de fi</label>
                <input type="date" min="2026-01-01" max="2026-12-31" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500" onChange={e => setRange({...range, end: e.target.value})}/>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl flex gap-3 border border-amber-100 mt-4">
                <Info size={18} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium">Les sol·licituds per al 2026 seran revisades per l'administrador.</p>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">Cancel·lar</button>
                <button onClick={() => { onRequest(new Date(range.start), new Date(range.end)); setShowModal(false); }} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Enviar sol·licitud</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
