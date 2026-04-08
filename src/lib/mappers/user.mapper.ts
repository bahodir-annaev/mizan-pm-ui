import type { ApiUser } from '@/types/api';
import type { TeamMember, TaskAssignee, AuthUser } from '@/types/domain';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500',
  'bg-cyan-500', 'bg-lime-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
];

/** Deterministic color based on user id */
export function getUserColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Derive a display name from whatever fields the backend provides. */
function resolveName(api: ApiUser): string {
  if (api.firstName || api.lastName) {
    return `${api.firstName ?? ''} ${api.lastName ?? ''}`.trim();
  }
  return (api as any).name ?? (api as any).fullName ?? api.email ?? 'Unknown';
}

/** Split a full name into firstName/lastName best-effort. */
function splitName(api: ApiUser): { firstName: string; lastName: string } {
  if (api.firstName || api.lastName) {
    return { firstName: api.firstName ?? '', lastName: api.lastName ?? '' };
  }
  const full = resolveName(api);
  const spaceIdx = full.indexOf(' ');
  if (spaceIdx === -1) return { firstName: full, lastName: '' };
  return { firstName: full.slice(0, spaceIdx), lastName: full.slice(spaceIdx + 1) };
}

export function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) ?? '';
  const last = lastName?.charAt(0) ?? '';
  return (`${first}${last}`.toUpperCase()) || '?';
}

function resolveOrgRole(api: ApiUser): 'owner' | 'admin' | 'manager' | 'member' | 'viewer' {
  const roleNames = [
    ...(api.roles ?? []),
    ...(api.userRoles?.map((ur) => ur.role.name) ?? []),
  ].map((r) => r.toLowerCase());
  if (roleNames.includes('owner')) return 'owner';
  if (roleNames.includes('admin')) return 'admin';
  if (roleNames.includes('manager')) return 'manager';
  if (roleNames.includes('viewer')) return 'viewer';
  return 'member';
}

export function mapApiUserToTeamMember(api: ApiUser): TeamMember {
  const { firstName, lastName } = splitName(api);
  return {
    id: api.id,
    name: resolveName(api),
    firstName,
    lastName,
    email: api.email,
    role: api.position ?? 'Member',
    orgRole: resolveOrgRole(api),
    position: api.position,
    phone: api.phone,
    avatarUrl: api.avatarUrl,
    initials: getUserInitials(firstName, lastName),
    color: getUserColor(api.id),
    status: api.status,
    orgId: api.orgId,
  };
}

export function mapApiUserToTaskAssignee(api: ApiUser): TaskAssignee {
  const { firstName, lastName } = splitName(api);
  return {
    id: api.id,
    name: resolveName(api),
    initials: getUserInitials(firstName, lastName),
    color: getUserColor(api.id),
    avatarUrl: api.avatarUrl,
  };
}

export function mapApiUserToAuthUser(api: ApiUser): AuthUser {
  const { firstName, lastName } = splitName(api);
  return {
    id: api.id,
    email: api.email,
    firstName,
    lastName,
    name: resolveName(api),
    initials: getUserInitials(firstName, lastName),
    color: getUserColor(api.id),
    position: api.position,
    orgId: api.orgId,
    roles: api.roles,
  };
}
