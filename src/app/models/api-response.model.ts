export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  overview: {
    totalProjects: number;
    totalTasks: number;
    totalUsers: number | null;
    totalTimeEntries: number;
  };
  tasksByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  recentActivity: {
    tasksCreatedLast7Days: number;
    timeEntriesLast7Days: number;
  };
}

export interface ProjectAnalytics {
  project: {
    id: string;
    name: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    membersCount: number;
  };
  taskStats: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    overdue: number;
    completionRate: number;
  };
  timeTracking: {
    totalTheoDuration: number;
    totalRealDuration: number;
    efficiency: number;
    entriesCount: number;
  };
  chatMessages: number;
}

export interface UserWorkload {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  taskStats: {
    total: number;
    byStatus: Record<string, number>;
    overdue: number;
  };
  timeTracking: {
    totalTheoDuration: number;
    totalRealDuration: number;
    efficiency: number;
  };
  projects: {
    count: number;
    list: Array<{ id: string; name: string; status: string }>;
  };
}
