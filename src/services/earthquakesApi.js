const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

/**
 * Fetches recent seismic events from USGS as a GeoJSON FeatureCollection.
 * @ai-assisted Claude proposed the URLSearchParams pattern; reviewed against
 *   the FDSN spec at earthquake.usgs.gov/fdsnws/event/1/.
 */
export async function getRecentEarthquakes({
  minMagnitude = 4.5,
  hoursWindow = 168,
} = {}) {
  const end = new Date();
  const start = new Date(Date.now() - hoursWindow * 3_600_000);

  const url = new URL(BASE);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('starttime', start.toISOString());
  url.searchParams.set('endtime', end.toISOString());
  url.searchParams.set('minmagnitude', String(minMagnitude));
  url.searchParams.set('orderby', 'time');
  url.searchParams.set('limit', '500');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`USGS API failed (${res.status})`);
  return res.json();
}
