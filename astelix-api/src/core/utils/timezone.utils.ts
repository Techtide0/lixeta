/**
 * Convert a Date to ISO string with timezone offset
 * @param date JavaScript Date object
 * @param timezone IANA timezone string (e.g., "Africa/Lagos")
 * @returns ISO 8601 string with offset (e.g., "2026-01-05T14:30:00.000+01:00")
 */
export function convertToLocalTime(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};

  parts.forEach((part) => {
    if (part.type !== 'literal') {
      partMap[part.type] = part.value;
    }
  });

  const year = partMap['year'];
  const month = partMap['month'];
  const day = partMap['day'];
  const hour = partMap['hour'];
  const minute = partMap['minute'];
  const second = partMap['second'];

  // Get offset in minutes
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offsetMinutes = Math.round(
    (utcDate.getTime() - tzDate.getTime()) / 60000,
  );
  const offsetHours = Math.floor(offsetMinutes / 60);
  const offsetMins = Math.abs(offsetMinutes % 60);

  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offsetStr = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000${offsetStr}`;
}
