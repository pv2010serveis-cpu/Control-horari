
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info, Briefcase, Star } from 'lucide-react';
import { VacationRequest } from '../types';

interface CalendarProps {
  userId: string;
  vacations: VacationRequest[];
  onRequest: (start: Date, end: Date) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ userId, vacations, onRequest }) => {
  const [curr, setCurr] = useState(new Date(2026, 0, 1));
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState({ start: '', end: '' });

  const daysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate();
  const firstDay = (new Date(curr.getFullYear(), curr.getMonth(), 1).getDay() + 6) % 7;

  const monthNames = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="h-24 md:h-28 bg-slate-50/30 border-b border-r border-slate-100"></div>);
  
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
    const isConveniDay = dayEntries.some(v => v.userId === 'conveni');
    const isUserVacation = dayEntries.some(v => v.userId === userId);

    days.push(
      <div key={i} className={`h-24 md:h-28 p-1.5 md:p-2 border-b border-r border-slate-100 relative group transition-colors 
        ${isSystemHoliday ? 'bg-rose-50/40' : isConveniDay ? 'bg-amber-50/40' : 'hover:bg-slate-50/80'}`}>
        
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[10px] md:text-xs font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${
            d.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white' : 
            isSystemHoliday ? 'text-rose-600' : isConveniDay ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {i}
          </span>
          <div className="flex gap-1">
            {isSystemHoliday && <Briefcase size={10} className="text-rose-400" />}
            {isConveniDay && <Star size={10} className="text-amber-400" />}
          </div>
        </div>
        
        <div className="space-y-1 overflow-y-hidden">
          {dayEntries.map(v => {
            let bgColor = 'bg-slate-200 text-slate-600';
            let label = v.userName;

            if (v.userId === 'system') {
              bgColor = 'bg-rose-100 text-rose-700 border border-rose-200';
            } else if (v.userId === 'conveni') {
              bgColor = 'bg-amber-100 text-amber-700 border border-amber-200';
            } else if (v.userId === userId) {
              bgColor = 'bg-indigo-600 text-white shadow-sm';
              label = 'Les meves';
            } else {
              bgColor = 'bg-slate-100 text-slate-500 border border-slate-200';
              label = v.userName.split(' ')[0];
            }

            return (
              <div key={v.id} className={`text-[8px] md:text-[9px] px-1 py-0.5 rounded-md truncate font-bold uppercase tracking-tight ${bgColor}`}>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Calendari Construcció Tarragona 2026</h2>
        <p className="text-slate-400 text-xs mt-1">Festius oficials, dies de conveni i vacances personals.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto justify-between md:justify-start">
          <button onClick={() => setCurr(new Date(curr.getFullYear(), curr.getMonth() - 1))} className="p-1 hover:text-indigo-600"><ChevronLeft size={20}/></button>
          <span className="font-bold text-slate-700 min-w-[120px] text-center text-sm">{monthNames[curr.getMonth()]} {curr.getFullYear()}</span>
          <button onClick={() => setCurr(new Date(curr.getFullYear(), curr.getMonth() + 1))} className="p-1 hover:text-indigo-600"><ChevronRight size={20}/></button>
        </div>
        
        <button onClick={() => setShowModal(true)} className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all text-sm">
          <Plus size={18} /> Demanar Vacances
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {['dl', 'dt', 'dc', 'dj', 'dv', 'ds', 'dg'].map(h => (
            <div key={h} className="py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-l border-slate-100">
          {days}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-4 h-4 bg-rose-100 border border-rose-200 rounded-lg"></div>
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Festiu Oficial</p>
            <p className="text-[10px] text-slate-400">Any Nou, Reis, Nadal, etc.</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded-lg"></div>
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Festa Conveni</p>
            <p className="text-[10px] text-slate-400">Dies d'ajust del sector.</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="w-4 h-4 bg-indigo-600 rounded-lg"></div>
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Les meves Vacances</p>
            <p className="text-[10px] text-slate-400">Dies de lliure elecció.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Sol·licitar Vacances</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Inici</label>
                <input type="date" min="2026-01-01" max="2026-12-31" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-400 text-sm font-semibold" onChange={e => setRange({...range, start: e.target.value})}/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fi</label>
                <input type="date" min="2026-01-01" max="2026-12-31" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-indigo-400 text-sm font-semibold" onChange={e => setRange({...range, end: e.target.value})}/>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl flex gap-3 border border-indigo-100">
                <Info size={16} className="text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">Les vacances d'estiu no estan pre-carregades. Selecciona les teves dates preferides.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-sm">Cancel·lar</button>
                <button onClick={() => { 
                  if(range.start && range.end) {
                    onRequest(new Date(range.start), new Date(range.end)); 
                    setShowModal(false); 
                  }
                }} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-100">Enviar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
