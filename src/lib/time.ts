import type { City } from '../types/city';

export interface CityTime {
  time: string;
  date: string;
  offset: string;
  isNight: boolean;
}

export function formatDigitalTime(city: City, now: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: city.timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
}

export function formatCityTime(city: City, now: Date, isNight: boolean): CityTime {
  const time = formatDigitalTime(city, now);

  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: city.timezone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now);

  const offset =
    new Intl.DateTimeFormat('en-GB', {
      timeZone: city.timezone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';

  return { time, date, offset, isNight };
}
