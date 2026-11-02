/**
 * Pure Date-Only Calendar Arithmetic for Age Calculation
 * Avoids timezone shifts and DST errors by operating strictly on (year, month, day) integers.
 *
 * February 29 Birthday Convention in Non-Leap Years:
 * For a birth date of Feb 29, in any non-leap year the annual birthday milestone is treated
 * as occurring on Feb 28. Thus:
 * - On Feb 28 of a non-leap year, a person born on Feb 29 has completed their full year (0 months, 0 days).
 * - On Mar 1 of a non-leap year, a person born on Feb 29 is X years, 0 months, 1 day old.
 * - For Next Birthday countdowns, if the next birthday falls in a non-leap year, it is observed on Feb 28.
 */

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export interface AgeCalculationResult {
  valid: boolean;
  error?: string;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  birthDayOfWeek: string;
  nextBirthdayDate: string; // YYYY-MM-DD
  nextBirthdayFormatted: string;
  daysUntilNextBirthday: number;
  isBirthdayToday: boolean;
  feb29NoteApplied: boolean;
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}

export function parseDateString(dateStr: string): CalendarDate | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12) return null;
  const maxDay = getDaysInMonth(year, month);
  if (day < 1 || day > maxDay) return null;

  return { year, month, day };
}

export function formatCalendarDateISO(d: CalendarDate): string {
  const y = String(d.year).padStart(4, '0');
  const m = String(d.month).padStart(2, '0');
  const day = String(d.day).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatCalendarDateHuman(d: CalendarDate): string {
  return `${d.day} ${MONTH_NAMES[d.month - 1]} ${d.year}`;
}

/**
 * Converts a CalendarDate to a Rata Die / Julian Day Number integer for exact day difference
 * and day-of-week math without using JavaScript Date timezones.
 */
export function toRataDie(d: CalendarDate): number {
  let y = d.year;
  let m = d.month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m - 3) + 2) / 5) + d.day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468; // days relative to 1970-01-01
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function getDayOfWeekName(d: CalendarDate): string {
  // 1970-01-01 (RataDie 0) was a Thursday (index 4)
  const rd = toRataDie(d);
  const idx = ((rd + 4) % 7 + 7) % 7;
  return WEEKDAYS[idx];
}

export function getBirthdayInYear(birth: CalendarDate, targetYear: number): CalendarDate {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(targetYear)) {
    return { year: targetYear, month: 2, day: 28 };
  }
  return { year: targetYear, month: birth.month, day: birth.day };
}

export function calculateAge(birthDateStr: string, targetDateStr: string): AgeCalculationResult {
  const birth = parseDateString(birthDateStr);
  if (!birth) {
    return {
      valid: false,
      error: 'Please enter a valid Date of Birth (YYYY-MM-DD).',
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      birthDayOfWeek: '',
      nextBirthdayDate: '',
      nextBirthdayFormatted: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      feb29NoteApplied: false,
    };
  }

  const target = parseDateString(targetDateStr);
  if (!target) {
    return {
      valid: false,
      error: 'Please enter a valid "Calculate age on" date (YYYY-MM-DD).',
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      birthDayOfWeek: '',
      nextBirthdayDate: '',
      nextBirthdayFormatted: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      feb29NoteApplied: false,
    };
  }

  if (compareDates(birth, target) > 0) {
    return {
      valid: false,
      error: 'Date of birth cannot be after the selected calculation date.',
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      birthDayOfWeek: '',
      nextBirthdayDate: '',
      nextBirthdayFormatted: '',
      daysUntilNextBirthday: 0,
      isBirthdayToday: false,
      feb29NoteApplied: false,
    };
  }

  const totalDays = toRataDie(target) - toRataDie(birth);
  const birthDayOfWeek = getDayOfWeekName(birth);
  const feb29NoteApplied = birth.month === 2 && birth.day === 29;

  // Step 1: Determine completed years and completed months using anchor-month clamping
  let totalMonths = (target.year - birth.year) * 12 + (target.month - birth.month);

  // Anchor date at `birth + totalMonths` (clamped to end of month, matching Feb 28 convention for Feb 29)
  const getClampedAnchor = (monthsToAdd: number): CalendarDate => {
    const totalM = (birth.year * 12 + (birth.month - 1)) + monthsToAdd;
    const y = Math.floor(totalM / 12);
    const m = (totalM % 12) + 1;
    const maxD = getDaysInMonth(y, m);
    const d = Math.min(birth.day, maxD);
    return { year: y, month: m, day: d };
  };

  let anchor = getClampedAnchor(totalMonths);
  if (compareDates(anchor, target) > 0) {
    totalMonths -= 1;
    anchor = getClampedAnchor(totalMonths);
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = toRataDie(target) - toRataDie(anchor);

  // Next birthday calculation relative to `target`
  let nextBirthday = getBirthdayInYear(birth, target.year);
  const cmpThisYear = compareDates(nextBirthday, target);
  const isBirthdayToday = cmpThisYear === 0;

  if (cmpThisYear < 0) {
    nextBirthday = getBirthdayInYear(birth, target.year + 1);
  }

  const daysUntilNextBirthday = isBirthdayToday
    ? 0
    : toRataDie(nextBirthday) - toRataDie(target);

  return {
    valid: true,
    years,
    months,
    days,
    totalDays,
    birthDayOfWeek,
    nextBirthdayDate: formatCalendarDateISO(nextBirthday),
    nextBirthdayFormatted: formatCalendarDateHuman(nextBirthday),
    daysUntilNextBirthday,
    isBirthdayToday,
    feb29NoteApplied,
  };
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
