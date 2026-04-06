import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type { ApiTeam, ApiTeamMember, TeamRole } from '@/types/api';

export async function getTeams(): Promise<ApiTeam[]> {
  if (USE_MOCK_DATA) return MOCK_TEAMS;
  const { data } = await apiClient.get<ApiTeam[]>('/teams');
  return data;
}

export async function getTeam(id: string): Promise<ApiTeam> {
  if (USE_MOCK_DATA) {
    const team = MOCK_TEAMS.find((t) => t.id === id);
    if (!team) throw new Error(`Team ${id} not found`);
    return team;
  }
  const { data } = await apiClient.get<ApiTeam>(`/teams/${id}`);
  return data;
}

export async function createTeam(dto: { name: string; description?: string }): Promise<ApiTeam> {
  if (USE_MOCK_DATA) {
    return {
      id: `TEAM-${Date.now()}`,
      name: dto.name,
      description: dto.description,
      orgId: 'org-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiTeam>('/teams', dto);
  return data;
}

export async function updateTeam(id: string, dto: { name?: string; description?: string }): Promise<ApiTeam> {
  if (USE_MOCK_DATA) {
    const team = MOCK_TEAMS.find((t) => t.id === id);
    return { ...(team as ApiTeam), ...dto, updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.patch<ApiTeam>(`/teams/${id}`, dto);
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/teams/${id}`);
}

export async function getTeamMembers(teamId: string): Promise<ApiTeamMember[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiTeamMember[]>(`/teams/${teamId}/members`);
  return data;
}

export async function addTeamMember(teamId: string, userId: string, teamRole: TeamRole = 'member'): Promise<ApiTeamMember> {
  if (USE_MOCK_DATA) throw new Error('Not supported in mock mode');
  const { data } = await apiClient.post<ApiTeamMember>(`/teams/${teamId}/members`, { userId, teamRole });
  return data;
}

export async function updateTeamMemberRole(teamId: string, userId: string, teamRole: TeamRole): Promise<ApiTeamMember> {
  if (USE_MOCK_DATA) throw new Error('Not supported in mock mode');
  const { data } = await apiClient.patch<ApiTeamMember>(`/teams/${teamId}/members/${userId}`, { teamRole });
  return data;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/teams/${teamId}/members/${userId}`);
}

// Inline mock data
const MOCK_TEAMS: ApiTeam[] = [
  { id: 'TEAM-001', name: 'Architecture', description: 'Core architecture team', orgId: 'org-1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
  { id: 'TEAM-002', name: 'Interior Design', description: 'Interior design specialists', orgId: 'org-1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
  { id: 'TEAM-003', name: 'Technical', description: 'BIM and technical drawings', orgId: 'org-1', createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
];
