
import React, { useState, useMemo } from 'react';
import { HOLIDAYS_2026 } from '../constants';
import { VacationRequest, Holiday } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Info, User, RefreshCw } from 'lucide-react';

interface CalendarViewProps {
  vacations: VacationRequest[];
  currentUserId: string;
  onAddVacation: (vac: Omit<VacationRequest, 'id' | 'status' | 'employeeCode' | 'employeeName'>) => void;
  onRefresh?: () => Promise<void>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ vacations, currentUserId, onAddVacation, onRefresh }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at 2026
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newVacation, setNewVacation] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'Vacances' as any
  });

  const monthName = currentDate.toLocaleString('ca-ES', { month: 'long', year: 'numeric' });

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  const getHoliday = (d: Date): Holiday | undefined => {
    const dateStr = d.toISOString().split('T')[0];
    return HOLIDAYS_2026.find(h => h.date === dateStr);
  };

  const getDayVacations = (d: Date) => {
    // Utilitzem format local YYYY-MM-DD per evitar desplaçaments horaris de l'ISOString
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return vacations.filter(v => {
      const isInRange = dateStr >= v.startDate && dateStr <= v.endDate;
      // Mostrem totes les aprovades (de qualsevol)
      if (v.status === 'Aprovada') return isInRange;
      // Mostrem les pendents NOMÉS si són de l'usuari actual
      return isInRange && v.employeeCode === currentUserId && v.status === 'Pendent';
    });
  };

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
          <h3 className="text-lg font-bold min-w-[150px] text-center capitalize">{monthName}</h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {onRefresh && (
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Actualitzar</span>
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Plus size={18} /> Demanar Permís
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dll', 'Dmt', 'Dmc', 'Djt', 'Dvr', 'Dss', 'Dmg'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2 uppercase">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="aspect-square bg-slate-50/50 rounded-lg" />;
              
              const holiday = getHoliday(day);
              const dayVacations = getDayVacations(day);
              const isToday = new Date().toDateString() === day.toDateString();
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              let bgColor = 'bg-white';
              let textColor = 'text-slate-700';
              let borderColor = 'border-slate-100';

              if (holiday) {
                if (holiday.type === 'Official') {
                  bgColor = 'bg-rose-500';
                  textColor = 'text-white';
                } else if (holiday.type === 'Conveni') {
                  bgColor = 'bg-yellow-400';
                  textColor = 'text-slate-900';
                } else if (holiday.type === 'Vacances') {
                  bgColor = 'bg-sky-400';
                  textColor = 'text-white';
                }
              } else if (isWeekend) {
                bgColor = 'bg-slate-50/70';
                textColor = 'text-slate-400';
              }

              if (isToday) {
                borderColor = 'border-indigo-500 ring-1 ring-indigo-500';
              }

              return (
                <div key={day.toISOString()} className={`relative aspect-square rounded-lg flex flex-col items-center justify-start border transition-all p-1 overflow-hidden ${bgColor} ${borderColor}`}>
                  <span className={`text-xs font-bold ${textColor}`}>
                    {day.getDate()}
                  </span>
                  
                  <div className="mt-1 w-full space-y-0.5">
                    {holiday && holiday.type !== 'Vacances' && holiday.type !== 'Conveni' && (
                      <div className="text-[6px] opacity-90 truncate leading-tight">{holiday.name}</div>
                    )}
                    {dayVacations.map(v => (
                      <div key={v.id} className={`text-[7px] px-1 rounded truncate leading-tight font-bold ${
                        v.status === 'Pendent' ? 'opacity-50 border border-dashed border-current' : ''
                      } ${
                        v.employeeCode === currentUserId 
                          ? 'bg-indigo-700 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {v.employeeCode === currentUserId ? 'JO' : v.employeeName.split(' ')[0]}
                        {v.status === 'Pendent' && ' (?)'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={16} /> Llegenda Conveni 2026</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-xs">
                <div className="w-4 h-4 rounded bg-rose-500" /> 
                <span className="font-medium">Festius Oficials</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <div className="w-4 h-4 rounded bg-yellow-400" /> 
                <span className="font-medium">Festes Conveni</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <div className="w-4 h-4 rounded bg-sky-400" /> 
                <span className="font-medium">Vacances Construcció</span>
              </li>
              <li className="flex items-center gap-3 text-xs border-t pt-2 mt-2">
                <div className="w-4 h-4 rounded bg-indigo-700" /> 
                <span className="font-medium">Els meus permisos</span>
              </li>
              <li className="flex items-center gap-3 text-xs">
                <div className="w-4 h-4 rounded bg-slate-200" /> 
                <span className="font-medium">Permisos companys</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
              * Aquest calendari segueix el Conveni de la Construcció de Tarragona per a l'any 2026.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-xl mb-1 text-slate-800">Nova Sol·licitud</h3>
            <p className="text-sm text-slate-500 mb-6">Demana vacances o permisos especials.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tipus de permís</label>
                <select className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newVacation.type} onChange={e => setNewVacation({...newVacation, type: e.target.value as any})}>
                  <option>Vacances</option>
                  <option>Assumptes Propis</option>
                  <option>Baixa</option>
                  <option>Permís Retribuït</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Data Inici</label>
                  <input type="date" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newVacation.startDate} onChange={e => setNewVacation({...newVacation, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Data Final</label>
                  <input type="date" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={newVacation.endDate} onChange={e => setNewVacation({...newVacation, endDate: e.target.value})} />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel·lar</button>
                <button onClick={() => { onAddVacation(newVacation); setShowModal(false); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Enviar Sol·licitud</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
