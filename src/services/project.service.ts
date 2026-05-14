import { apiClient } from '@/lib/api-client';
import { mapApiProjectToProject } from '@/lib/mappers';
import type { Project } from '@/types/domain';
import type { ApiProject, CreateProjectDto, UpdateProjectDto, ApiTeamAssignment, CreateTeamAssignmentDto } from '@/types/api';

export async function getProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<ApiProject[]>('/projects');
  return data.map(mapApiProjectToProject);
}

export async function getProject(id: string): Promise<Project> {
  const { data } = await apiClient.get<ApiProject>(`/projects/${id}`);
  return mapApiProjectToProject(data);
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  const { data } = await apiClient.post<ApiProject>('/projects', dto);
  return mapApiProjectToProject(data);
}

export async function updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
  const { data } = await apiClient.patch<ApiProject>(`/projects/${id}`, dto);
  return mapApiProjectToProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

export async function toggleProjectPin(id: string): Promise<Project> {
  const { data } = await apiClient.patch<ApiProject>(`/projects/${id}/pin`);
  return mapApiProjectToProject(data);
}

export async function getProjectMembers(id: string) {
  const { data } = await apiClient.get(`/projects/${id}/members`);
  return data;
}

export async function getTeamAssignments(projectId: string): Promise<ApiTeamAssignment[]> {
  const { data } = await apiClient.get<ApiTeamAssignment[]>(`/projects/${projectId}/team-assignments`);
  return data;
}

export async function createTeamAssignment(projectId: string, dto: CreateTeamAssignmentDto): Promise<ApiTeamAssignment> {
  const { data } = await apiClient.post<ApiTeamAssignment>(`/projects/${projectId}/team-assignments`, dto);
  return data;
}

export async function activateTeamAssignment(projectId: string): Promise<ApiTeamAssignment> {
  const { data } = await apiClient.post<ApiTeamAssignment>(`/projects/${projectId}/team-assignments/activate`);
  return data;
}
