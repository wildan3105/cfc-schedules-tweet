import * as moment from "moment-timezone";
import { Emojis } from "../enums/emojis";
import { Team } from "../constants/team";

const UKTimeZoneName = "Europe/London";

interface ITweetBody {
  hours_to_match: number;
  stadium: string;
  participants: string;
  date_time: Date;
  tournament: string;
}

function convertTournamentToHashTag(tournament: string): string {
  return `#${tournament.replace(/ /g, '')}`;
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

  const UKDate = moment(message.date_time).tz(UKTimeZoneName).format("dddd, MMMM DD, YYYY");
  const UKTime = moment(message.date_time).tz(UKTimeZoneName).format("HH:mm");

  const transformed = {
    header: headerTitle,
    tournament: `${Emojis.tournament} ${message.tournament}`,
    teams: `${Emojis.versus} ${message.participants}`,
    stadium: `${Emojis.stadium} ${message.stadium}`,
    date_time: `${Emojis.date} ${UKDate} (UK Date)`,
    time: `${Emojis.time} ${UKTime} (UK Time)`,
    hashtag: `${Team.hashtag} ${convertTournamentToHashTag(message.tournament)}`
  };

  return Object.values(transformed).join("\n").toString() as string;
}