import { Emojis } from "../enums/emojis";
import { MonthIndexToFullMonth } from "../enums/months";
import { Team } from "../constants/team";
import momentTz = require('moment-timezone');

const UKTimezoneName = 'Europe/London';

interface ITweetBody {
  hours_to_match: number;
  stadium: string;
  participants: string;
  date_time: Date;
  tournament: string;
}

interface UKDateTime {
  date: string;
  time: string;
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

function convertToUKTimezone(datetime: Date): UKDateTime {
  const date = momentTz(datetime).tz(UKTimezoneName).format("MMMM DD, YYYY");
  const time = momentTz(datetime).tz(UKTimezoneName).format("HH:mm");
  return {
    date,
    time
  }
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

  const UKDateTime = convertToUKTimezone(message.date_time);

  const transformed = {
    header: headerTitle,
    tournament: `${Emojis.tournament} ${message.tournament}`,
    teams: `${Emojis.versus} ${message.participants}`,
    stadium: `${Emojis.stadium} ${message.stadium}`,
    date_time: `${Emojis.date} ${transformToReadableDate(message.date_time)} / ${UKDateTime.date} (UK Date)`,
    time: `${Emojis.time} ${transformToReadableTime(message.date_time)} GMT+7 / ${UKDateTime.time} (UK Time)`,
    hashtag: `${Team.hashtag}`
  };

  return Object.values(transformed).join("\n").toString() as string;
}

export const exportedForTesting = {
  transformToReadableDate,
  transformToReadableTime
};
