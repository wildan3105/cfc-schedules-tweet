export async function calculateDateDiffsInHours(upcomingDate: never, nowDate: never): Promise<number> {
    const diffInHours = Number(((upcomingDate - nowDate) / 36e5).toFixed(0));
    return diffInHours;
}