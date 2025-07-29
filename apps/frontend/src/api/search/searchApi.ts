// src/search/searchApi.ts

import { http } from '@/utils/http';

export type SearchType = 'all' | 'users' | 'goals'; // extend as needed

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  snippet?: string;
}

/**
 * GET /search?query=...&type=...
 */
export async function searchApi(
  query: string,
  type: SearchType = 'all'
): Promise<{ results: SearchResult[] }> {
  const resp = await http.get<{ results: SearchResult[] }>('/search', {
    params: { query, type },
  });
  return resp.data;
}

export default { searchApi };
