/**
 * Format a Date in a specific IANA timezone, falling back to the browser
 * timezone if `tz` is null/undefined. All timezone-aware UI formatting in
 * the app should go through here so locations behave consistently.
 */
export function formatInZone(date, tz, options = {}) {
  if (!date || isNaN(date)) return '—';
  return new Intl.DateTimeFormat('es-ES', { timeZone: tz || undefined, ...options })
    .format(date);
}

export function formatHM(date, tz) {
  return formatInZone(date, tz, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatHMS(date, tz, hour12 = false) {
  return formatInZone(date, tz, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  });
}

export function formatDate(date, tz) {
  return formatInZone(date, tz, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: tz || undefined
  });
}

/**
 * Returns parts of a time formatted in the given timezone. Useful when we
 * need each part separately (e.g. for big-display clock layouts).
 */
export function timeParts(date, tz, hour12 = false) {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12,
    timeZone: tz || undefined
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
    dayPeriod: get('dayPeriod')?.toLowerCase() || null
  };
}

/**
 * Short label for a timezone, like "GMT+9" or "GMT-3". Uses `timeZoneName: 'shortOffset'`.
 */
export function tzShortLabel(tz, ref = new Date()) {
  if (!tz) {
    const off = -ref.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '−';
    const h = Math.floor(Math.abs(off) / 60);
    const m = Math.abs(off) % 60;
    return `GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
  }
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      timeZoneName: 'shortOffset'
    });
    const part = fmt.formatToParts(ref).find((p) => p.type === 'timeZoneName');
    return part?.value ?? '';
  } catch {
    return '';
  }
}
