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
export type WorkType = 'architecture' | 'interior_design' | 'exterior_design' | 'landscape' | 'working_drawings' | '3d_visualization' | 'author_supervision' | 'documentation' | 'engineering' | 'client_coordination';
export type AcceptanceStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISION';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
export type ClientType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'NGO';
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'COMMENT_ADDED' | 'PROJECT_UPDATED' | 'DEADLINE_APPROACHING' | 'MENTION';

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

export interface UserRole {
  role: string;
  permissions: string[];
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
  id?: string;
  userId: string;
  teamId: string;
  teamRole: TeamRole;
  joinedAt?: string;
  user: ApiUser;
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
  dueDate?: string;   // ISO date
  budget?: number;
  isPinned: boolean;
  orgId: string;
  clientId?: string;
  client?: ApiClient;
  members?: ApiProjectMember[];
  code?: string;
  parentId?: string | null;
  teamId?: string | null;
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
  parentId?: string;
  assignee?: ApiUser;
  assignees?: ApiUser[];
  participants?: ApiUser[];
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
  // Filtering
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  workType?: WorkType | WorkType[];
  search?: string;
  dueDateFrom?: string;  // ISO date string
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

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResults {
  projects: ApiProject[];
  tasks: ApiTask[];
  clients: ApiClient[];
  users: ApiUser[];
}
