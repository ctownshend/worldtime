import { useId, useMemo } from 'react';
import type { City } from '../types/city';
import { projectEquirectangular } from '../lib/geo';
import {
  buildNightOverlayPath,
  buildTwilightBandPath,
  getSunPosition,
  isNight,
} from '../lib/solar';
import { formatDigitalTime } from '../lib/time';
import './WorldMap.css';

const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1024;

const EARTH_DAY = '/textures/earth-day.jpg';
const EARTH_NIGHT = '/textures/earth-night.jpg';

interface WorldMapProps {
  now: Date;
  selectedCities: City[];
}

export function WorldMap({ now, selectedCities }: WorldMapProps) {
  const uid = useId();
  const nightClipId = `night-clip-${uid}`;
  const sun = useMemo(() => getSunPosition(now), [now]);

  const nightPath = useMemo(
    () => buildNightOverlayPath(sun, MAP_WIDTH, MAP_HEIGHT),
    [sun],
  );

  const twilightPath = useMemo(
    () => buildTwilightBandPath(sun, MAP_WIDTH, MAP_HEIGHT, 0, -6),
    [sun],
  );

  const terminatorPath = useMemo(
    () => buildTerminatorStroke(sun, MAP_WIDTH, MAP_HEIGHT),
    [sun],
  );

  return (
    <div className="world-map" aria-label="World map showing day and night">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="world-map__svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id={nightClipId}>
            <path d={nightPath} />
          </clipPath>
          <filter id="terminator-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image
          href={EARTH_DAY}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          preserveAspectRatio="none"
        />

        <image
          href={EARTH_NIGHT}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          preserveAspectRatio="none"
          clipPath={`url(#${nightClipId})`}
          className="world-map__night-texture"
        />

        <path d={twilightPath} className="world-map__twilight" />
        <path d={nightPath} className="world-map__night-atmosphere" />

        <path
          d={terminatorPath}
          className="world-map__terminator"
          fill="none"
          filter="url(#terminator-glow)"
        />

        {selectedCities.map((city) => {
          const { x, y } = projectEquirectangular(city.lat, city.lng, MAP_WIDTH, MAP_HEIGHT);
          const night = isNight(city.lat, city.lng, sun);
          const digitalTime = formatDigitalTime(city, now);
          const labelWidth = Math.max(city.name.length * 11, digitalTime.length * 13) + 24;
          return (
            <g key={city.id} className="world-map__marker" transform={`translate(${x}, ${y})`}>
              <circle r={8} className={night ? 'world-map__dot--night' : 'world-map__dot--day'} />
              <circle r={14} className="world-map__pulse" />
              <g className="world-map__tag" transform={`translate(${-labelWidth / 2}, -58)`}>
                <rect
                  width={labelWidth}
                  height={44}
                  rx={6}
                  className={night ? 'world-map__tag-bg--night' : 'world-map__tag-bg--day'}
                />
                <text x={labelWidth / 2} y={17} className="world-map__label">
                  {city.name}
                </text>
                <text
                  x={labelWidth / 2}
                  y={36}
                  className={`world-map__time${night ? ' world-map__time--night' : ''}`}
                >
                  {digitalTime}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <p className="world-map__caption">
        NASA Blue Marble · live solar terminator
      </p>
    </div>
  );
}

function buildTerminatorStroke(
  sun: ReturnType<typeof getSunPosition>,
  width: number,
  height: number,
): string {
  const toX = (lng: number) => ((lng + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  let d = '';
  for (let lng = -180; lng <= 180; lng += 1) {
    const ha = ((lng - sun.subsolarLongitude) * Math.PI) / 180;
    const decRad = (sun.declination * Math.PI) / 180;
    let lat: number;
    if (Math.abs(sun.declination) < 0.001) {
      lat = Math.cos(ha) >= 0 ? 90 : -90;
    } else {
      lat = Math.atan((-Math.cos(ha) * Math.cos(decRad)) / Math.sin(decRad)) / (Math.PI / 180);
    }
    const cmd = lng === -180 ? 'M' : 'L';
    d += `${cmd} ${toX(lng)} ${toY(lat)} `;
  }
  return d;
}
