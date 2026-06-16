import { useState } from 'react';
import type { City } from '../types/city';
import { useCitySearch } from '../hooks/useCitySearch';
import './CityPicker.css';

interface CityPickerProps {
  selectedIds: string[];
  onToggle: (city: City) => void;
}

export function CityPicker({ selectedIds, onToggle }: CityPickerProps) {
  const [query, setQuery] = useState('');
  const { results, loading, error } = useCitySearch(query);

  return (
    <div className="city-picker">
      <label className="city-picker__label" htmlFor="city-search">
        Add a city
      </label>
      <input
        id="city-search"
        className="city-picker__input"
        type="search"
        placeholder="Search GeoNames (e.g. Paris, Mumbai)…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {loading && <p className="city-picker__status">Searching…</p>}
      {error && <p className="city-picker__error">{error}</p>}

      <ul className="city-picker__list" role="listbox" aria-label="Cities">
        {results.map((city) => {
          const selected = selectedIds.includes(city.id);
          return (
            <li key={city.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                className={`city-picker__item${selected ? ' city-picker__item--selected' : ''}`}
                onClick={() => onToggle(city)}
              >
                <span className="city-picker__name">{city.name}</span>
                <span className="city-picker__meta">
                  {city.country} · {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}° · {city.timezone}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
