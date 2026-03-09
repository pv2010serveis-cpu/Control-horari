
import { Holiday } from './types';

export const HOLIDAYS_2026: Holiday[] = [
  // Festius Oficials (Vermell)
  { date: '2026-01-01', name: "Any nou", type: 'Official' },
  { date: '2026-01-06', name: 'Reis', type: 'Official' },
  { date: '2026-04-03', name: 'Divendres Sant', type: 'Official' },
  { date: '2026-04-06', name: 'Dilluns de Pasqua', type: 'Official' },
  { date: '2026-05-01', name: 'Festa del Treball', type: 'Official' },
  { date: '2026-06-24', name: 'Sant Joan', type: 'Official' },
  { date: '2026-08-15', name: "L'Assumpció", type: 'Official' },
  { date: '2026-09-11', name: 'Diada Nacional de Catalunya', type: 'Official' },
  { date: '2026-10-12', name: 'Dia de la Hispanitat', type: 'Official' },
  { date: '2026-12-08', name: 'La Immaculada', type: 'Official' },
  { date: '2026-12-25', name: 'Nadal', type: 'Official' },
  { date: '2026-12-26', name: 'Sant Esteve', type: 'Official' },
  
  // Festes Conveni (Groc)
  { date: '2026-01-02', name: 'Conveni', type: 'Conveni' },
  { date: '2026-01-05', name: 'Conveni', type: 'Conveni' },
  { date: '2026-03-31', name: 'Conveni', type: 'Conveni' },
  { date: '2026-12-07', name: 'Conveni', type: 'Conveni' },
  { date: '2026-12-24', name: 'Conveni', type: 'Conveni' },
  { date: '2026-12-31', name: 'Conveni', type: 'Conveni' },

  // Vacances Agost (Blau) - 3 al 31 (excepte festius i caps de setmana)
  ...Array.from({ length: 29 }, (_, i) => {
    const day = i + 3;
    const dateStr = `2026-08-${day.toString().padStart(2, '0')}`;
    const date = new Date(dateStr);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isOfficial = dateStr === '2026-08-15';
    if (!isWeekend && !isOfficial) {
      return { date: dateStr, name: 'Vacances Conveni', type: 'Vacances' } as Holiday;
    }
    return null;
  }).filter((h): h is Holiday => h !== null)
];

export const WORK_HOURS_PER_DAY = 8;

export const WAREHOUSE_COORDS = { lat: 41.183029, lng: 1.448260 };
export const GEOFENCE_RADIUS_METERS = 500;
