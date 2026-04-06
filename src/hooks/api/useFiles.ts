import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as fileService from '@/services/file.service';
import type { ApiFileMetadata } from '@/types/api';

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.files(projectId),
    queryFn: () => fileService.getProjectFiles(projectId),
    enabled: !!projectId,
  });
}

export function useClientFiles(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.files(clientId),
    queryFn: () => fileService.getClientFiles(clientId),
    enabled: !!clientId,
  });
}

export function useUploadProjectFile(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => fileService.uploadProjectFile(projectId, file),
    onSuccess: (newFile) => {
      qc.setQueryData<ApiFileMetadata[]>(queryKeys.projects.files(projectId), (old = []) => [
        newFile,
        ...old,
      ]);
    },
  });
}

export function useUploadClientFile(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => fileService.uploadClientFile(clientId, file),
    onSuccess: (newFile) => {
      qc.setQueryData<ApiFileMetadata[]>(queryKeys.clients.files(clientId), (old = []) => [
        newFile,
        ...old,
      ]);
    },
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; context?: 'project' | 'client'; contextId?: string }) =>
      fileService.deleteFile(id),
    onSuccess: (_, { id, context, contextId }) => {
      if (context === 'project' && contextId) {
        qc.setQueryData<ApiFileMetadata[]>(queryKeys.projects.files(contextId), (old = []) =>
          old.filter((f) => f.id !== id),
        );
      } else if (context === 'client' && contextId) {
        qc.setQueryData<ApiFileMetadata[]>(queryKeys.clients.files(contextId), (old = []) =>
          old.filter((f) => f.id !== id),
        );
      }
    },
  });
}
