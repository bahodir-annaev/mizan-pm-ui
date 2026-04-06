// ─── Frontend Display Types ───────────────────────────────────────────────────
// These are the types used by UI components after mapping from API types.

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string; // Display string e.g. 'In Progress'
  statusKey: string; // Backend enum e.g. 'IN_PROGRESS'
  type?: string;
  size?: string; // e.g. 'Large', 'Medium', 'Small'
  complexity?: string; // e.g. 'High', 'Medium', 'Low'
  duration?: string; // e.g. '8-10 weeks' (display only)
  progress: number; // 0–100
  holat: number; // alias for progress (legacy UI compat)
  areaSqm?: number;
  kvadratura?: string; // Formatted e.g. '1250 m²'
  startDate?: string; // Display e.g. '12 Jan 2024'
  dueDate?: string;
  dateStart?: string; // alias for startDate
  dateEnd?: string; // alias for dueDate
  budget?: number;
  isPinned: boolean;
  clientId?: string;
  clientName?: string;
  client?: string; // alias for clientName (legacy component compat)
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string; // Display string
  statusKey: string; // Backend enum
  priority: string; // Display string
  priorityKey: string; // Backend enum
  workType?: string;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  code?: string;
  projectId: string;
  parentId?: string;
  assignee?: TaskAssignee;
  participants?: TaskAssignee[];
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
  // Legacy aliases for component compatibility
  project?: Project; // alias for projectId
  dateStart?: string; // alias for startDate
  dateEnd?: string; // alias for dueDate
  acceptance?: string; // alias for acceptanceStatus
  volume?: string;
  unit?: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string; // firstName + lastName
  firstName: string;
  lastName: string;
  email: string;
  role: string; // position or team role
  position?: string;
  phone?: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  status: string;
  orgId?: string | null;
}

export interface Client {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  isFavorite: boolean;
  contactPerson?: string; // First contact's name
  contactEmail?: string;
  contactPhone?: string;
  projectCount?: number;
  createdAt: string;
}

export interface ContactPerson {
  id: string;
  clientId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  description?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  entityId?: string;
  entityType?: string;
  createdAt: string;
  timeAgo: string; // Computed e.g. '2 hours ago'
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string; // firstName + ' ' + lastName
  initials: string;
  color: string;
  position?: string;
  orgId: string;
  roles?: string[];
}
