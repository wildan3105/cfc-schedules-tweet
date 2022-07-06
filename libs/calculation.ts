const anHourInMilis = 3600000;

export async function calculateDateDiffsInHours(
  nowDate: Date,
  upcomingDate: Date
): Promise<number> {
  const upcomingDateInMilis = Date.parse(upcomingDate as unknown as string);
  const nowDateInMilis = Date.parse(nowDate as unknown as string);
  const diffInHours = Math.ceil(Number((upcomingDateInMilis - nowDateInMilis) / anHourInMilis));
  return diffInHours;
}
