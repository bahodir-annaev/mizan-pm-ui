import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { mapApiProjectToProject } from '@/lib/mappers';
import { MOCK_PROJECTS } from '@/mocks/projects';
import type { Project } from '@/types/domain';
import type { ApiProject, CreateProjectDto, UpdateProjectDto } from '@/types/api';

export async function getProjects(): Promise<Project[]> {
  if (USE_MOCK_DATA) return [...MOCK_PROJECTS];
  const { data } = await apiClient.get<ApiProject[]>('/projects');
  return data.map(mapApiProjectToProject);
}

export async function getProject(id: string): Promise<Project> {
  if (USE_MOCK_DATA) {
    const p = MOCK_PROJECTS.find((p) => p.id === id);
    if (!p) throw new Error(`Project ${id} not found`);
    return p;
  }
  const { data } = await apiClient.get<ApiProject>(`/projects/${id}`);
  return mapApiProjectToProject(data);
}

export async function createProject(dto: CreateProjectDto): Promise<Project> {
  if (USE_MOCK_DATA) {
    const STATUS_DISPLAY: Record<string, string> = {
      PLANNING: 'Start',
      IN_PROGRESS: 'In Progress',
      ON_HOLD: 'On Hold',
      COMPLETED: 'End',
      CANCELLED: 'Cancelled',
    };
    return {
      id: `PRJ-${Date.now()}`,
      name: dto.name,
      description: dto.description,
      status: STATUS_DISPLAY[dto.status ?? 'PLANNING'] ?? 'Start',
      statusKey: dto.status ?? 'PLANNING',
      progress: 0,
      holat: 0,
      isPinned: false,
      areaSqm: dto.areaSqm,
      kvadratura: dto.areaSqm ? `${dto.areaSqm} m²` : undefined,
      budget: dto.budget,
      clientId: dto.clientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const { data } = await apiClient.post<ApiProject>('/projects', dto);
  return mapApiProjectToProject(data);
}

export async function updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_PROJECTS.find((p) => p.id === id);
    return { ...(existing as Project), ...dto, updatedAt: new Date().toISOString() } as Project;
  }
  const { data } = await apiClient.patch<ApiProject>(`/projects/${id}`, dto);
  return mapApiProjectToProject(data);
}

export async function deleteProject(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/projects/${id}`);
}

export async function toggleProjectPin(id: string): Promise<Project> {
  if (USE_MOCK_DATA) {
    const existing = MOCK_PROJECTS.find((p) => p.id === id);
    if (!existing) throw new Error(`Project ${id} not found`);
    return { ...existing, isPinned: !existing.isPinned, updatedAt: new Date().toISOString() };
  }
  const { data } = await apiClient.patch<ApiProject>(`/projects/${id}/pin`);
  return mapApiProjectToProject(data);
}

export async function getProjectMembers(id: string) {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get(`/projects/${id}/members`);
  return data;
}
