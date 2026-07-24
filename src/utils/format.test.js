import { formatSwiss, formatSwissDate, formatRelative, parseTimestamp, pluralize, truncateMiddle } from './format.js';

describe('formatSwiss', () => {
  it('formats a MySQL datetime as DD.MM.YYYY, HH:mm', () => {
    expect(formatSwiss('2026-12-05 02:42:11')).toBe('05.12.2026, 02:42');
  });

  it('pads single-digit days, months and hours', () => {
    expect(formatSwiss('2026-01-07 09:05:00')).toBe('07.01.2026, 09:05');
  });

  it('uses 24-hour time, never am/pm', () => {
    expect(formatSwiss('2026-06-15 14:30:00')).toBe('15.06.2026, 14:30');
    expect(formatSwiss('2026-06-15 23:59:00')).toBe('15.06.2026, 23:59');
  });

  it('renders midnight as 00:00, not 24:00', () => {
    expect(formatSwiss('2026-06-15 00:00:00')).toBe('15.06.2026, 00:00');
  });

  it('separates date and time with a plain comma and space', () => {
    // Some ICU builds emit a narrow no-break space here, which looks like a
    // rendering bug in a table.
    expect(formatSwiss('2026-12-05 02:42:11')).toContain(', ');
    expect(formatSwiss('2026-12-05 02:42:11')).not.toMatch(/ | /);
  });

  it('never produces US-style output', () => {
    const formatted = formatSwiss('2026-12-05 14:42:11');
    expect(formatted).not.toMatch(/[ap]\.?m\.?/i);
    expect(formatted).not.toBe('12/5/2026, 2:42 PM');
  });

  it('returns an empty string for missing or unparseable input', () => {
    expect(formatSwiss(null)).toBe('');
    expect(formatSwiss(undefined)).toBe('');
    expect(formatSwiss('')).toBe('');
    expect(formatSwiss('not a date')).toBe('');
  });

  it('accepts a Date object', () => {
    expect(formatSwiss(new Date(2026, 11, 5, 2, 42))).toBe('05.12.2026, 02:42');
  });
});

describe('formatSwissDate', () => {
  it('returns the date part only', () => {
    expect(formatSwissDate('2026-12-05 02:42:11')).toBe('05.12.2026');
  });

  it('returns an empty string for bad input', () => {
    expect(formatSwissDate(null)).toBe('');
  });
});

describe('parseTimestamp', () => {
  it('parses a MySQL datetime as local time', () => {
    const date = parseTimestamp('2026-12-05 02:42:11');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(11);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(2);
  });

  it('returns null rather than an Invalid Date', () => {
    expect(parseTimestamp('nonsense')).toBeNull();
    expect(parseTimestamp(null)).toBeNull();
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-12-05T12:00:00');

  it('describes recent times', () => {
    expect(formatRelative('2026-12-05 11:59:40', now)).toBe('just now');
    expect(formatRelative('2026-12-05 11:45:00', now)).toBe('15 min ago');
    expect(formatRelative('2026-12-05 10:00:00', now)).toBe('2 h ago');
  });

  it('describes older times', () => {
    expect(formatRelative('2026-12-03 12:00:00', now)).toBe('2 d ago');
    expect(formatRelative('2026-11-21 12:00:00', now)).toBe('2 w ago');
    expect(formatRelative('2026-09-05 12:00:00', now)).toBe('3 mo ago');
    expect(formatRelative('2024-12-05 12:00:00', now)).toBe('2 y ago');
  });

  it('does not show negative times when a clock is slightly ahead', () => {
    expect(formatRelative('2026-12-05 12:00:30', now)).toBe('just now');
  });

  it('returns an empty string for bad input', () => {
    expect(formatRelative(null, now)).toBe('');
  });
});

describe('pluralize', () => {
  it('agrees with the count', () => {
    expect(pluralize(0, 'submission')).toBe('0 submissions');
    expect(pluralize(1, 'submission')).toBe('1 submission');
    expect(pluralize(2, 'submission')).toBe('2 submissions');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(1, 'entry', 'entries')).toBe('1 entry');
    expect(pluralize(3, 'entry', 'entries')).toBe('3 entries');
  });
});

describe('truncateMiddle', () => {
  it('shortens long tokens but keeps both ends', () => {
    expect(truncateMiddle('e907e569a94bc57c8b28fc70')).toBe('e907e5…28fc70');
  });

  it('leaves short values alone', () => {
    expect(truncateMiddle('abc')).toBe('abc');
  });

  it('handles nullish input', () => {
    expect(truncateMiddle(null)).toBe('');
  });
});
