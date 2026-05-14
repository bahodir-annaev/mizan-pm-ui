import type { ApiTeam, ApiTeamMember } from '@/types/api';
import type { Team, TeamMemberDetail } from '@/types/domain';
import type { TeamMember } from '@/types/domain';
import { getUserInitials, getUserColor } from './user.mapper';

export function mapApiTeamToTeam(api: ApiTeam): Team {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
    description: api.description,
    createdBy: api.createdBy ?? '',
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

/**
 * Enrich a raw team membership record with user display data.
 * Pass a Map<userId, TeamMember> built from useUsers() for O(1) lookup.
 */
export function enrichTeamMember(membership: ApiTeamMember, userMap: Map<string, TeamMember>): TeamMemberDetail {
  const user = userMap.get(membership.userId);
  return {
    membershipId: membership.id,
    teamId: membership.teamId,
    userId: membership.userId,
    role: membership.teamRole,
    joinedAt: membership.joinedAt,
    name: user?.name ?? membership.userId,
    email: user?.email ?? '',
    position: user?.position,
    avatarUrl: user?.avatarUrl,
    initials: user?.initials ?? getUserInitials(),
    color: user?.color ?? getUserColor(membership.userId),
  };
}
