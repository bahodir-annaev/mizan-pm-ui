# Plan: Align Service Layer with REST API (Swagger @ localhost:3000)

## Context
The app has a fully-built service/hook layer (`src/services/`, `src/hooks/api/`) that was written against assumed API shapes. The real backend (NestJS, 79 endpoints) is now running. Multiple enum values, request body field names, endpoint paths, and missing endpoints need to be corrected. Two new service domains (Activity, Organization) must be added.

---

## Step 1 — Update `src/types/api.ts` (enum + interface corrections)

### Enum value changes (align to API literals):
| Enum | Current values | New values |
|------|---------------|------------|
| `ProjectStatus` | `PLANNING \| IN_PROGRESS \| ON_HOLD \| COMPLETED \| CANCELLED` | `start \| in_progress \| burning \| end \| late` |
| `ProjectType` | `RESIDENTIAL \| COMMERCIAL \| INFRASTRUCTURE \| INDUSTRIAL \| OTHER` | `interior \| residential \| commercial` |
| `ProjectSize` | `SMALL \| MEDIUM \| LARGE \| ENTERPRISE` | `small \| medium \| large` |
| `ComplexityLevel` | `LOW \| MEDIUM \| HIGH \| VERY_HIGH` | `low \| medium \| high` |
| `EmployeeStatus` | `ACTIVE \| INACTIVE \| ON_LEAVE \| TERMINATED` | `working \| idle \| offline` |
| `ClientType` | `INDIVIDUAL \| COMPANY \| GOVERNMENT \| NGO` | `organization \| person` |

### New enum to add:
```ts
export type TeamRole = 'owner' | 'admin' | 'member';
```

### New/updated interfaces:
- `ApiActivity` — `{ id, action, entityType, entityId, entityName, actorId, actor: ApiUser, metadata?, createdAt }`
- `ApiOrganization` — `{ id, name, logoUrl?, budgetLimit?, settings?, createdAt, updatedAt }`
- `ApiProjectMember` — `{ userId, user: ApiUser, role: string, joinedAt }`
- `AssignProjectMemberDto` — `{ userId: string, role?: string }`
- `UpdateBudgetLimitDto` — `{ limit: number }`
- `ActivityFilter` — `{ page?, limit?, action?, entityType? }`
- Update `AddTeamMemberDto`: `teamRole?: TeamRole` (was `role?`)
- Update `UpdateTeamMemberRoleDto`: `teamRole: TeamRole`
- Update `ApiChecklistItem`: rename `text` → `title`
- Update `ApiComment`: rename `text` → `content`
- Update `CreateChecklistItemDto`: `title` (not `text`)
- Update `UpdateChecklistItemDto`: `title?` (not `text?`)
- Update `CreateCommentDto`: `content` (not `body`)
- Add `UpdateCommentDto`: `{ content: string }`
- Add `ReorderChecklistDto`: `{ itemIds: string[] }`
- Update `AddDependencyDto`: `blockerId` (was `dependsOnId`)
- Add `MoveTaskDto`: `{ parentId?: string | null, position?: number }`
- Add `AssignTaskDto`: `{ userIds: string[] }`

---

## Step 2 — Fix `src/services/task-features.service.ts`

**Field name fixes:**
- `createChecklistItem` body: `text` → `title`
- `updateChecklistItem` body: `text?` → `title?`
- `createComment` body: `{ body }` → `{ content }`
- `addDependency` body: `{ dependsOnId }` → `{ blockerId }`

**Add missing functions:**
- `updateComment(taskId, commentId, dto: UpdateCommentDto)` → `PATCH /tasks/{id}/comments/{commentId}`
- `reorderChecklist(taskId, dto: ReorderChecklistDto)` → `PATCH /tasks/{id}/checklist/reorder`

---

## Step 3 — Fix `src/services/task.service.ts`

**Add missing functions:**
- `getProjectTaskTree(projectId)` → `GET /projects/{projectId}/tasks/tree`
- `getTaskChildren(id)` → `GET /tasks/{id}/children`
- `getTaskSubtree(id)` → `GET /tasks/{id}/subtree`
- `moveTask(id, dto: MoveTaskDto)` → `PATCH /tasks/{id}/move`
- `getTaskAssignees(id)` → `GET /tasks/{id}/assignees`
- `assignUsersToTask(id, dto: AssignTaskDto)` → `POST /tasks/{id}/assignees`
- `unassignUserFromTask(id, userId)` → `DELETE /tasks/{id}/assignees/{userId}`

**Fix existing:**
- `getProjectTasks(projectId, params?)` — add `{ page?, limit? }` query params

---

## Step 4 — Fix `src/services/project.service.ts`

**Fix existing:**
- `createProject` DTO field `type` → `projectType`
- `getProjects()` → add `{ page?, limit? }` query params

**Add missing functions:**
- `addProjectMember(id, dto: AssignProjectMemberDto)` → `POST /projects/{id}/members`
- `removeProjectMember(id, userId)` → `DELETE /projects/{id}/members/{userId}`
- `getProjectTimeReport(id)` → `GET /projects/{id}/time-report`
- `getClientProjects(clientId)` → `GET /clients/{clientId}/projects`

---

## Step 5 — Fix `src/services/team.service.ts`

**Fix existing:**
- `addTeamMember` body: `{ userId, role: 'MEMBER' }` → `{ userId, teamRole?: TeamRole }`

**Add missing:**
- `updateTeamMemberRole(teamId, userId, teamRole: TeamRole)` → `PATCH /teams/{id}/members/{userId}`

---

## Step 6 — Fix `src/services/user.service.ts`

**Fix existing:**
- `updatePreferences(userId, dto)`: URL `PUT /users/me/preferences` → `PUT /users/{id}/preferences`
- `updateUser` DTO: add `department`, `location`, `joinDate`, `skills`, `performance` fields

**Add missing:**
- `createUser(dto: CreateUserDto)` → `POST /users`
- `updateUserStatus(id, status: EmployeeStatus)` → `PATCH /users/{id}/status`
- `getUserRoles(id)` → `GET /users/{id}/roles`
- `assignRole(id, dto: AssignRoleDto)` → `POST /users/{id}/roles`
- `removeRole(id, roleId)` → `DELETE /users/{id}/roles/{roleId}`

---

## Step 7 — Fix `src/services/client.service.ts`

**Fix existing:**
- `createClient` DTO field `type` → `clientType` (values: `organization | person`)

**Add missing:**
- `updateContact(clientId, contactId, dto: UpdateContactDto)` → `PATCH /clients/{clientId}/contacts/{contactId}`

---

## Step 8 — Fix `src/services/time-tracking.service.ts`

- `startTimer(taskId, force?: boolean)` → add `?force=true` query param when truthy

---

## Step 9 — New `src/services/activity.service.ts`

```ts
getGlobalActivity(params?: ActivityFilter)        // GET /activity
getProjectActivity(projectId, params?)             // GET /projects/{id}/activity
getTaskActivity(taskId, params?)                   // GET /tasks/{id}/activity
```
Return shape: `{ data: ApiActivity[], total: number, page: number }`.
Include `USE_MOCK_DATA` branch returning `{ data: [], total: 0, page: 1 }`.

---

## Step 10 — New `src/services/organization.service.ts`

```ts
getOrganization(id: string)                        // GET /organizations/{id}
updateOrganization(id, dto: UpdateOrganizationDto) // PATCH /organizations/{id}
deleteOrganization(id)                             // DELETE /organizations/{id}
```
Include `USE_MOCK_DATA` branch.

---

## Step 11 — Update `src/hooks/api/query-keys.ts`

Add new key factories:
```ts
activity: {
  global: (params?) => ['activity', 'global', params],
  project: (id, params?) => ['activity', 'project', id, params],
  task: (id, params?) => ['activity', 'task', id, params],
},
organizations: {
  detail: (id) => ['organizations', id],
},
```
Add sub-keys to existing factories:
- `tasks`: `assignees(id)`, `children(id)`, `subtree(id)`, `tree(projectId)`
- `projects`: `timeReport(id)`, `clientProjects(clientId)`

---

## Step 12 — New `src/hooks/api/useActivity.ts`

- `useGlobalActivity(params?)` — `useQuery`
- `useProjectActivity(projectId, params?)` — enabled when `!!projectId`
- `useTaskActivity(taskId, params?)` — enabled when `!!taskId`

---

## Step 13 — New `src/hooks/api/useOrganization.ts`

- `useOrganization(id)` — `useQuery`
- `useUpdateOrganization()` — `useMutation` + invalidate `organizations.detail(id)`
- `useDeleteOrganization()` — `useMutation`

---

## Step 14 — Update existing hooks

### `src/hooks/api/useTasks.ts`
Add: `useProjectTaskTree`, `useTaskChildren`, `useTaskSubtree`, `useMoveTask`, `useTaskAssignees`, `useAssignTask`, `useUnassignTask`

### `src/hooks/api/useProjects.ts`
Add: `useAddProjectMember`, `useRemoveProjectMember`, `useProjectTimeReport`, `useClientProjects`

### `src/hooks/api/useTaskFeatures.ts`
Add: `useUpdateComment`, `useReorderChecklist`

### `src/hooks/api/useTeams.ts`
Add: `useUpdateTeamMemberRole`

### `src/hooks/api/useUsers.ts`
Add: `useCreateUser`, `useUpdateUserStatus`, `useUserRoles`, `useAssignRole`, `useRemoveRole`
Fix: `useUpdatePreferences` — pass user ID in URL path

---

## Step 15 — Update `src/lib/mappers/project.mapper.ts`

Update `mapApiProjectToProject()` display string mappings for new enum values:
- Status: `start→'Start'`, `in_progress→'In Progress'`, `burning→'Burning'`, `end→'End'`, `late→'Late'`
- Type: `interior→'Interior'`, `residential→'Residential'`, `commercial→'Commercial'`
- Size: `small→'Small'`, `medium→'Medium'`, `large→'Large'`
- Complexity: `low→'Low'`, `medium→'Medium'`, `high→'High'`

---

## Step 16 — Update `src/lib/mappers/task.mapper.ts`

- Update `mapApiChecklistItem`: read `title` instead of `text`
- Update comment mapper: read `content` instead of `text`/`body`

---

## Files to Modify

| File | Action |
|------|--------|
| `src/types/api.ts` | Update enums + interfaces |
| `src/services/task-features.service.ts` | Fix fields + add 2 functions |
| `src/services/task.service.ts` | Add 7 functions, fix params |
| `src/services/project.service.ts` | Fix field, add 4 functions |
| `src/services/team.service.ts` | Fix field, add 1 function |
| `src/services/user.service.ts` | Fix URL, add 5 functions |
| `src/services/client.service.ts` | Fix field, add 1 function |
| `src/services/time-tracking.service.ts` | Add `force` param |
| `src/services/activity.service.ts` | **NEW** |
| `src/services/organization.service.ts` | **NEW** |
| `src/hooks/api/query-keys.ts` | Add new keys |
| `src/hooks/api/useTasks.ts` | Add 7 hooks |
| `src/hooks/api/useProjects.ts` | Add 4 hooks |
| `src/hooks/api/useTaskFeatures.ts` | Add 2 hooks |
| `src/hooks/api/useTeams.ts` | Add 1 hook |
| `src/hooks/api/useUsers.ts` | Fix + add 5 hooks |
| `src/hooks/api/useActivity.ts` | **NEW** |
| `src/hooks/api/useOrganization.ts` | **NEW** |
| `src/lib/mappers/project.mapper.ts` | Update display mappings |
| `src/lib/mappers/task.mapper.ts` | Update field names |

---

## Notes

- **Analytics URLs**: Swagger shows doubled prefix (`/api/v1/api/v1/analytics/...`) — this is a backend Swagger config bug. Existing `analytics.service.ts` uses `/analytics/...` which resolves correctly. **No change needed.**
- **TaskDto schemas**: `CreateTaskDto`/`UpdateTaskDto` show empty properties in Swagger (backend likely uses `@ApiHideProperty`). Existing field names (`title`, `description`, `status`, `priority`, `startDate`, `dueDate`, `estimatedHours`, `projectId`, `parentId`) are conventional and will be kept.
- **Auth flow**: `AuthContext.tsx` is already aligned with the API. No changes needed.
- **Mock data** in `src/mocks/`: Enum string values should be updated to lowercase API literals for consistency.

---

## Verification

1. Ensure backend is running at `localhost:3000`
2. Set `VITE_USE_MOCK=false` in `.env`
3. `npm run dev` — open browser
4. Test login → verify real JWT is returned
5. Navigate to Projects → verify data loads from `GET /api/v1/projects`
6. Create a project → verify `POST /api/v1/projects` sends `projectType` field
7. Open a task → verify checklist uses `title`, comments use `content`
8. Check Network tab for any 400/422 errors indicating remaining field mismatches
