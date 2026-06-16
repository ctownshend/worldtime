import type { City } from '../types/city';
import { formatCityTime } from '../lib/time';
import { isNight, getSunPosition } from '../lib/solar';
import './CityClock.css';

interface CityClockProps {
  city: City;
  now: Date;
  onRemove: (id: string) => void;
}

export function CityClock({ city, now, onRemove }: CityClockProps) {
  const sun = getSunPosition(now);
  const night = isNight(city.lat, city.lng, sun);
  const { time, date, offset } = formatCityTime(city, now, night);

  return (
    <article className={`city-clock${night ? ' city-clock--night' : ' city-clock--day'}`}>
      <div className="city-clock__header">
        <div>
          <h3 className="city-clock__name">{city.name}</h3>
          <p className="city-clock__country">{city.country}</p>
        </div>
        <button
          type="button"
          className="city-clock__remove"
          onClick={() => onRemove(city.id)}
          aria-label={`Remove ${city.name}`}
        >
          ×
        </button>
      </div>
      <p className="city-clock__time" aria-live="polite">
        {time}
      </p>
      <div className="city-clock__footer">
        <span>{date}</span>
        <span>{offset}</span>
        <span className="city-clock__coords">
          {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
        </span>
      </div>
    </article>
  );
}
