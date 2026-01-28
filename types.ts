
export type EntryType = 'IN' | 'OUT';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  type: EntryType;
  location?: LocationData;
  locationLabel?: string;
  synced?: boolean; // Nou camp per control de sincronització
}

export interface VacationRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface User {
  id: string;
  name: string;
  pin: string;
  role: 'EMPLOYEE' | 'ADMIN';
}
