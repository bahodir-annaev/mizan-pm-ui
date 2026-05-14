// ─── Response Envelope ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  errors?: ApiError[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Enums (string unions matching backend) ──────────────────────────────────

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus = 'PLANNING' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INFRASTRUCTURE' | 'INDUSTRIAL' | 'OTHER';
export type ProjectSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
export type ComplexityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type WorkType =
  | 'architecture'
  | 'interior_design'
  | 'exterior_design'
  | 'landscape'
  | 'working_drawings'
  | '3d_visualization'
  | 'author_supervision'
  | 'documentation'
  | 'engineering'
  | 'client_coordination';
export type AcceptanceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISION';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type ClientType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'NGO';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'COMMENT_ADDED'
  | 'PROJECT_UPDATED'
  | 'DEADLINE_APPROACHING'
  | 'MENTION'
  | 'TIMER_STARTED';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponseDto {
  accessToken: string;
  user: ApiUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserRolePermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string | null;
  role: {
    id: string;
    name: string;
    description: string;
    isSystem: boolean;
    createdAt: string;
    permissions: UserRolePermission[];
  };
}

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  status: EmployeeStatus;
  orgId?: string | null;
  department?: string | null;
  location?: string | null;
  joinDate?: string | null;
  skills?: string[] | null;
  performance?: number | null;
  preferences?: Record<string, unknown> | null;
  isActive: boolean;
  lastActiveAt?: string | null;
  roles?: string[];
  userRoles?: UserRole[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  position?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  roles?: string[];
  location?: string;
  joinDate?: string;
  skills?: string[];
  performance?: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesDto {
  theme?: string;
  language?: string;
  notifications?: boolean;
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface ApiOrganization {
  id: string;
  name: string;
  budgetLimit?: number;
  createdAt: string;
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface ApiTeam {
  id: string;
  name: string;
  code?: string;
  description?: string;
  orgId: string;
  createdBy?: string;
  creator?: ApiUser;
  memberships?: ApiTeamMember[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'member';

export interface ApiTeamMember {
  id: string;
  userId: string;
  teamId: string;
  /** Field name in TeamMemberResponseDto (request body uses teamRole) */
  teamRole: TeamRole;
  joinedAt: string;
  user?: ApiUser;
  // legacy
  role: TeamRole;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  projectType?: ProjectType;
  size?: ProjectSize;
  complexity?: ComplexityLevel;
  progress: number; // 0–100
  areaSqm?: number;
  startDate?: string; // ISO date
  dueDate?: string; // ISO date
  budget?: number;
  isPinned: boolean;
  orgId: string;
  clientId?: string;
  client?: ApiClient;
  members?: ApiProjectMember[];
  code?: string;
  parentId?: string | null;
  teamId?: string | null;
  team?: ApiTeam;
  priority?: string | null;
  estimatedDuration?: string | null;
  color?: string | null;
  isArchived?: boolean;
  createdBy?: string;
  creator?: ApiUser;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProjectMember {
  userId: string;
  projectId: string;
  role: string;
  user: ApiUser;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
  projectType?: ProjectType;
  size?: ProjectSize;
  complexity?: ComplexityLevel;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  clientId?: string;
  areaSqm?: number;
  teamId?: string;
  parentId?: string;
  priority?: string;
  estimatedDuration?: string;
  color?: string;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  progress?: number;
  isPinned?: boolean;
}

export type TeamAssignmentStatus = 'pending' | 'active' | 'completed';

export interface ApiTeamAssignment {
  id: string;
  projectId: string;
  teamId: string;
  team?: ApiTeam;
  status: TeamAssignmentStatus;
  notes?: string | null;
  activatedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamAssignmentDto {
  teamId: string;
  notes?: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  workType?: WorkType;
  acceptance?: AcceptanceStatus;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  projectId: string;
  teamId?: string | null;
  team?: ApiTeam;
  parentId?: string;
  assignee?: ApiUser;
  assignees?: ApiUser[];
  participants?: { user: ApiUser }[];
  subtasks?: ApiTask[];
  code?: string;
  assigneeId?: string | null;
  completedAt?: string | null;
  materializedPath?: string;
  depth?: number;
  position?: number;
  createdBy?: string;
  creator?: ApiUser;
  project?: ApiProject;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Task Filter & Sort Params (for future filter UI) ────────────────────────
// These map directly to query params accepted by GET /tasks
export interface TaskFilterParams {
  // Tree depth — how many levels of children to pre-load (default 2 on the backend)
  depth?: number;
  // Filtering
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  workType?: WorkType | WorkType[];
  search?: string;
  dueDateFrom?: string; // ISO date string
  dueDateTo?: string;
  startDateFrom?: string;
  startDateTo?: string;
  // Sorting
  sortBy?: 'title' | 'priority' | 'status' | 'dueDate' | 'startDate' | 'createdAt' | 'progress';
  order?: 'asc' | 'desc';
  // Pagination
  page?: number;
  limit?: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  workType?: WorkType;
  startDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  projectId: string;
  parentId?: string;
  assigneeId?: string;
  participantIds?: string[];
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  progress?: number;
  acceptance?: AcceptanceStatus;
  actualHours?: number;
}

export interface MoveTaskDto {
  parentId?: string | null;
  position?: number;
}

export interface AssignTaskDto {
  userIds: string[];
}

// ─── Task Features ────────────────────────────────────────────────────────────

export interface ApiChecklistItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiComment {
  id: string;
  taskId: string;
  userId: string;
  user: ApiUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTaskDependency {
  id: string;
  taskId: string;
  dependsOnId: string;
  dependsOn: ApiTask;
}

// ─── Time Tracking ────────────────────────────────────────────────────────────

export interface ApiTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  user?: ApiUser;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  description?: string;
  isManual?: boolean;
  isBillable?: boolean;
  projectId?: string | null;
  date?: string | null;
  hours?: number | null;
  createdAt: string;
}

export interface CreateTimeEntryDto {
  taskId: string;
  startTime: string;
  endTime?: string;
  description?: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface ApiClient {
  id: string;
  name: string;
  clientType: ClientType;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  isFavorite: boolean;
  orgId: string;
  contacts?: ApiContact[];
  notes?: string | null;
  group?: string | null;
  createdBy?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiContact {
  id: string;
  clientId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface CreateClientDto {
  name: string;
  clientType: ClientType;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

// ─── File ─────────────────────────────────────────────────────────────────────

export interface ApiFileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedById: string;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface ApiNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  teamSize: number;
  budgetUsed: number;
  budgetTotal: number;
}

export interface BudgetOverview {
  limit: number;
  used: number;
  remaining: number;
  projectBreakdown: Array<{ projectId: string; projectName: string; budget: number }>;
}

// ─── Analytics Charts ─────────────────────────────────────────────────────────

export interface TaskCompletionPoint {
  date: string;
  completed: number;
  hours: number;
}

export type TaskCompletionData = TaskCompletionPoint[];

export interface TaskDistributionItem {
  name: string;
  value: number;
}

export type TaskDistributionData = TaskDistributionItem[];

export interface TimeByProjectItem {
  name: string;
  hours: number;
  tasks: number;
}

export type TimeByProjectData = TimeByProjectItem[];

export interface TimeByTypeItem {
  name: string;
  hours: number;
  tasks: number;
}

export type TimeByTypeData = TimeByTypeItem[];

export interface TeamPerformanceMember {
  name: string;
  tasksCompleted: number;
  hoursLogged: number;
  performance: number;
}

export interface TeamPerformanceData {
  members: TeamPerformanceMember[];
}

export interface WeeklyProductivityPoint {
  day: string;
  tasks: number;
  hours: number;
}

export type WeeklyProductivityData = WeeklyProductivityPoint[];

export interface RecentlyCompletedTask {
  id: string;
  name: string;
  project: string;
  assignee: string;
  completedDate: string;
  timeSpent: number;
}

export type RecentlyCompletedData = RecentlyCompletedTask[];

export interface MonthlyReport {
  month: number;
  year: number;
  tasksCompleted: number;
  hoursLogged: number;
  projectsActive: number;
}

// ─── Analytics: Time Matrix ───────────────────────────────────────────────────

export interface TimeMatrixProject {
  id: string;
  name: string;
  status: string;
  type: string;
  currentTaskName: string;
  assignedUserId: string;
  assignedUserName: string;
  assignedUserInitials: string;
  assignedUserAvatarUrl: string | null;
}

export interface TimeMatrixEmployee {
  userId: string;
  userName: string;
  projects: Record<string, number[]>; // projectId → daily hours array (length = days)
}

export interface TimeMatrixResponse {
  dateRange: {
    from: string;
    to: string;
    days: number;
  };
  projects: TimeMatrixProject[];
  employees: TimeMatrixEmployee[];
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResults {
  projects: ApiProject[];
  tasks: ApiTask[];
  clients: ApiClient[];
  users: ApiUser[];
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type OverheadCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'INTERNET'
  | 'SOFTWARE_LICENSES'
  | 'OFFICE_SUPPLIES'
  | 'MARKETING'
  | 'TRAINING'
  | 'INSURANCE'
  | 'LEGAL'
  | 'OTHER';

// Exchange Rates
export interface ApiExchangeRate {
  id: string;
  orgId: string;
  rateDate: string;
  uzsPerUsd: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateExchangeRateDto {
  rateDate: string;
  uzsPerUsd: number;
  source: string;
}
export type UpdateExchangeRateDto = Partial<CreateExchangeRateDto>;

// Hourly Rates
export interface ApiHourlyRate {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}
export interface CreateHourlyRateDto {
  userId: string;
  effectiveDate: string;
  salaryUzs: number;
  bonusUzs: number;
  adminShareUzs: number;
  equipmentShareUzs: number;
  overheadShareUzs: number;
  workingHoursPerMonth: number;
  notes?: string;
}

// Overhead Costs
export interface ApiOverheadCost {
  id: string;
  orgId: string;
  periodYear: number;
  periodMonth: number;
  category: OverheadCategory;
  amountUzs: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
export interface CreateOverheadCostDto {
  periodYear: number;
  periodMonth: number;
  category: OverheadCategory;
  amountUzs: number;
  description?: string;
}
export type UpdateOverheadCostDto = Partial<CreateOverheadCostDto>;
export interface OverheadCategorySummary {
  category: string;
  total: number;
}

// Equipment
export interface ApiEquipment {
  id: string;
  orgId: string;
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
export interface CreateEquipmentDto {
  name: string;
  category: string;
  purchaseDate: string;
  purchaseCostUzs: number;
  usefulLifeMonths: number;
  residualValueUzs: number;
  serialNumber?: string;
}
export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;
export interface AmortizationSummary {
  total: number;
  itemCount: number;
}

// Project Finance
export interface ApiProjectPlan {
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
export interface CreateProjectPlanDto {
  contractValueUzs: number;
  contractValueUsd?: number;
  contractSignedDate?: string;
  riskCoefficient?: number;
  notes?: string;
}
export interface ApiProjectMonthlyCost {
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
export interface ApiPlanVsFact {
  plan: ApiProjectPlan;
  factToDateUzs: number;
  remainingUzs: number;
  burnRateUzs: number;
  estimatedFinalCostUzs: number;
}

// Finance Analytics
export interface FinanceOverviewData {
  periodYear: number;
  periodMonth: number;
  totalPayrollCostUzs: number;
  totalOverheadUzs: number;
  totalEquipmentAmortizationUzs: number;
  totalCostUzs: number;
  totalContractValueUzs: number;
  grossProfitUzs: number;
  grossMarginPct: number;
}
export interface ProjectProfitabilityItem {
  projectId: string;
  projectName: string;
  planUzs: number;
  factToDateUzs: number;
  varianceUzs: number;
  variancePct: number;
  monthsElapsed: number;
  estimatedFinalCostUzs: number;
}
export interface EmployeeCostBreakdownItem {
  userId: string;
  name: string;
  hours: number;
  costUzs: number;
  costUsd: number;
}
export interface DepartmentCostItem {
  department: string;
  costUzs: number;
  employeeCount: number;
}
