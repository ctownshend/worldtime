import type { City } from '../types/city';
import { cityId } from '../types/city';

/** Fallback defaults used before GeoNames resolves, or when offline. */
export const seedCities: City[] = [
  {
    id: cityId(2643743),
    geonameId: 2643743,
    name: 'London',
    country: 'United Kingdom',
    lat: 51.50853,
    lng: -0.12574,
    timezone: 'Europe/London',
  },
  {
    id: cityId(5128581),
    geonameId: 5128581,
    name: 'New York City',
    country: 'United States',
    lat: 40.71427,
    lng: -74.00597,
    timezone: 'America/New_York',
  },
  {
    id: cityId(1850147),
    geonameId: 1850147,
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6895,
    lng: 139.69171,
    timezone: 'Asia/Tokyo',
  },
  {
    id: cityId(2147714),
    geonameId: 2147714,
    name: 'Sydney',
    country: 'Australia',
    lat: -33.86785,
    lng: 151.20732,
    timezone: 'Australia/Sydney',
  },
];

export const defaultCityIds = seedCities.map((c) => c.id);
