import { Emojis } from "../enums/emojis";
import { MonthIndexToFullMonth } from "../enums/months";
import { Team } from "../constants/team";

interface ITweetBody {
  hours_to_match: number;
  stadium: string;
  participants: string;
  date_time: Date;
  tournament: string;
}

function transformToReadableDate(date: Date): string {
  const currentDate = date.getDate();
  const currentMonth = MonthIndexToFullMonth[date.getMonth()];
  const currentYear = date.getFullYear();
  return `${currentMonth} ${currentDate}, ${currentYear}`;
}

function transformToReadableTime(date: Date): string {
  const currentHour = date.getHours();
  const currentMinutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${currentHour}:${currentMinutes}`;
}

export function transformToTweetableContent(message: ITweetBody): string {
  let headerTitle: string;
  switch (message.hours_to_match) {
    case 1:
      headerTitle = "[Matchday! ONE HOUR TO GO]";
      break;
    case 24:
      headerTitle = "[Day - 1!]";
      break;
    default:
      headerTitle = "";
  }

  const transformed = {
    header: headerTitle,
    tournament: `${Emojis.tournament} ${message.tournament}`,
    teams: `${Emojis.versus} ${message.participants}`,
    stadium: `${Emojis.stadium} ${message.stadium}`,
    date: `${Emojis.date} ${transformToReadableDate(message.date_time)}`,
    time: `${Emojis.time} ${transformToReadableTime(message.date_time)} GMT+7`,
    hashtag: `${Team.hashtag}`
  };

  return Object.values(transformed).join("\n").toString() as string;
}

export const exportedForTesting = {
  transformToReadableDate,
  transformToReadableTime
};
