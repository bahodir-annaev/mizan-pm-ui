# Plan: Frontend Service Layer Integration

## Context
The ArchPlan backend (NestJS, 60+ endpoints, 9 modules) is complete. The React frontend at `C:\Projects\ai\Project Management Dashboard UI` was built with hardcoded mock data and no service layer, no routing library, and no authentication. We need to add the plumbing that connects them: API client, typed services, React Query hooks, auth flow, React Router, and WebSocket integration.

## Architectural Decisions

1. **Adapter/mapper layer** between backend DTOs and frontend display types (e.g. `holat`↔`progress`, `kvadratura`↔`areaSqm`, ISO dates↔display strings, enum case mapping)
2. **TanStack Query** for server state — caching, mutations, optimistic updates, cache invalidation
3. **React Router v7** replacing the `activeView` state string in App.tsx
4. **Axios** with interceptors for JWT attach, response envelope unwrap (`{ data, meta, errors }`), and automatic token refresh on 401
5. **Socket.IO client** for real-time updates, connected to TanStack Query cache invalidation
6. **Mock data extracted** to `src/mocks/` behind `VITE_USE_MOCK` env flag for offline development

---

## Phase 1: Foundation (Types, API Client, Auth, Routing)

### Install packages
```
@tanstack/react-query @tanstack/react-query-devtools axios react-router-dom socket.io-client
```

### Create new files

| File | Purpose |
|------|---------|
| `src/lib/config.ts` | `API_BASE_URL`, `WS_URL`, `USE_MOCK_DATA` from Vite env vars |
| `src/types/api.ts` | All backend-aligned types: `ApiResponse<T>` envelope, `PaginationMeta`, all enums as string unions (`ProjectStatus`, `TaskStatus`, `TaskPriority`, `ProjectType`, `ProjectSize`, `ComplexityLevel`, `WorkType`, `AcceptanceStatus`, `EmployeeStatus`, `ClientType`), all entity types (`ApiProject`, `ApiTask`, `ApiUser`, `ApiClient`, `ApiTeam`, etc.), all request DTOs |
| `src/types/domain.ts` | Frontend display types: `Project`, `Task` (replacing `Work`), `TeamMember` (replacing `Employee`), `Client`, `ContactPerson`, `TimeEntry`, `Notification` |
| `src/lib/api-client.ts` | Axios instance: JWT bearer interceptor, response envelope unwrap, 401 → refresh token → retry, error normalization |
| `src/lib/auth-storage.ts` | `getAccessToken()`, `setAccessToken()`, `clearTokens()` — access token in memory, refresh via httpOnly cookie |
| `src/lib/mappers/project.mapper.ts` | `mapApiProjectToProject()`, `mapProjectToCreateRequest()` — handles holat/kvadratura/date/status/enum mapping |
| `src/lib/mappers/task.mapper.ts` | `mapApiTaskToTask()`, `mapTaskToCreateRequest()` — assignee flattening, participant mapping, Work→Task rename |
| `src/lib/mappers/user.mapper.ts` | `mapApiUserToTeamMember()`, `getUserInitials()`, `getUserColor()` |
| `src/lib/mappers/client.mapper.ts` | `mapApiClientToClient()`, `mapClientToCreateRequest()` |
| `src/lib/mappers/index.ts` | Re-exports |
| `src/contexts/AuthContext.tsx` | `AuthProvider` + `useAuth()` hook — login, register, logout, refresh on mount, user state |
| `src/app/pages/LoginPage.tsx` | Email + password form (react-hook-form), error display |
| `src/app/pages/RegisterPage.tsx` | Registration form with orgName |
| `src/app/components/ProtectedRoute.tsx` | Auth guard → redirect to `/login` |
| `src/app/router.tsx` | React Router config: `/login`, `/register`, `/` (protected layout), `/dashboard`, `/projects`, `/projects/:id`, `/tasks`, `/analytics`, `/team`, `/clients`, `/clients/:id`, `/settings` |
| `src/app/AppLayout.tsx` | Extracted from App.tsx: Sidebar + Header + `<Outlet />`, replaces `activeView` with `useLocation()` |
| `src/app/providers.tsx` | Provider nesting: QueryClient, Auth, Translation, MediaPlayer, Overlay, Budget, Router |
| `.env` | `VITE_API_URL`, `VITE_WS_URL`, `VITE_USE_MOCK` |

### Modify existing files

| File | Changes |
|------|---------|
| `src/main.tsx` | Replace `<App />` with `<Providers><RouterProvider /></Providers>` |
| `src/app/components/App.tsx` | Remove `activeView`/`selectedProjectId` state, delegate to router |
| `src/app/components/Sidebar.tsx` | Replace `onViewChange` prop with `useNavigate()`, `useLocation()` for active state |
| `src/app/components/Header.tsx` | Replace `onNavigateToSettings` with `useNavigate()`, show user from `useAuth()` |
| `src/app/components/ProjectDetail.tsx` | Replace `projectId` prop with `useParams()`, `onBack` with `navigate('/projects')` |

---

## Phase 2: Core Services + Hooks (Projects, Tasks)

### Create new files

| File | Purpose |
|------|---------|
| `src/hooks/api/query-keys.ts` | Centralized query key factory for all domains |
| `src/services/project.service.ts` | `getProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject`, `toggleProjectPin`, `getProjectMembers`, `addProjectMember`, `removeProjectMember` |
| `src/services/task.service.ts` | `getProjectTasks`, `getProjectTaskTree`, `getTask`, `createTask`, `updateTask`, `deleteTask`, `moveTask`, assignee CRUD |
| `src/services/task-features.service.ts` | Participants, dependencies, checklist, comments CRUD |
| `src/hooks/api/useProjects.ts` | `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useToggleProjectPin`, `useProjectMembers`, `useSidebarProjects` |
| `src/hooks/api/useTasks.ts` | `useProjectTasks`, `useProjectTaskTree`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useMoveTask`, assignee hooks |
| `src/hooks/api/useTaskFeatures.ts` | Participant, dependency, checklist, comment hooks |
| `src/mocks/projects.ts` | Extracted mock data from ProjectTable.tsx, Sidebar.tsx, ProjectDetail.tsx |
| `src/mocks/tasks.ts` | Extracted mock data from WorksTable.tsx, WorksTableWrapper.tsx |

### Modify existing files

| File | Changes |
|------|---------|
| `ProjectTable.tsx` | Remove inline `Project` interface + mock array, use `useProjects()` hook, inline edits via `useUpdateProject()` |
| `WorksTableWrapper.tsx` | Remove `generateBoardTasks()`, get `projectId` from route, pass fetched tasks to child views |
| `WorksTable.tsx` | Remove `works` mock array, use `useProjectTasks()`, inline edits via `useUpdateTask()` |
| `BoardView.tsx` | Accept tasks from props instead of mock data |
| `GanttView.tsx` | Accept tasks from props instead of mock data |
| `AddProjectModal.tsx` | Wire to `useCreateProject()` mutation |
| `AddTaskModal.tsx` | Wire to `useCreateTask()` mutation |

### Key patterns
- Optimistic updates for task status drag-and-drop (cancel queries → update cache → rollback on error)
- Sidebar shares project cache via same query key (no duplicate fetch)
- Task hierarchy: backend tree endpoint → recursive mapper to flat-with-subtasks format

---

## Phase 3: Supporting Modules (Teams, Clients, Users, Time, Files, Budget)

### Create new files

| File | Purpose |
|------|---------|
| `src/services/team.service.ts` | Teams CRUD + member management |
| `src/services/user.service.ts` | Users CRUD + profile + preferences + roles |
| `src/services/client.service.ts` | Clients CRUD + contacts + favorites |
| `src/services/time-tracking.service.ts` | Timer start/stop, manual entries, my time, project report |
| `src/services/file.service.ts` | File upload/download/delete for projects and clients |
| `src/services/budget.service.ts` | `getBudgetOverview()`, `updateBudgetLimit()` |
| `src/hooks/api/useTeams.ts` | Team + member hooks |
| `src/hooks/api/useUsers.ts` | User + profile hooks |
| `src/hooks/api/useClients.ts` | Client + contact hooks |
| `src/hooks/api/useTimeTracking.ts` | Timer + entries hooks |
| `src/hooks/api/useFiles.ts` | File upload/list hooks |
| `src/hooks/api/useBudget.ts` | Budget overview + update hooks |
| `src/lib/mappers/time-entry.mapper.ts` | Time entry transformations |
| `src/mocks/employees.ts` | Extracted from TeamDashboard.tsx |
| `src/mocks/clients.ts` | Extracted from Clients.tsx |

### Modify existing files

| File | Changes |
|------|---------|
| `BudgetContext.tsx` | Replace local state with `useBudgetOverview()` + project budget from `useProjects()`, keep `useBudget()` API |
| `TeamDashboard.tsx` | Remove mock employees, use `useUsers()` + time aggregation hooks |
| `TeamManagement.tsx` | Wire to `useTeams()`, member CRUD hooks |
| `Clients.tsx` | Remove mock array, use `useClients({ search })` |
| `EmployeeProfile.tsx` | Use `useUser(id)`, `useUpdateUser()` |
| `BudgetDisplay.tsx` | Use `useBudget()` context (now backed by API) |

---

## Phase 4: Advanced Features (Analytics, Notifications, Search, WebSocket)

### Create new files

| File | Purpose |
|------|---------|
| `src/services/analytics.service.ts` | 9 analytics endpoints |
| `src/services/notification.service.ts` | Notifications list + unread count + mark read |
| `src/services/search.service.ts` | Global search |
| `src/hooks/api/useAnalytics.ts` | One hook per analytics chart (5min staleTime) |
| `src/hooks/api/useNotifications.ts` | List + unread count (poll fallback if WS down) |
| `src/hooks/api/useSearch.ts` | `useGlobalSearch()` with debounce, enabled when query >= 2 chars |
| `src/lib/websocket.ts` | Socket.IO manager: connect/disconnect with JWT, room join/leave |
| `src/hooks/useWebSocket.ts` | React hook wrapping WS connection state |
| `src/hooks/useRealtimeUpdates.ts` | Listens to WS events → invalidates TanStack Query caches |
| `src/app/components/NotificationBell.tsx` | Unread badge + dropdown in Header |
| `src/app/components/GlobalSearch.tsx` | Command palette search, results grouped by type |

### Modify existing files

| File | Changes |
|------|---------|
| `AnalyticsDashboard.tsx` | Remove all mock chart data, use analytics hooks, add loading/error per section |
| `Header.tsx` | Add NotificationBell + GlobalSearch, user name from useAuth() |
| `AuthContext.tsx` | Connect/disconnect WebSocket on login/logout |
| `AppLayout.tsx` | Initialize `useRealtimeUpdates()` at layout level |

---

## Phase 5: Final Component Migration + Cleanup

Replace remaining mock data in all components:

- `ProjectDetail.tsx` — `useProject(id)`, `useProjectTasks(id)`, `useProjectFiles(id)`, `useProjectMembers(id)`
- `TaskDetailModal.tsx` / `TaskDetailPage.tsx` — `useTask(id)`, `useTaskChecklist(id)`, `useTaskComments(id)`, `useTaskParticipants(id)`, `useTaskDependencies(id)`
- `Sidebar.tsx` — `useSidebarProjects()` from shared cache
- `FilterBar.tsx` — wire controls to query params
- `EditableProjectCell.tsx` / `EditableWorkCell.tsx` — inline saves via mutations
- `Settings.tsx` — `useUpdatePreferences()`, `useChangePassword()`
- Create `<QueryWrapper>` component for consistent loading/error/data states
- Add prefetching on hover for project/task details
- Delete or feature-flag `src/mocks/` directory

---

## Key Field Mappings

| Frontend | Backend | Transform |
|----------|---------|-----------|
| `Project.holat` | `Project.progress` | Direct number |
| `Project.kvadratura` | `Project.areaSqm` | `number` → `"1250 m²"` |
| `Project.dateStart/End` `'12 Jan 2024'` | `startDate/dueDate` ISO | `format(parseISO(d), 'dd MMM yyyy')` |
| `Project.status` `'In Progress'` | `IN_PROGRESS` enum | Display map |
| `Work` interface | `Task` entity | Rename + restructure |
| `Work.assignee {name,initials,color}` | `Task.assignee: User` | Compute initials + deterministic color |
| `Employee` | `User` | `name = firstName+lastName`, `role = position` |
| `Client.id` (number) | `Client.id` (UUID) | Type change |
| `Client.contactPerson` | `contacts[0]?.name` | First contact from array |

---

## Backend API Endpoint Catalog (60+ endpoints)

### Identity
```
POST   /api/v1/auth/register          RegisterDto → TokenResponseDto
POST   /api/v1/auth/login             LoginDto → TokenResponseDto
POST   /api/v1/auth/refresh           cookie → TokenResponseDto
POST   /api/v1/auth/logout            → void
POST   /api/v1/auth/forgot-password   ForgotPasswordDto → message
POST   /api/v1/auth/reset-password    ResetPasswordDto → message
POST   /api/v1/users                  CreateUserDto → User
GET    /api/v1/users                  PaginationDto → PaginatedResult<User>
GET    /api/v1/users/me               → User
PATCH  /api/v1/users/me/password      ChangePasswordDto → message
GET    /api/v1/users/:id              → User
PATCH  /api/v1/users/:id              UpdateUserDto → User
PATCH  /api/v1/users/:id/status       UpdateUserStatusDto → User
PUT    /api/v1/users/:id/preferences  UpdatePreferencesDto → User
DELETE /api/v1/users/:id              → 204
GET    /api/v1/users/:id/roles        → UserRole[]
POST   /api/v1/users/:id/roles        AssignRoleDto → UserRole
DELETE /api/v1/users/:id/roles/:roleId → 204
```

### Organization
```
GET    /api/v1/organizations/:id      → Organization
PATCH  /api/v1/organizations/:id      UpdateOrgDto → Organization
DELETE /api/v1/organizations/:id      → 204
POST   /api/v1/teams                  CreateTeamDto → Team
GET    /api/v1/teams                  PaginationDto → PaginatedResult<Team>
GET    /api/v1/teams/:id              → Team
PATCH  /api/v1/teams/:id              UpdateTeamDto → Team
DELETE /api/v1/teams/:id              → 204
GET    /api/v1/teams/:id/members      → TeamMember[]
POST   /api/v1/teams/:id/members      AddTeamMemberDto → TeamMember
PATCH  /api/v1/teams/:id/members/:userId UpdateRoleDto → TeamMember
DELETE /api/v1/teams/:id/members/:userId → 204
```

### Project Management
```
POST   /api/v1/projects               CreateProjectDto → Project
GET    /api/v1/projects               ProjectFilterDto → PaginatedResult<Project>
GET    /api/v1/projects/:id           → Project
PATCH  /api/v1/projects/:id           UpdateProjectDto → Project
PATCH  /api/v1/projects/:id/pin       → Project
DELETE /api/v1/projects/:id           → 204
GET    /api/v1/projects/:id/members   → ProjectMember[]
POST   /api/v1/projects/:id/members   → ProjectMember
DELETE /api/v1/projects/:id/members/:userId → 204
GET    /api/v1/projects/:projectId/tasks TaskFilterDto → PaginatedResult<Task>
GET    /api/v1/projects/:projectId/tasks/tree → TaskTree
POST   /api/v1/tasks                  CreateTaskDto → Task
GET    /api/v1/tasks/:id              → Task
PATCH  /api/v1/tasks/:id              UpdateTaskDto → Task
DELETE /api/v1/tasks/:id              → 204
GET    /api/v1/tasks/:id/children     → Task[]
GET    /api/v1/tasks/:id/subtree      → Task[]
PATCH  /api/v1/tasks/:id/move         MoveTaskDto → Task
GET    /api/v1/tasks/:id/assignees    → TaskAssignee[]
POST   /api/v1/tasks/:id/assignees    AssignTaskDto → TaskAssignee[]
DELETE /api/v1/tasks/:id/assignees/:userId → 204
```

### Task Features
```
GET    /api/v1/tasks/:id/participants  → Participant[]
POST   /api/v1/tasks/:id/participants  → Participant
DELETE /api/v1/tasks/:id/participants/:userId → 204
GET    /api/v1/tasks/:id/dependencies  → TaskDependency[]
POST   /api/v1/tasks/:id/dependencies  → TaskDependency
DELETE /api/v1/tasks/:id/dependencies/:depId → 204
GET    /api/v1/tasks/:id/checklist     → ChecklistItem[]
POST   /api/v1/tasks/:id/checklist     CreateChecklistItemDto → ChecklistItem
PATCH  /api/v1/tasks/:id/checklist/reorder → ChecklistItem[]
PATCH  /api/v1/tasks/:id/checklist/:itemId UpdateChecklistItemDto → ChecklistItem
DELETE /api/v1/tasks/:id/checklist/:itemId → 204
GET    /api/v1/tasks/:id/comments      PaginationDto → PaginatedResult<Comment>
POST   /api/v1/tasks/:id/comments      CreateCommentDto → Comment
PATCH  /api/v1/tasks/:id/comments/:commentId UpdateCommentDto → Comment
DELETE /api/v1/tasks/:id/comments/:commentId → 204
```

### Time Tracking
```
GET    /api/v1/tasks/:taskId/time      TimeEntryFilterDto → PaginatedResult<TimeEntry>
POST   /api/v1/tasks/:taskId/time/start → TimeEntry
POST   /api/v1/tasks/:taskId/time/stop  → TimeEntry
POST   /api/v1/time-entries            CreateTimeEntryDto → TimeEntry
PATCH  /api/v1/time-entries/:id        UpdateTimeEntryDto → TimeEntry
DELETE /api/v1/time-entries/:id        → 204
GET    /api/v1/users/me/time           TimeEntryFilterDto → PaginatedResult<TimeEntry>
GET    /api/v1/users/me/time/active    → ActiveTimer | null
GET    /api/v1/projects/:id/time-report → ProjectTimeReport
```

### Client
```
GET    /api/v1/clients                 PaginationDto + search/group → PaginatedResult<Client>
GET    /api/v1/clients/:id             → Client
POST   /api/v1/clients                 CreateClientDto → Client
PATCH  /api/v1/clients/:id             UpdateClientDto → Client
DELETE /api/v1/clients/:id             → 204
PATCH  /api/v1/clients/:id/favorite    → Client
GET    /api/v1/clients/:id/projects    → Project[]
GET    /api/v1/clients/:id/contacts    → Contact[]
POST   /api/v1/clients/:id/contacts    CreateContactDto → Contact
PATCH  /api/v1/clients/:id/contacts/:contactId UpdateContactDto → Contact
DELETE /api/v1/clients/:id/contacts/:contactId → 204
```

### Files
```
GET    /api/v1/files/:id               → FileMetadata
DELETE /api/v1/files/:id               → 204
GET    /api/v1/projects/:id/files      → FileMetadata[]
POST   /api/v1/projects/:id/files      multipart → FileMetadata
GET    /api/v1/clients/:id/files       → FileMetadata[]
POST   /api/v1/clients/:id/files       multipart → FileMetadata
```

### Analytics & Budget
```
GET    /api/v1/analytics/overview               → AnalyticsOverview
GET    /api/v1/analytics/task-completion?days=30 → TaskCompletionData
GET    /api/v1/analytics/task-distribution       → TaskDistributionData
GET    /api/v1/analytics/team-performance        → TeamPerformanceData
GET    /api/v1/analytics/time-by-project         → TimeByProjectData
GET    /api/v1/analytics/time-by-type            → TimeByTypeData
GET    /api/v1/analytics/weekly-productivity     → WeeklyProductivityData
GET    /api/v1/analytics/monthly-report?year=&month= → MonthlyReport
GET    /api/v1/analytics/recently-completed?limit=10 → RecentlyCompleted
GET    /api/v1/budget                            → BudgetOverview
PATCH  /api/v1/budget/limit                      → Organization
```

### Notifications
```
GET    /api/v1/notifications           PaginationDto → PaginatedResult<Notification>
GET    /api/v1/notifications/unread-count → { count }
PATCH  /api/v1/notifications/read-all  → message
PATCH  /api/v1/notifications/:id/read  → Notification
```

### Search
```
GET    /api/v1/search?q=&type=&limit=&offset= → SearchResults
```

### WebSocket (Socket.IO)
```
Connection: JWT in handshake.auth.token
Auto-join: user:{userId}, org:{orgId}
Client→Server: join:project, leave:project
Server→Client: task:created, task:updated, task:deleted, project:created, project:updated, time:logged
```

---

## Verification
1. `npm run dev` — app loads, login page renders
2. Start backend (`docker-compose up` or `npm run start:dev`)
3. Register a user → redirected to dashboard
4. Navigate projects/tasks/team/clients — data loads from API
5. Create/edit/delete operations persist
6. WebSocket: open two tabs, edit in one → updates in other
7. Search, notifications, analytics all load real data

## Summary
~48 new files, ~40 modified files across 5 incremental phases
