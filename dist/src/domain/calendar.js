const DAY = 86400000;
/** Día del mes (UTC) del n-ésimo `weekday` (0 = domingo) de un mes; n = -1 es el último. */
function nthWeekday(year, month, weekday, n) {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
    return Date.UTC(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const lastWeekday = new Date(Date.UTC(year, month, last)).getUTCDay();
  return Date.UTC(year, month, last - ((lastWeekday - weekday + 7) % 7));
}
export function occasionTime(when, year) {
  return when.day ? Date.UTC(year, when.month, when.day) : nthWeekday(year, when.month, when.weekday, when.nth);
}
/**
 * La fecha especial más cercana dentro de `windowDays`, o null. Es urgencia real de calendario:
 * nada se inventa ni se cuenta hacia atrás para presionar.
 */
export function nextOccasion(now, calendar, windowDays = 45) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let best = null;
  for (const item of calendar) {
    for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
      const days = Math.round((occasionTime(item.when, year) - today) / DAY);
      if (days >= 0 && (!best || days < best.days)) best = {...item, days};
    }
  }
  return best && best.days <= windowDays ? best : null;
}
