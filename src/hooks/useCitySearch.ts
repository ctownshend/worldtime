import { useEffect, useState } from 'react';
import type { City } from '../types/city';
import { searchGeoNames } from '../lib/geonames';
import { seedCities } from '../data/seedCities';

interface SearchState {
  results: City[];
  loading: boolean;
  error: string | null;
}

export function useCitySearch(query: string, debounceMs = 350): SearchState {
  const [state, setState] = useState<SearchState>({
    results: seedCities,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setState({ results: seedCities, loading: false, error: null });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const results = await searchGeoNames(q);
        if (!controller.signal.aborted) {
          setState({ results, loading: false, error: null });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'Search failed';
          const hint = message.includes('demo')
            ? 'Register a free GeoNames username and set VITE_GEONAMES_USERNAME in .env'
            : message;
          setState({ results: seedCities, loading: false, error: hint });
        }
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return state;
}
