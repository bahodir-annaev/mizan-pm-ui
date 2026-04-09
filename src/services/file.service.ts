import { apiClient } from '@/lib/api-client';
import type { ApiFileMetadata } from '@/types/api';

export async function getFile(id: string): Promise<ApiFileMetadata> {
  const { data } = await apiClient.get<ApiFileMetadata>(`/files/${id}`);
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

export async function getProjectFiles(projectId: string): Promise<ApiFileMetadata[]> {
  const { data } = await apiClient.get<ApiFileMetadata[]>(`/projects/${projectId}/files`);
  return data;
}

export async function uploadProjectFile(projectId: string, file: File): Promise<ApiFileMetadata> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiFileMetadata>(`/projects/${projectId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getClientFiles(clientId: string): Promise<ApiFileMetadata[]> {
  const { data } = await apiClient.get<ApiFileMetadata[]>(`/clients/${clientId}/files`);
  return data;
}

export async function uploadClientFile(clientId: string, file: File): Promise<ApiFileMetadata> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiFileMetadata>(`/clients/${clientId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
