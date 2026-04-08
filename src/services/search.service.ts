import { apiClient } from '@/lib/api-client';
import type { SearchResults } from '@/types/api';

export async function globalSearch(query: string): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });
  const { data } = await apiClient.get<SearchResults>(`/search?${params}`);
  return data;
}
