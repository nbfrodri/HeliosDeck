/**
 * Format a Date in a specific IANA timezone using the given UI locale.
 * All timezone-aware UI formatting in the app should go through here so
 * locations behave consistently.
 */
export function formatInZone(date, tz, options = {}, locale = 'es') {
  if (!date || isNaN(date)) return '—';
  const tag = bcp47(locale);
  return new Intl.DateTimeFormat(tag, { timeZone: tz || undefined, ...options })
    .format(date);
}

export function formatHM(date, tz, locale = 'es') {
  return formatInZone(date, tz, { hour: '2-digit', minute: '2-digit', hour12: false }, locale);
}

export function formatHMS(date, tz, hour12 = false, locale = 'es') {
  return formatInZone(date, tz, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12
  }, locale);
}

export function formatDate(date, tz, locale = 'es') {
  return formatInZone(date, tz, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: tz || undefined
  }, locale);
}

/**
 * Returns parts of a time formatted in the given timezone. Useful when we
 * need each part separately (e.g. for big-display clock layouts).
 */
export function timeParts(date, tz, hour12 = false, locale = 'es') {
  const tag = bcp47(locale);
  const formatter = new Intl.DateTimeFormat(tag, {
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

function bcp47(locale) {
  if (locale === 'es') return 'es-ES';
  if (locale === 'en') return 'en-US';
  return locale;
}
