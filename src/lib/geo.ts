/** Project lat/lng to equirectangular map coordinates (2:1 aspect). */
export function projectEquirectangular(
  lat: number,
  lng: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  };
}
