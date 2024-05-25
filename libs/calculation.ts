const anHourInMilis = 3600000;

export function calculateDateDiffsInHours(
  nowDate: Date,
  upcomingDate: Date
): number {
  const upcomingDateInMilis = Date.parse(upcomingDate as unknown as string);
  const nowDateInMilis = Date.parse(nowDate as unknown as string);
  const diffInHours = Math.ceil(Number((upcomingDateInMilis - nowDateInMilis) / anHourInMilis));
  return diffInHours;
}
