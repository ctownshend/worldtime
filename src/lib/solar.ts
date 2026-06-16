const DEG = Math.PI / 180;

export interface SunPosition {
  /** Subsolar latitude in degrees. */
  declination: number;
  /** Subsolar longitude in degrees (east positive). */
  subsolarLongitude: number;
}

/** Approximate sun position using a standard astronomical algorithm. */
export function getSunPosition(date: Date): SunPosition {
  const jd =
    date.getTime() / 86_400_000 -
    date.getTimezoneOffset() / 1_440 +
    2_440_587.5;

  const n = jd - 2_451_545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;

  const declination = Math.asin(Math.sin(23.439 * DEG) * Math.sin(lambda)) / DEG;

  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const subsolarLongitude = (12 - utcHours) * 15 - (date.getUTCMilliseconds() / 3_600_000) * 15;

  return { declination, subsolarLongitude: normalizeLongitude(subsolarLongitude) };
}

export function normalizeLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

/** Solar elevation in degrees; negative means below the horizon (night). */
export function solarElevation(lat: number, lng: number, sun: SunPosition): number {
  const latRad = lat * DEG;
  const decRad = sun.declination * DEG;
  const hourAngle = (lng - sun.subsolarLongitude) * DEG;

  const sinElev =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle);

  return Math.asin(Math.max(-1, Math.min(1, sinElev))) / DEG;
}

export function isNight(lat: number, lng: number, sun: SunPosition): boolean {
  return solarElevation(lat, lng, sun) < 0;
}

/** Latitude of the solar terminator at a given longitude. */
export function terminatorLatitude(lng: number, sun: SunPosition): number {
  const ha = (lng - sun.subsolarLongitude) * DEG;
  const decRad = sun.declination * DEG;

  if (Math.abs(sun.declination) < 0.001) {
    return Math.cos(ha) >= 0 ? 90 : -90;
  }

  const tanLat = (-Math.cos(ha) * Math.cos(decRad)) / Math.sin(decRad);
  return Math.atan(tanLat) / DEG;
}

/** Build an SVG path for the night hemisphere on an equirectangular map (2:1). */
export function buildNightOverlayPath(sun: SunPosition, width: number, height: number): string {
  const southNight = isNight(-90, 0, sun);
  const northNight = isNight(90, 0, sun);

  const toX = (lng: number) => ((lng + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  const points: Array<{ lng: number; lat: number }> = [];
  for (let lng = -180; lng <= 180; lng += 2) {
    points.push({ lng, lat: terminatorLatitude(lng, sun) });
  }

  const parts: string[] = [];

  if (southNight) {
    parts.push(`M 0 ${height} L ${width} ${height}`);
    for (let i = points.length - 1; i >= 0; i--) {
      parts.push(`L ${toX(points[i].lng)} ${toY(points[i].lat)}`);
    }
    parts.push('Z');
  }

  if (northNight) {
    parts.push(`M 0 0 L ${width} 0`);
    for (const p of points) {
      parts.push(`L ${toX(p.lng)} ${toY(p.lat)}`);
    }
    parts.push('Z');
  }

  return parts.join(' ');
}

/** Twilight band path between two elevation angles (e.g. 0 and -6 civil twilight). */
export function buildTwilightBandPath(
  sun: SunPosition,
  width: number,
  height: number,
  _upperDeg: number,
  lowerDeg: number,
): string {
  const bandAtLng = (lng: number, targetDeg: number) => {
    const ha = (lng - sun.subsolarLongitude) * DEG;
    const decRad = sun.declination * DEG;
    const target = targetDeg * DEG;
    const cosLat =
      (Math.sin(target) - Math.sin(decRad) * Math.sin(0)) /
      (Math.cos(decRad) * Math.cos(ha));
    if (cosLat < -1 || cosLat > 1) return targetDeg < 0 ? -90 : 90;
    const lat = Math.acos(Math.max(-1, Math.min(1, cosLat))) / DEG;
    return ha > 0 ? -lat : lat;
  };

  const toX = (lng: number) => ((lng + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  const upper: Array<{ lng: number; lat: number }> = [];
  const lower: Array<{ lng: number; lat: number }> = [];

  for (let lng = -180; lng <= 180; lng += 2) {
    upper.push({ lng, lat: terminatorLatitude(lng, sun) });
    lower.push({ lng, lat: bandAtLng(lng, lowerDeg) });
  }

  let path = `M ${toX(upper[0].lng)} ${toY(upper[0].lat)}`;
  for (let i = 1; i < upper.length; i++) {
    path += ` L ${toX(upper[i].lng)} ${toY(upper[i].lat)}`;
  }
  for (let i = lower.length - 1; i >= 0; i--) {
    path += ` L ${toX(lower[i].lng)} ${toY(lower[i].lat)}`;
  }
  path += ' Z';
  return path;
}
