const anHourInMilis = 3600000;

export async function calculateDateDiffsInHours(
  nowDate: Date,
  upcomingDate: Date
): Promise<number> {
  const upcomingDateInMilis = Date.parse(upcomingDate as unknown as string);
  const nowDateInMilis = Date.parse(nowDate as unknown as string);
  const diffInHours = Number(((upcomingDateInMilis - nowDateInMilis) / anHourInMilis).toFixed(0));
  return diffInHours;
}
