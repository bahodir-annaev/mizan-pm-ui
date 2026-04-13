import { apiClient } from '@/lib/api-client';
import type { ApiTeam, ApiTeamMember, TeamRole } from '@/types/api';

export async function getTeams(): Promise<ApiTeam[]> {
  const { data } = await apiClient.get<ApiTeam[]>('/teams');
  return data;
}

export async function getTeam(id: string): Promise<ApiTeam> {
  const { data } = await apiClient.get<ApiTeam>(`/teams/${id}`);
  return data;
}

export async function createTeam(dto: { name: string; code?: string; description?: string }): Promise<ApiTeam> {
  const { data } = await apiClient.post<ApiTeam>('/teams', dto);
  return data;
}

export async function updateTeam(id: string, dto: { name?: string; description?: string }): Promise<ApiTeam> {
  const { data } = await apiClient.patch<ApiTeam>(`/teams/${id}`, dto);
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  await apiClient.delete(`/teams/${id}`);
}

export async function getTeamMembers(teamId: string): Promise<ApiTeamMember[]> {
  const { data } = await apiClient.get<ApiTeamMember[]>(`/teams/${teamId}/members`);
  return data;
}

export async function addTeamMember(teamId: string, userId: string, teamRole: TeamRole = 'member'): Promise<ApiTeamMember> {
  const { data } = await apiClient.post<ApiTeamMember>(`/teams/${teamId}/members`, { userId, teamRole });
  return data;
}

export async function updateTeamMemberRole(teamId: string, userId: string, teamRole: TeamRole): Promise<ApiTeamMember> {
  const { data } = await apiClient.patch<ApiTeamMember>(`/teams/${teamId}/members/${userId}`, { teamRole });
  return data;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/members/${userId}`);
}
