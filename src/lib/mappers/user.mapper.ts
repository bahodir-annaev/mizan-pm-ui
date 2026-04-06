import type { ApiUser } from '@/types/api';
import type { TeamMember, TaskAssignee, AuthUser } from '@/types/domain';

const AVATAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
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

export function mapApiUserToTeamMember(api: ApiUser): TeamMember {
  const { firstName, lastName } = splitName(api);
  return {
    id: api.id,
    name: resolveName(api),
    firstName,
    lastName,
    email: api.email,
    role: api.position ?? 'Member',
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
