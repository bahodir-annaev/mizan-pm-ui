import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as projectService from '@/services/project.service';
import type { Project } from '@/types/domain';
import type { CreateProjectDto, UpdateProjectDto } from '@/types/api';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: projectService.getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  });
}

export function useSidebarProjects() {
  // Reuses the same cache as useProjects — no duplicate fetch
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: projectService.getProjects,
    select: (projects) => projects.filter((p) => p.isPinned || true), // all for now
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId),
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) => projectService.createProject(dto),
    onSuccess: (newProject) => {
      qc.setQueryData<Project[]>(queryKeys.projects.list(), (old = []) => [
        ...old,
        newProject,
      ]);
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProjectDto }) =>
      projectService.updateProject(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData<Project[]>(queryKeys.projects.list(), (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
      qc.setQueryData(queryKeys.projects.detail(updated.id), updated);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Project[]>(queryKeys.projects.list(), (old = []) =>
        old.filter((p) => p.id !== id),
      );
      qc.removeQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
}

export function useToggleProjectPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.toggleProjectPin(id),
    onSuccess: (updated) => {
      qc.setQueryData<Project[]>(queryKeys.projects.list(), (old = []) =>
        old.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
  });
}
