import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import * as searchService from '@/services/search.service';

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search.results(query),
    queryFn: () => searchService.globalSearch(query),
    enabled: query.length >= 2,
    staleTime: 30000, // 30s
  });
}
