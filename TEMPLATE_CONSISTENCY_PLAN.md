# Plan: Fix Template & Data Property Consistency with Backend API

## Context
A full audit of mappers, types, and component templates against the real backend Swagger API (localhost:3000) revealed that all major enum values are wrong (frontend uses uppercase `PLANNING`, API uses lowercase `start`), two mapper create-request functions send the wrong field names, and one component has a field name mismatch that will silently render zeros. These issues will cause all project/client data to display incorrectly or be rejected by the API when submitting forms.

---

## Issues Found

### 🔴 Critical — Will break at runtime

#### 1. ~~All enum types in `src/types/api.ts` don't match real API values~~ — ✅ Won't Fix / Design Decision
All status and type enums are intentionally kept as frontend values (`PLANNING`, `IN_PROGRESS`, etc.).
The mapper display lookups (`STATUS_DISPLAY['PLANNING']`) work correctly for mock data and for any backend that returns frontend enum values.
When connecting to the real API (which sends `start`, `in_progress`, etc.), the mappers fall back to the raw API value via `?? api.status` — status badges will show raw strings. This is an accepted trade-off pending a full API integration pass.

`TaskStatus` and `TaskPriority` are unaffected (not in Swagger schemas).

#### 2. ~~Mapper display lookup tables use wrong keys~~ — ✅ Won't Fix / Design Decision
`STATUS_DISPLAY`, `TYPE_DISPLAY`, `SIZE_DISPLAY`, `COMPLEXITY_DISPLAY` in `project.mapper.ts` correctly match the frontend enum values.
All mappers already have `?? api.status` / `?? api.type` fallbacks that pass raw API values through when a key is not found. No changes needed unless Issue 1 is revisited.

#### 3. `mapProjectToCreateRequest` never sends `type`, `size`, or `complexity` — 🔴 Still Open
Current state of `mapProjectToCreateRequest` output:
```ts
{ name, description, status, startDate, dueDate, budget, clientId, areaSqm }
```
- Does **not** send `type` at all (the `type` vs `projectType` field name conflict is documented in `DATA_STRUCTURE_COMPARISON.md` Section 14 — pending resolution)
- Does **not** send `size` or `complexity` (both exist in `CreateProjectDto` since the last update)

**Fix needed:** Add `size`, `complexity`, and `type` (or `projectType`) to the return value.

#### 4. `mapClientToCreateRequest` sends wrong field name and wrong enum value — 🔴 Still Open
Current code:
```ts
type: (client.type?.toUpperCase() ?? 'COMPANY') as CreateClientDto['type'],
```
- Field name is `type` but API expects `clientType`
- `.toUpperCase()` produces `'INDIVIDUAL'` / `'COMPANY'` etc. which the API does not accept (`organization | person`)
- `ClientType` enum is kept as `INDIVIDUAL | COMPANY | GOVERNMENT | NGO` (design decision), so the create request must map display values → API values explicitly

**Fix needed:**
```ts
const CLIENT_TYPE_API: Record<string, CreateClientDto['clientType']> = {
  Individual: 'organization', Company: 'organization',
  Government: 'organization', NGO: 'organization',
  Person: 'person',
};
// then: clientType: CLIENT_TYPE_API[client.type ?? ''] ?? 'organization'
```
> Note: Once the `type` vs `clientType` field name conflict in `CreateClientDto` is resolved (see `DATA_STRUCTURE_COMPARISON.md` Section 14), update the field name accordingly.

#### 5. `ClientsPage.tsx` — `projectCount` never populated, always renders 0 — ⚠️ Partially Resolved
Current state:
- Line 39: `projectsCount: c.projectCount ?? 0` — data flows correctly from domain to local type ✅
- `mapApiClientToClient` never populates `projectCount` because the API client entity does not return it directly
- Result: column always renders `0` with real API data (not `undefined` — the `?? 0` default handles it)
- Local `Client` type re-definition with `projectsCount` remains (cosmetic duplication)

**Remaining work:** The root fix is either (a) populate `projectCount` from the API once the backend provides it, or (b) remove the column. The local type re-definition can be cleaned up by importing `Client` from `@/types/domain` and renaming `projectsCount` → `projectCount` in the template to remove the intermediary mapping.

---

### ⚠️ Medium — Mapper gaps (fields silently dropped)

#### 6. `mapProjectToCreateRequest` doesn't send `size` or `complexity` — 🔴 Still Open
_(Merged into Issue 3 above — same function, same fix.)_

#### 7. `mapTaskToCreateRequest` doesn't send `workType` or `acceptanceStatus` — 🔴 Still Open
Current output omits both fields despite them existing in `CreateTaskDto`.

**Fix needed:** Add to `mapTaskToCreateRequest`:
```ts
workType: task.workType as CreateTaskDto['workType'],
acceptanceStatus: (task.acceptanceStatus ?? task.acceptance) as CreateTaskDto['acceptanceStatus'],
```

#### 8. `mapApiUserToTeamMember` hardcodes fallback `role: 'Member'` — 🔴 Still Open
Current code:
```ts
role: api.position ?? 'Member',
```
When `api.position` is null/undefined, users display as "Member" regardless of their actual team role.

**Fix needed:**
```ts
role: api.position ?? '',
```

---

## Remaining Implementation Steps

### Step 1 — Fix `src/lib/mappers/project.mapper.ts`

Add missing fields to `mapProjectToCreateRequest`:
```ts
type: project.type as CreateProjectDto['type'],   // or 'projectType' once field name resolved
size: project.size as CreateProjectDto['size'],
complexity: project.complexity as CreateProjectDto['complexity'],
```

### Step 2 — Fix `src/lib/mappers/client.mapper.ts`

Fix `mapClientToCreateRequest` — rename field and add display→API value mapping:
```ts
clientType: CLIENT_TYPE_API[client.type ?? ''] ?? 'organization',
```
Remove the `type: value.toUpperCase()` line entirely.

### Step 3 — Fix `src/app/pages/ClientsPage.tsx` (optional cleanup)

- Remove the local `Client` type re-definition
- Import `Client` from `@/types/domain`
- Rename `client.projectsCount` → `client.projectCount` in the template (remove the intermediary `projectsCount` mapping)

### Step 4 — Fix `src/lib/mappers/user.mapper.ts`

```ts
role: api.position ?? '',  // was: api.position ?? 'Member'
```

### Step 5 — Fix `src/lib/mappers/task.mapper.ts`

Add to `mapTaskToCreateRequest`:
```ts
workType: task.workType as CreateTaskDto['workType'],
acceptanceStatus: (task.acceptanceStatus ?? task.acceptance) as CreateTaskDto['acceptanceStatus'],
```

---

## Files Still to Modify

| File | Changes | Status |
|------|---------|--------|
| `src/types/api.ts` | ~~Update 6 enum type definitions~~ | ✅ Won't Fix |
| `src/lib/mappers/project.mapper.ts` | ~~New display lookup tables~~ + add `type`/`size`/`complexity` to create request | 🔴 Partially open |
| `src/lib/mappers/client.mapper.ts` | Fix `clientType` field + remove `.toUpperCase()` + add value mapping | 🔴 Open |
| `src/app/pages/ClientsPage.tsx` | Remove local type; rename `projectsCount` → `projectCount` | ⚠️ Optional cleanup |
| `src/lib/mappers/user.mapper.ts` | Change role fallback from `'Member'` to `''` | 🔴 Open |
| `src/lib/mappers/task.mapper.ts` | Add `workType` + `acceptanceStatus` to create request | 🔴 Open |

---

## Verification (once fixes applied)

1. `npm run dev` with `VITE_USE_MOCK=false`
2. Create project → Network tab shows `size` and `complexity` fields in POST body
3. Create client → Network tab shows `clientType: 'organization'` or `'person'` (not `type: 'COMPANY'`)
4. User list → users without position show blank role, not `'Member'`
5. Task create → Network tab shows `workType` and `acceptanceStatus` in POST body
