export interface City {
  id: string;
  geonameId: number;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export function cityId(geonameId: number): string {
  return String(geonameId);
}
