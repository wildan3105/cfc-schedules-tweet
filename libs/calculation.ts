const anHourInMilis = 36e5;

export async function calculateDateDiffsInHours(
  upcomingDate: never,
  nowDate: never
): Promise<number> {
  const diffInHours = Number(((upcomingDate - nowDate) / anHourInMilis).toFixed(0));
  return diffInHours;
}
