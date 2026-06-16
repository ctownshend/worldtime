import { useEffect, useState } from 'react';
import type { City } from '../types/city';
import { fetchCityByGeonameId } from '../lib/geonames';
import { seedCities } from '../data/seedCities';

export function useDefaultCities(): City[] {
  const [cities, setCities] = useState<City[]>(seedCities);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const resolved = await Promise.all(
        seedCities.map((seed) => fetchCityByGeonameId(seed.geonameId, seed)),
      );
      if (!cancelled) setCities(resolved);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  return cities;
}
