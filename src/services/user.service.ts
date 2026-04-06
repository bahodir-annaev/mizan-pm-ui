import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { mapApiUserToTeamMember, getUserColor, getUserInitials } from '@/lib/mappers';
import type { TeamMember } from '@/types/domain';
import type { ApiUser, UpdateUserDto, ChangePasswordDto, UpdatePreferencesDto, CreateUserDto } from '@/types/api';

// Mock users derived from MOCK_EMPLOYEES shape
const MOCK_API_USERS: ApiUser[] = [
  { id: 'EMP-001', email: 'sarah.chen@company.com', firstName: 'Sarah', lastName: 'Chen', position: 'Senior Architect', phone: '+1 (555) 123-4567', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2021-01-01T00:00:00.000Z', updatedAt: '2021-01-01T00:00:00.000Z' },
  { id: 'EMP-002', email: 'mike.j@company.com', firstName: 'Mike', lastName: 'Johnson', position: 'Interior Designer', phone: '+1 (555) 234-5678', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2022-03-01T00:00:00.000Z', updatedAt: '2022-03-01T00:00:00.000Z' },
  { id: 'EMP-003', email: 'emma.davis@company.com', firstName: 'Emma', lastName: 'Davis', position: 'Project Manager', phone: '+1 (555) 345-6789', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2020-06-01T00:00:00.000Z', updatedAt: '2020-06-01T00:00:00.000Z' },
  { id: 'EMP-004', email: 'alex.m@company.com', firstName: 'Alex', lastName: 'Martinez', position: '3D Visualizer', phone: '+1 (555) 456-7890', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2021-09-01T00:00:00.000Z', updatedAt: '2021-09-01T00:00:00.000Z' },
  { id: 'EMP-005', email: 'lisa.wang@company.com', firstName: 'Lisa', lastName: 'Wang', position: 'Junior Designer', phone: '+1 (555) 567-8901', status: 'INACTIVE', isActive: false, orgId: 'org-1', createdAt: '2023-02-01T00:00:00.000Z', updatedAt: '2023-02-01T00:00:00.000Z' },
  { id: 'EMP-006', email: 'david.kim@company.com', firstName: 'David', lastName: 'Kim', position: 'Technical Lead', phone: '+1 (555) 678-9012', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2019-05-01T00:00:00.000Z', updatedAt: '2019-05-01T00:00:00.000Z' },
  { id: 'EMP-007', email: 'sofia.r@company.com', firstName: 'Sofia', lastName: 'Rodriguez', position: 'CAD Specialist', phone: '+1 (555) 789-0123', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2021-11-01T00:00:00.000Z', updatedAt: '2021-11-01T00:00:00.000Z' },
  { id: 'EMP-008', email: 'james.w@company.com', firstName: 'James', lastName: 'Wilson', position: 'Interior Designer', phone: '+1 (555) 890-1234', status: 'ACTIVE', isActive: true, orgId: 'org-1', createdAt: '2022-07-01T00:00:00.000Z', updatedAt: '2022-07-01T00:00:00.000Z' },
];

export async function getUsers(): Promise<TeamMember[]> {
  if (USE_MOCK_DATA) return MOCK_API_USERS.map(mapApiUserToTeamMember);
  const { data } = await apiClient.get<ApiUser[]>('/users');
  return data.map(mapApiUserToTeamMember);
}

export async function getMe(): Promise<TeamMember> {
  if (USE_MOCK_DATA) return mapApiUserToTeamMember(MOCK_API_USERS[0]);
  const { data } = await apiClient.get<ApiUser>('/users/me');
  return mapApiUserToTeamMember(data);
}

export async function getUser(id: string): Promise<TeamMember> {
  if (USE_MOCK_DATA) {
    const user = MOCK_API_USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found`);
    return mapApiUserToTeamMember(user);
  }
  const { data } = await apiClient.get<ApiUser>(`/users/${id}`);
  return mapApiUserToTeamMember(data);
}

export async function updateUser(id: string, dto: UpdateUserDto): Promise<TeamMember> {
  if (USE_MOCK_DATA) {
    const user = MOCK_API_USERS.find((u) => u.id === id) ?? MOCK_API_USERS[0];
    return mapApiUserToTeamMember({ ...user, ...dto });
  }
  const { data } = await apiClient.patch<ApiUser>(`/users/${id}`, dto);
  return mapApiUserToTeamMember(data);
}

export async function changePassword(dto: ChangePasswordDto): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.patch('/users/me/password', dto);
}

export async function updatePreferences(dto: UpdatePreferencesDto): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.put('/users/me/preferences', dto);
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/users/${id}`);
}

export async function assignUserToOrg(userId: string, orgId: string | null): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.patch(`/users/${userId}/organization`, { orgId });
}

export async function createUser(dto: CreateUserDto & { role?: string }): Promise<TeamMember> {
  if (USE_MOCK_DATA) {
    const id = `EMP-${Date.now()}`;
    const api: ApiUser = {
      id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      position: dto.role ?? 'member',
      status: 'ACTIVE',
      isActive: true,
      orgId: 'org-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      id,
      name: `${dto.firstName} ${dto.lastName}`,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      role: dto.role ?? 'member',
      position: dto.role,
      initials: getUserInitials(dto.firstName, dto.lastName),
      color: getUserColor(id),
      status: 'ACTIVE',
      orgId: 'org-1',
    };
  }
  const { data } = await apiClient.post<ApiUser>('/users', dto);
  return mapApiUserToTeamMember(data);
}
