import type { Timestamp } from 'firebase/firestore';

type DateLike = {
  toDate: () => Date;
};

export type DateInputValue = string | Date | Timestamp | DateLike | null | undefined;

const hasToDate = (value: unknown): value is DateLike =>
  typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as DateLike).toDate === 'function';

const isValidDate = (value: Date) => Number.isNaN(value.getTime()) === false;

export const parseDateInput = (value: DateInputValue): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isValidDate(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, yearStr, monthStr, dayStr] = isoMatch;
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      if ([year, month, day].every((num) => Number.isFinite(num))) {
        const localDate = new Date(year, month - 1, day);
        return isValidDate(localDate) ? localDate : null;
      }
      return null;
    }
    const parsed = new Date(trimmed);
    return isValidDate(parsed) ? parsed : null;
  }
  if (hasToDate(value)) {
    const parsed = value.toDate();
    if (!isValidDate(parsed)) return null;
    const normalized = new Date(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    );
    return isValidDate(normalized) ? normalized : null;
  }
  return null;
};

export const formatDateForInput = (value: DateInputValue): string => {
  const parsed = parseDateInput(value);
  if (!parsed) return '';
  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateAgeFromDate = (value: DateInputValue, fallbackAge?: number | null): number | null => {
  const birthDate = parseDateInput(value);
  if (!birthDate) {
    return typeof fallbackAge === 'number' ? fallbackAge : null;
  }
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasBirthdayPassedThisYear) {
    age -= 1;
  }
  return age;
};
