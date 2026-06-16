import axios from 'axios';
import type { City } from '../types/city';
import { cityId } from '../types/city';

const API_BASE = '/api/geonames';

interface GeoNamesPlace {
  geonameId: number;
  name: string;
  countryName: string;
  adminName1?: string;
  lat: string;
  lng: string;
}

type GeoNamesSearchResult = GeoNamesPlace;

interface GeoNamesSearchResponse {
  geonames: GeoNamesSearchResult[];
  status?: { message: string; value: number };
}

interface GeoNamesTimezoneResponse {
  timezoneId: string;
  status?: { message: string; value: number };
}

function username(): string {
  return import.meta.env.VITE_GEONAMES_USERNAME ?? 'demo';
}

const geonamesClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
});

async function geonamesFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const { data } = await geonamesClient.get<T & { status?: { message: string } }>(path, {
    params: {
      ...params,
      username: username(),
    },
  });
  if (data.status?.message) {
    throw new Error(data.status.message);
  }
  return data;
}

export async function searchGeoNames(query: string): Promise<City[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const data = await geonamesFetch<GeoNamesSearchResponse>('/searchJSON', {
    q,
    featureClass: 'P',
    cities: 'cities1000',
    maxRows: '12',
    orderby: 'population',
  });

  const results = data.geonames ?? [];
  return results.map((place) => toCity(place, 'UTC'));
}

export async function enrichCityTimezone(city: City): Promise<City> {
  if (city.timezone !== 'UTC') return city;
  const timezone = await lookupTimezone(city.lat, city.lng);
  return { ...city, timezone };
}

export async function lookupTimezone(lat: number, lng: number): Promise<string> {
  try {
    const data = await geonamesFetch<GeoNamesTimezoneResponse>('/timezoneJSON', {
      lat: String(lat),
      lng: String(lng),
    });
    return data.timezoneId ?? 'UTC';
  } catch {
    return 'UTC';
  }
}

export async function fetchCityByGeonameId(
  geonameId: number,
  fallback: Omit<City, 'id'>,
): Promise<City> {
  try {
    const place = await geonamesFetch<GeoNamesPlace>('/getJSON', {
      geonameId: String(geonameId),
    });
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lng);
    const timezone = await lookupTimezone(lat, lng);
    return toCity(place, timezone);
  } catch {
    return { ...fallback, id: cityId(geonameId) };
  }
}

function toCity(place: GeoNamesSearchResult, timezone: string): City {
  const geonameId = place.geonameId;
  const lat = parseFloat(place.lat);
  const lng = parseFloat(place.lng);

  return {
    id: cityId(geonameId),
    geonameId,
    name: place.name,
    country: place.countryName,
    lat,
    lng,
    timezone,
  };
}
