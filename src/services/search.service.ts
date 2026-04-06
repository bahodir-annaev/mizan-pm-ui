import { apiClient } from '@/lib/api-client';
import { USE_MOCK_DATA } from '@/lib/config';
import { MOCK_PROJECTS } from '@/mocks/projects';
import { MOCK_CLIENTS } from '@/mocks/clients';
import type { SearchResults } from '@/types/api';

export async function globalSearch(query: string): Promise<SearchResults> {
  if (USE_MOCK_DATA) {
    const q = query.toLowerCase();
    const projects = MOCK_PROJECTS
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({
        id: p.id,
        name: p.name,
        status: p.statusKey as any,
        progress: p.progress,
        isPinned: p.isPinned,
        orgId: 'org-1',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    const clients = MOCK_CLIENTS
      .filter((c) => c.name.toLowerCase().includes(q))
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: 'COMPANY' as const,
        isFavorite: c.isFavorite,
        orgId: 'org-1',
        createdAt: c.createdAt,
        updatedAt: c.createdAt,
      }));
    return { projects, tasks: [], clients, users: [] };
  }

  const params = new URLSearchParams({ q: query });
  const { data } = await apiClient.get<SearchResults>(`/search?${params}`);
  return data;
}
