import { useCallback, useEffect, useRef, useState } from 'react';
import type { City } from './types/city';
import { seedCities } from './data/seedCities';
import { enrichCityTimezone } from './lib/geonames';
import { CityPicker } from './components/CityPicker';
import { CityClock } from './components/CityClock';
import { WorldMap } from './components/WorldMap';
import { useDefaultCities } from './hooks/useDefaultCities';
import { useNow } from './hooks/useNow';
import './App.css';

function App() {
  const now = useNow();
  const defaultCities = useDefaultCities();
  const [selectedCities, setSelectedCities] = useState<City[]>(seedCities);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      setSelectedCities(defaultCities);
      hydrated.current = true;
    }
  }, [defaultCities]);

  const selectedIds = selectedCities.map((c) => c.id);

  const handleToggle = useCallback((city: City) => {
    setSelectedCities((prev) => {
      if (prev.some((c) => c.id === city.id)) {
        return prev.filter((c) => c.id !== city.id);
      }
      void enrichCityTimezone(city).then((enriched) => {
        setSelectedCities((current) =>
          current.some((c) => c.id === enriched.id) ? current : [...current, enriched],
        );
      });
      return prev;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setSelectedCities((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="app">
      <main className="app__main">
        <section className="app__map-panel" aria-label="Day and night world map">
          <WorldMap now={now} selectedCities={selectedCities} />
        </section>

        <aside className="app__controls">
          <section className="app__clocks" aria-label="Selected city clocks">
            <h2 className="app__section-title">Your clocks</h2>
            <div className="app__clock-grid">
              {selectedCities.length === 0 ? (
                <p className="app__empty">Select cities from the list below.</p>
              ) : (
                selectedCities.map((city) => (
                  <CityClock key={city.id} city={city} now={now} onRemove={handleRemove} />
                ))
              )}
            </div>
          </section>

          <CityPicker selectedIds={selectedIds} onToggle={handleToggle} />
        </aside>
      </main>

      <footer className="app__footer">
        <span>Cities via GeoNames</span>
        <span>NASA Blue Marble · night lights texture</span>
      </footer>
    </div>
  );
}

export default App;
