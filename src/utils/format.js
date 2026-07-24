// Date, time and number formatting for the dashboard.
//
// Everything here is a pure function so it can be tested without rendering.

/**
 * Parse a timestamp as it comes back from the API.
 *
 * MySQL DATETIME arrives as "2026-12-05 02:42:11" with no timezone. Replacing
 * the space with a "T" makes it a valid local-time ISO string in every browser;
 * left as-is, Safari refuses to parse it at all.
 */
export function parseTimestamp(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Swiss date and time: `05.12.2026, 02:42`.
 *
 * Formatted by hand rather than through Intl with `de-CH`. The output has to be
 * exactly this, and ICU builds disagree on details — some emit a narrow no-break
 * space before the time, some render midnight as 24:00. Padding the parts
 * ourselves is shorter than the code needed to normalize those away.
 */
export function formatSwiss(value) {
  const date = parseTimestamp(value);
  if (!date) return '';

  const pad = (n) => String(n).padStart(2, '0');

  return (
    `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}` +
    `, ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Swiss date only: `05.12.2026`. */
export function formatSwissDate(value) {
  const formatted = formatSwiss(value);
  return formatted ? formatted.split(',')[0] : '';
}

/**
 * A short relative label — "2 h ago", "gestern"-style but in English.
 *
 * Shown next to the absolute time, never instead of it: "3 d ago" is quick to
 * scan, but only the absolute timestamp answers "when exactly did this arrive".
 */
export function formatRelative(value, now = new Date()) {
  const date = parseTimestamp(value);
  if (!date) return '';

  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;

  return `${Math.floor(days / 365)} y ago`;
}

/** "1 submission" / "2 submissions" — no bare "1 submissions" anywhere. */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Shorten a long token for display, keeping both ends recognizable. */
export function truncateMiddle(value, visible = 6) {
  const text = String(value ?? '');
  if (text.length <= visible * 2 + 1) return text;
  return `${text.slice(0, visible)}…${text.slice(-visible)}`;
}
