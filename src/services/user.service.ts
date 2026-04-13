import { apiClient } from '@/lib/api-client';
import { mapApiUserToTeamMember } from '@/lib/mappers';
import type { TeamMember } from '@/types/domain';
import type { ApiUser, UpdateUserDto, ChangePasswordDto, UpdatePreferencesDto, CreateUserDto } from '@/types/api';

export async function getOnlineUserIds(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/realtime/users/online');
  return data;
}

export async function getUsers(): Promise<TeamMember[]> {
  const { data } = await apiClient.get<ApiUser[]>('/users');
  return data.map(mapApiUserToTeamMember);
}

export async function getMe(): Promise<TeamMember> {
  const { data } = await apiClient.get<ApiUser>('/users/me');
  return mapApiUserToTeamMember(data);
}

export async function getUser(id: string): Promise<TeamMember> {
  const { data } = await apiClient.get<ApiUser>(`/users/${id}`);
  return mapApiUserToTeamMember(data);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<TeamMember> {
  const { data } = await apiClient.patch<ApiUser>(`/users/${id}`, dto);
  return mapApiUserToTeamMember(data);
}

export async function changePassword(dto: ChangePasswordDto): Promise<void> {
  await apiClient.patch('/users/me/password', dto);
}

export async function updatePreferences(dto: UpdatePreferencesDto): Promise<void> {
  await apiClient.put('/users/me/preferences', dto);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function assignUserToOrg(userId: string, orgId: string | null): Promise<void> {
  await apiClient.patch(`/users/${userId}/organization`, { orgId });
}

export async function createUser(dto: CreateUserDto & { role?: string }): Promise<TeamMember> {
  const { data } = await apiClient.post<ApiUser>('/users', dto);
  return mapApiUserToTeamMember(data);
}
