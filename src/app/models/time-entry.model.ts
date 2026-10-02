import { User } from './user.model';
import { Task } from './task.model';

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  theoDuration: number; // in minutes
  realDuration: number; // in minutes
  description?: string;
  date: Date;
  taskId: string;
  task?: Task;
  userId: string;
  user?: User;
}

export interface CreateTimeEntryRequest {
  startTime: string;
  endTime: string;
  theoDuration: number;
  realDuration: number;
  description?: string;
  date?: string;
  taskId: string;
}

export interface UpdateTimeEntryRequest {
  startTime?: string;
  endTime?: string;
  theoDuration?: number;
  realDuration?: number;
  description?: string;
  date?: string;
}

export interface TimeEntrySummary {
  totalTheoDuration: number;
  totalRealDuration: number;
  entriesCount: number;
}
