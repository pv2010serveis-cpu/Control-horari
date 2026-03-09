
export enum ClockType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface ClockEntry {
  id: string;
  employeeCode: string;
  employeeName: string;
  type: ClockType;
  timestamp: number;
  syncStatus?: 'Pendent' | 'Sincronitzat' | 'Error';
  location?: {
    lat: number;
    lng: number;
  };
  locationName?: string;
}

export interface VacationRequest {
  id: string;
  employeeCode: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: 'Pendent' | 'Aprovada' | 'Denegada';
  type: 'Vacances' | 'Assumptes Propis' | 'Baixa';
}

export interface Holiday {
  date: string;
  name: string;
  type: 'Official' | 'Conveni' | 'Vacances';
}

export type ViewType = 'dashboard' | 'calendar' | 'reports' | 'settings' | 'admin';

export interface UserState {
  employeeCode: string | null;
  employeeName: string | null;
  isAuthenticated: boolean;
  sheetsUrl?: string;
  isAdmin?: boolean;
}
