export function tournamentToHashtag(tournament: string): string {
  let hashtag;
  switch (tournament) {
    case "Premier League":
      hashtag = "#PL";
      break;
    case "FA Cup":
      hashtag = "#FACup";
      break;

    case "Carabao Cup":
      hashtag = "#CarabaoCup";
      break;

    case "UEFA Champions League":
      hashtag = "#UCL";
      break;

    case "Club Friendlies":
      hashtag = "#ClubFriendlies";
      break;

    default:
      hashtag = "#OtherMatch";
  }

  return hashtag;
}
