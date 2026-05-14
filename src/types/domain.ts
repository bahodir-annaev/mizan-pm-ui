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
  teamId?: string;
  teamName?: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  code?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberDetail {
  membershipId: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  name: string;
  email: string;
  position?: string;
  avatarUrl?: string;
  initials: string;
  color: string;
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
  teamId?: string;
  teamName?: string;
  parentId?: string | null;
  depth?: number; // 0 = root task
  position?: number; // sort order among siblings
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

export interface TreeTask extends Task {
  children: TreeTask[];
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
  orgRole: 'owner' | 'admin' | 'manager' | 'member' | 'viewer'; // org-level role
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

// ─── Finance Domain Types ──────────────────────────────────────────────────────

export interface ExchangeRate {
  id: string;
  rateDate: string;
  uzsPerUsd: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface HourlyRate {
  id: string;
  userId: string;
  userName: string;       // joined from user
  userInitials: string;
  userColor: string;
  effectiveDate: string;
  salaryUzs: number;
  bonusUzs: number;
  taxUzs: number;
  jssmUzs: number;
  adminShareUzs: number;
  equipmentShareUzs: number;
  overheadShareUzs: number;
  totalMonthlyCostUzs: number;
  hourlyRateUzs: number;
  hourlyRateUsd: number;
  exchangeRateUsed: number;
  productionEmployeeCount: number;
  workingHoursPerMonth: number;
  notes?: string;
  isCronGenerated: boolean; // true when notes is absent (auto-created by cron)
  createdAt: string;
}

export interface OverheadCost {
  id: string;
  periodYear: number;
  periodMonth: number;
  category: string;
  amountUzs: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseCostUzs: number;
  usefulLifeMonths: number;
  residualValueUzs: number;
  monthlyAmortizationUzs: number;
  isActive: boolean;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPlan {
  id: string;
  projectId: string;
  version: number;
  isCurrent: boolean;
  contractValueUzs: number;
  contractValueUsd?: number;
  contractSignedDate?: string;
  plannedHoursTotal: number;
  avgHourlyRateUzs: number;
  riskCoefficient: number;
  mizanCostUzs: number;
  plannedProfitUzs: number;
  plannedMarginPct: number;
  exchangeRateAtSigning: number;
  notes?: string;
  createdAt: string;
}

export interface ProjectMonthlyCost {
  id: string;
  projectId: string;
  year: number;
  month: number;
  totalHours: number;
  totalCostUzs: number;
  totalCostUsd: number;
  employeeCount: number;
  isFinalized: boolean;
}

export interface PlanVsFact {
  plan: ProjectPlan;
  factToDateUzs: number;
  remainingUzs: number;
  burnRateUzs: number;
  estimatedFinalCostUzs: number;
}

export interface TaskFilters {
  search: string;
  project: string | null;
  status: string | null;
  assignee: string | null;
  priority: string | null;
  dueDate: 'today' | 'week' | 'overdue' | null;
  workTypes: string[];
}
