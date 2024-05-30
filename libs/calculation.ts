const anHourInMillis = 3600000;

export function calculateDateDiffsInHours(nowDate: Date, upcomingDate: Date): number {
  const upcomingDateInMillis = upcomingDate.getTime();
  const nowDateInMillis = nowDate.getTime();
  const diffInMillis = upcomingDateInMillis - nowDateInMillis;
  const diffInHours = diffInMillis / anHourInMillis;
  return Math.floor(diffInHours);
}
