# Data Structure Comparison: Frontend vs API

> **Source of truth:** Frontend (decide per entity which version to adopt)
>
> **API response envelope:** All responses wrap in `{ data, meta, errors }`.
> Paginated responses include `meta: { page, limit, totalItems, totalPages }`.

---

## 1. User / Auth

### Auth response (login / register)

| Field | Frontend (`TokenResponseDto`) | API (actual response) |
|-------|------------------------------|-----------------------|
| `accessToken` | `string` | `string` ✅ |
| `user.id` | `string` | `string` ✅ |
| `user.email` | `string` | `string` ✅ |
| `user.firstName` | `string` | `string` ✅ |
| `user.lastName` | `string` | `string` ✅ |
| `user.orgId` | `string` | `string` ✅ |
| `user.roles` | `string[]?` | `string[]` ✅ |

---

### User entity (`GET /api/v1/users/me`, `GET /api/v1/users/{id}`)

| Field | Frontend (`ApiUser` in `api.ts`) | API (actual response) |
|-------|----------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `email` | `string` | `string` ✅ |
| `firstName` | `string` | `string` ✅ |
| `lastName` | `string` | `string` ✅ |
| `position` | `string?` | `string \| null` ✅ |
| `phone` | `string?` | `string \| null` ✅ |
| `avatarUrl` | `string?` | `string \| null` ✅ |
| `status` | `EmployeeStatus` = `ACTIVE\|INACTIVE\|ON_LEAVE\|TERMINATED` | `working \| idle \| offline` ⚠️ different enum |
| `orgId` | `string` | `string` ✅ |
| `department` | `string \| null \| undefined` | `string \| null` ✅ |
| `location` | `string \| null \| undefined` | `string \| null` ✅ |
| `joinDate` | `string \| null \| undefined` | `string \| null` ✅ |
| `skills` | `string[] \| null \| undefined` | `string[] \| null` ✅ |
| `performance` | `number \| null \| undefined` | `number \| null` ✅ |
| `preferences` | `Record<string, unknown> \| null \| undefined` | `object \| null` ✅ |
| `isActive` | `boolean` | `boolean` ✅ |
| `lastActiveAt` | `string \| null \| undefined` | `string \| null` ✅ |
| `roles` | `string[]?` | `string[]` ✅ |
| `userRoles` | `UserRole[]?` | `UserRole[]` ✅ |
| `deletedAt` | `string \| null \| undefined` | `string \| null` ✅ |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |
| `_domainEvents` | ❌ not in frontend | `[]` (internal, can be ignored) |

**Key conflicts:**
- `status` enum values are completely different

---

### Update User (`PATCH /api/v1/users/{id}`)

| Field | Frontend (`UpdateUserDto`) | API (`UpdateUserDto`) |
|-------|----------------------------|-----------------------|
| `firstName` | `string?` | `string?` ✅ |
| `lastName` | `string?` | `string?` ✅ |
| `position` | `string?` | `string?` ✅ |
| `phone` | `string?` | `string?` ✅ |
| `avatarUrl` | `string?` | `string?` ✅ |
| `department` | ❌ | `string?` |
| `location` | ❌ | `string?` |
| `joinDate` | ❌ | `string?` |
| `skills` | ❌ | `string[]?` |
| `performance` | ❌ | `number?` |

---

### User Status (`PATCH /api/v1/users/{id}/status`)

| Field | Frontend | API |
|-------|----------|-----|
| `status` | `EmployeeStatus` = `ACTIVE\|INACTIVE\|ON_LEAVE\|TERMINATED` | `working \| idle \| offline` ⚠️ completely different |

---

## 2. Project

### Project entity (`GET /api/v1/projects`, `GET /api/v1/projects/{id}`)

| Field | Frontend (`ApiProject` in `api.ts`) | API (actual response) |
|-------|-------------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `name` | `string` | `string` ✅ |
| `description` | `string?` | `string \| null` ✅ |
| `status` | `ProjectStatus` = `PLANNING\|IN_PROGRESS\|ON_HOLD\|COMPLETED\|CANCELLED` | `start \| in_progress \| burning \| end \| late` ⚠️ different enum |
| `type` | `ProjectType?` = `RESIDENTIAL\|COMMERCIAL\|INFRASTRUCTURE\|INDUSTRIAL\|OTHER` | `projectType` field: `interior \| residential \| commercial` ⚠️ field name + enum differ |
| `size` | `ProjectSize?` = `SMALL\|MEDIUM\|LARGE\|ENTERPRISE` | `small \| medium \| large` ⚠️ no `ENTERPRISE` in API |
| `complexity` | `ComplexityLevel?` = `LOW\|MEDIUM\|HIGH\|VERY_HIGH` | `low \| medium \| high` ⚠️ no `VERY_HIGH` in API |
| `progress` | `number` | `number` ✅ |
| `areaSqm` | `number?` | `number \| null` ✅ |
| `startDate` | `string?` | `string \| null` ✅ |
| `dueDate` | `string?` | `string \| null` ✅ |
| `budget` | `number?` | `string` (decimal) ⚠️ API returns as string e.g. `"50000.00"` |
| `isPinned` | `boolean` | `boolean` ✅ |
| `orgId` | `string` | `string` ✅ |
| `clientId` | `string?` | `string \| null` ✅ |
| `client` | `ApiClient?` | ❌ not embedded by default |
| `members` | `ApiProjectMember[]?` | ❌ not embedded by default |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |
| `code` | `string?` | `string` ✅ |
| `parentId` | `string \| null \| undefined` | `string \| null` ✅ |
| `teamId` | `string \| null \| undefined` | `string \| null` ✅ |
| `priority` | `string \| null \| undefined` | `string \| null` ✅ |
| `estimatedDuration` | `string \| null \| undefined` | `string \| null` ✅ |
| `color` | `string \| null \| undefined` | `string \| null` ✅ |
| `isArchived` | `boolean?` | `boolean` ✅ |
| `createdBy` | `string?` | `string` (userId) ✅ |
| `creator` | `ApiUser?` | `User` object ✅ |
| `deletedAt` | `string \| null \| undefined` | `string \| null` ✅ |

**Key conflicts:**
- `status` enum: `PLANNING/IN_PROGRESS/ON_HOLD/COMPLETED/CANCELLED` vs `start/in_progress/burning/end/late`
- `type` (frontend) vs `projectType` (API); different enum values
- `budget` is `number` in frontend but `string` (decimal) in API

---

### Create Project (`POST /api/v1/projects`)

| Field | Frontend (`CreateProjectDto`) | API (`CreateProjectDto`) |
|-------|-------------------------------|--------------------------|
| `name` | `string` | `string` ✅ |
| `description` | `string?` | `string?` ✅ |
| `status` | `ProjectStatus?` | ❌ not in create DTO |
| `type` | `ProjectType?` | `projectType?: interior\|residential\|commercial` ⚠️ field name + enum differ |
| `startDate` | `string?` | `string?` ✅ |
| `dueDate` | `string?` | `string?` ✅ |
| `budget` | `number?` | `number?` ✅ |
| `clientId` | `string?` | `string?` ✅ |
| `areaSqm` | `number?` | `number?` ✅ |
| `teamId` | `string?` | `string?` ✅ |
| `parentId` | `string?` | `string?` ✅ |
| `size` | `ProjectSize?` | `small\|medium\|large?` ⚠️ enum values differ (frontend kept) |
| `complexity` | `ComplexityLevel?` | `low\|medium\|high?` ⚠️ enum values differ (frontend kept) |
| `priority` | `string?` | `string?` ✅ |
| `estimatedDuration` | `string?` | `string?` ✅ |
| `color` | `string?` | `string?` ✅ |

---

## 3. Task

### Task entity (`GET /api/v1/tasks/{id}`)

| Field | Frontend (`ApiTask` in `api.ts`) | API (actual response) |
|-------|----------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `title` | `string` | `string` ✅ |
| `description` | `string?` | `string \| null` ✅ |
| `status` | `TaskStatus` = `TODO\|IN_PROGRESS\|IN_REVIEW\|DONE\|CANCELLED` | `start \| in_progress \| burning \| end \| late` ⚠️ same issue as Project.status |
| `priority` | `TaskPriority` = `LOW\|MEDIUM\|HIGH\|URGENT` | `low \| medium \| high` ⚠️ lowercase + no `URGENT` |
| `workType` | `WorkType?` = `DESIGN\|CONSTRUCTION\|INSPECTION\|MANAGEMENT\|OTHER` | `string \| null` (not validated in response) |
| `acceptanceStatus` | `AcceptanceStatus?` = `PENDING\|ACCEPTED\|REJECTED\|REVISION` | field name is `acceptance` ⚠️ field name differs |
| `startDate` | `string?` | `string \| null` ✅ |
| `dueDate` | `string?` | `string \| null` ✅ |
| `estimatedHours` | `number?` | `number \| null` ✅ |
| `actualHours` | `number?` | ❌ not in API response |
| `progress` | `number?` | `number` ✅ |
| `projectId` | `string` | `string` ✅ |
| `parentId` | `string?` | `string \| null` ✅ |
| `assignee` | `ApiUser?` | ❌ not embedded — API uses `assigneeId` + `assignees[]` |
| `assignees` | `ApiUser[]?` | `ApiUser[]` ✅ (array) |
| `participants` | `ApiUser[]?` | ❌ not embedded in task response |
| `subtasks` | `ApiTask[]?` | ❌ not embedded (use `/tree` endpoint) |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |
| `code` | `string?` | `string` ✅ |
| `assigneeId` | `string \| null \| undefined` | `string \| null` ✅ |
| `completedAt` | `string \| null \| undefined` | `string \| null` ✅ |
| `materializedPath` | `string?` | `string` ✅ |
| `depth` | `number?` | `number` ✅ |
| `position` | `number?` | `number` ✅ |
| `createdBy` | `string?` | `string` (userId) ✅ |
| `creator` | `ApiUser?` | `User` object ✅ |
| `project` | `ApiProject?` | `Project` object ✅ |
| `deletedAt` | `string \| null \| undefined` | `string \| null` ✅ |

**Key conflicts:**
- `status` enum: `TODO/IN_PROGRESS/IN_REVIEW/DONE/CANCELLED` vs `start/in_progress/burning/end/late`
- `priority` enum: uppercase vs lowercase; `URGENT` missing in API
- `acceptanceStatus` (frontend) vs `acceptance` (API)
- `assignee` (single object) vs `assigneeId` + `assignees[]` (API)

---

### Create Task (`POST /api/v1/tasks`)

| Field | Frontend (`CreateTaskDto`) | API (`CreateTaskDto`) |
|-------|----------------------------|-----------------------|
| `title` | `string` | `string` ✅ |
| `description` | `string?` | `string?` ✅ |
| `status` | `TaskStatus?` | ⚠️ different enum values |
| `priority` | `TaskPriority?` | ⚠️ different enum values (lowercase) |
| `workType` | `WorkType?` | `string?` ✅ |
| `startDate` | `string?` | `string?` ✅ |
| `dueDate` | `string?` | `string?` ✅ |
| `estimatedHours` | `number?` | `number?` ✅ |
| `projectId` | `string` | `string` ✅ |
| `parentId` | `string?` | `string?` ✅ |
| `assigneeId` | `string?` | `string?` ✅ |

---

## 4. Client

### Client entity (`GET /api/v1/clients/{id}`)

| Field | Frontend (`ApiClient` in `api.ts`) | API (actual response) |
|-------|------------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `name` | `string` | `string` ✅ |
| `type` | `ClientType` = `INDIVIDUAL\|COMPANY\|GOVERNMENT\|NGO` | field name is `clientType`: `organization \| person` ⚠️ field name + enum differ |
| `email` | `string?` | `string \| null` ✅ |
| `phone` | `string?` | `string \| null` ✅ |
| `address` | `string?` | `string \| null` ✅ |
| `website` | `string?` | `string \| null` ✅ |
| `isFavorite` | `boolean` | `boolean` ✅ |
| `orgId` | `string` | `string` ✅ |
| `contacts` | `ApiContact[]?` | ❌ not embedded by default |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |
| `notes` | `string \| null \| undefined` | `string \| null` ✅ |
| `group` | `string \| null \| undefined` | `string \| null` ✅ |
| `createdBy` | `string?` | `string` (userId) ✅ |
| `deletedAt` | `string \| null \| undefined` | `string \| null` ✅ |

**Key conflicts:**
- `type` (frontend) vs `clientType` (API); completely different enum values

---

### Contact Person

| Field | Frontend (`ApiContact` in `api.ts`) | API (actual response) |
|-------|-------------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `clientId` | `string` | `string` ✅ |
| `name` | `string` | `string` ✅ |
| `position` | `string?` | `string \| null` ✅ |
| `email` | `string?` | `string \| null` ✅ |
| `phone` | `string?` | `string \| null` ✅ |
| `isPrimary` | `boolean` | `boolean` ✅ |

✅ Good match — no conflicts.

---

## 5. Team

### Team entity (`GET /api/v1/teams/{id}`)

| Field | Frontend (`ApiTeam` in `api.ts`) | API (actual response) |
|-------|----------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `name` | `string` | `string` ✅ |
| `description` | `string?` | `string \| null` ✅ |
| `orgId` | `string` | ❌ not in API response |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |
| `createdBy` | `string?` | `string` (userId) ✅ |
| `creator` | `ApiUser?` | `User` object ✅ |
| `memberships` | `ApiTeamMember[]?` | `TeamMembership[]` ✅ |
| `deletedAt` | `string \| null \| undefined` | `string \| null` ✅ |

---

### Team Member

| Field | Frontend (`ApiTeamMember`) | API (`memberships[]` entry) |
|-------|----------------------------|-----------------------------|
| `userId` | `string` | `string` ✅ |
| `teamId` | `string` | `string` ✅ |
| `teamRole` | `owner\|admin\|manager\|member` | `owner\|admin\|member` ⚠️ no `manager` in API |
| `user` | `ApiUser` | `User` object ✅ |
| `id` | `string?` | `string` (membership record id) ✅ |
| `joinedAt` | `string?` | `string` ✅ |

**Key conflict:** `manager` role exists in frontend but not in API's `teamRole` enum.

---

## 6. Time Entry

### Time Entry entity

| Field | Frontend (`ApiTimeEntry`) | API (actual response) |
|-------|---------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `taskId` | `string` | `string` ✅ |
| `userId` | `string` | `string` ✅ |
| `user` | `ApiUser?` | ❌ not embedded |
| `startTime` | `string` | `string` ✅ |
| `endTime` | `string?` | `string \| null` ✅ |
| `durationMinutes` | `number?` | ❌ missing — API uses `durationSeconds` ⚠️ different unit |
| `description` | `string?` | `string \| null` ✅ |
| `createdAt` | `string` | `string` ✅ |
| `durationSeconds` | `number?` | `number` ✅ |
| `isManual` | `boolean?` | `boolean` ✅ |
| `isBillable` | `boolean?` | `boolean` ✅ |
| `projectId` | `string \| null \| undefined` | `string \| null` ✅ |
| `date` | `string \| null \| undefined` | `string \| null` ✅ |
| `hours` | `number \| null \| undefined` | `number \| null` ✅ |

**Key conflict:** `durationMinutes` (frontend) vs `durationSeconds` (API).

---

## 7. Checklist Item

| Field | Frontend (`ApiChecklistItem`) | API (actual response) |
|-------|-------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `taskId` | `string` | `string` ✅ |
| `title` | `string` | `string` ✅ |
| `isCompleted` | `boolean` | `boolean` ✅ |
| `sortOrder` | `number` | `number` ✅ |
| `createdAt` | `string?` | `string` ✅ |
| `updatedAt` | `string?` | `string` ✅ |

---

## 8. Comment

| Field | Frontend (`ApiComment`) | API (actual response) |
|-------|-------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `taskId` | `string` | `string` ✅ |
| `authorId` | `string` | ❌ missing — API uses `userId` ⚠️ field name differs |
| `author` | `ApiUser` | ❌ missing — API uses `user` ⚠️ field name differs |
| `text` | `string` | ❌ missing — API uses `content` ⚠️ field name differs |
| `createdAt` | `string` | `string` ✅ |
| `updatedAt` | `string` | `string` ✅ |

**Key conflicts:** `authorId`→`userId`, `author`→`user`, `text`→`content`.

---

## 9. Notification

| Field | Frontend (`ApiNotification`) | API (actual response) |
|-------|------------------------------|-----------------------|
| `id` | `string` | `string` ✅ |
| `userId` | `string` | ✅ (inferred from auth) |
| `type` | `NotificationType` enum | `string` (unvalidated) |
| `title` | `string` | `string` ✅ |
| `body` | `string` | `string` ✅ |
| `isRead` | `boolean` | `boolean` ✅ |
| `entityId` | `string?` | `string?` ✅ |
| `entityType` | `string?` | `string?` ✅ |
| `createdAt` | `string` | `string` ✅ |

✅ Good match overall.

---

## 10. Budget

| Field | Frontend (`BudgetOverview`) | API (actual response) |
|-------|-----------------------------|-----------------------|
| `totalLimit` | `number` | ❌ field is `limit` |
| `totalUsed` | `number` | ❌ field is `used` |
| `remaining` | `number` | `number \| null` ✅ (field name matches) |
| `projectBreakdown` | `Array<{projectId, projectName, budget}>` | ❌ not in response |

**Key conflicts:** `totalLimit`→`limit`, `totalUsed`→`used`.

---

## 11. Preferences

| Field | Frontend (`UpdatePreferencesDto`) | API (`UpdatePreferencesDto`) |
|-------|-----------------------------------|------------------------------|
| `theme` | `string?` | ❌ missing — API takes `preferences: object` (opaque) |
| `language` | `string?` | ❌ missing |
| `notifications` | `boolean?` | ❌ missing |

API stores preferences as an opaque JSON object — frontend needs to wrap its fields into `{ preferences: { theme, language, notifications } }`.

---

## 12. Enums Summary

| Enum | Frontend values | API values |
|------|-----------------|------------|
| `ProjectStatus` | `PLANNING\|IN_PROGRESS\|ON_HOLD\|COMPLETED\|CANCELLED` | `start\|in_progress\|burning\|end\|late` |
| `TaskStatus` | `TODO\|IN_PROGRESS\|IN_REVIEW\|DONE\|CANCELLED` | `start\|in_progress\|burning\|end\|late` (same as project) |
| `TaskPriority` | `LOW\|MEDIUM\|HIGH\|URGENT` | `low\|medium\|high` (lowercase, no URGENT) |
| `ProjectType` | `RESIDENTIAL\|COMMERCIAL\|INFRASTRUCTURE\|INDUSTRIAL\|OTHER` | `interior\|residential\|commercial` |
| `ProjectSize` | `SMALL\|MEDIUM\|LARGE\|ENTERPRISE` | `small\|medium\|large` (no ENTERPRISE) |
| `ComplexityLevel` | `LOW\|MEDIUM\|HIGH\|VERY_HIGH` | `low\|medium\|high` (no VERY_HIGH) |
| `ClientType` | `INDIVIDUAL\|COMPANY\|GOVERNMENT\|NGO` | `organization\|person` |
| `EmployeeStatus` | `ACTIVE\|INACTIVE\|ON_LEAVE\|TERMINATED` | `working\|idle\|offline` |
| `TeamRole` | `owner\|admin\|manager\|member` | `owner\|admin\|member` (no manager) |

---

## 13. API-Only Fields (not in frontend at all)

All previously API-only fields have been added to frontend types. Only internal/ignorable fields remain:

| Entity | Fields |
|--------|--------|
| All entities | `_domainEvents` (always `[]`, internal — ignore) |

---

## 14. Field Name Conflicts (same data, different key)

| Entity | Frontend field | API field |
|--------|---------------|-----------|
| Project | `type` | `projectType` |
| Task | `acceptanceStatus` | `acceptance` |
| Comment | `authorId` | `userId` |
| Comment | `author` | `user` |
| Comment | `text` | `content` |
| Budget | `totalLimit` | `limit` |
| Budget | `totalUsed` | `used` |
| Time Entry | `durationMinutes` | `durationSeconds` |
