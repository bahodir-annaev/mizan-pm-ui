import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import type { ApiFileMetadata } from '@/types/api';

export async function getFile(id: string): Promise<ApiFileMetadata> {
  if (USE_MOCK_DATA) throw new Error('File service not available in mock mode');
  const { data } = await apiClient.get<ApiFileMetadata>(`/files/${id}`);
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await apiClient.delete(`/files/${id}`);
}

export async function getProjectFiles(projectId: string): Promise<ApiFileMetadata[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiFileMetadata[]>(`/projects/${projectId}/files`);
  return data;
}

export async function uploadProjectFile(projectId: string, file: File): Promise<ApiFileMetadata> {
  if (USE_MOCK_DATA) {
    return {
      id: `FILE-${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedById: 'EMP-001',
      createdAt: new Date().toISOString(),
    };
  }
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiFileMetadata>(`/projects/${projectId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getClientFiles(clientId: string): Promise<ApiFileMetadata[]> {
  if (USE_MOCK_DATA) return [];
  const { data } = await apiClient.get<ApiFileMetadata[]>(`/clients/${clientId}/files`);
  return data;
}

export async function uploadClientFile(clientId: string, file: File): Promise<ApiFileMetadata> {
  if (USE_MOCK_DATA) {
    return {
      id: `FILE-${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedById: 'EMP-001',
      createdAt: new Date().toISOString(),
    };
  }
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<ApiFileMetadata>(`/clients/${clientId}/files`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
