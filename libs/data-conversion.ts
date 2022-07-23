import parseFormat = require("moment-parseformat");
import moment = require("moment");

import { SingleFixture, Teams } from "../interfaces/serp-api";
import { RedisFixture } from "../interfaces/redis";
import { Tournament } from "../constants/tournament";
import { PartialMonthToIndex } from "../enums/months";
import { Team } from "../constants/team";
import { Time, defaultTimeFormat, TBDFormat } from "../constants/time-conversion";

function getStadiumName(teams: Teams[]): string {
  const stadiumName = teams[0].name.includes(Team.name) ? Team.stadium : "Opponent's Stadium";
  return stadiumName;
}

function cleanseDate(date: string): string {
  const excludedMomentFormats = ["MMM YY", "ddd, MMM YY", "ddd, MMM k"];
  const momentFormat = parseFormat(date);
  let clean;
  /**
   * excluded because it's being falsy read
   * e.g.
   * Jul 30 being read as MMM YYY instead of MMM D
   * Sat, Jul 30 being read as ddd, MMM YY instead of ddd, MMM D
   */
  if (excludedMomentFormats.includes(momentFormat)) {
    const splittedDate = date.split(",");
    clean = splittedDate.length > 1 ? splittedDate[1].trim() : splittedDate[0];
  } else {
    clean = moment(date, momentFormat).format("MMM D");
  }
  return clean;
}

function convertTo24HourFormat(time: string): string {
  const meridiems = ["AM", "PM", "am", "pm"];

  if (meridiems.some(v => time.includes(v))) {
    const meridiem = time.split(":")[1].slice(3, 5).toLocaleLowerCase();
    const minutes = time.split(":")[1].slice(0, 2);

    let hours = Number(time.split(":")[0]);

    if (meridiem == "am" && hours === Time.offset) hours = hours - Time.offset;
    if (meridiem == "pm" && hours < Time.offset) hours = hours + Time.offset;

    return `${hours}:${minutes}`;
  } else if (time === TBDFormat) {
    return defaultTimeFormat;
  }
  return time;
}

function convertDateTimeToUTC(date: string, time: string): Date {
  const currentYear = new Date().getFullYear();

  const cleansedDate = cleanseDate(date);
  const cleansedTime = convertTo24HourFormat(time);

  const currentMonth = PartialMonthToIndex[cleansedDate.slice(0, 3)];
  const currentDate = Number(cleansedDate.split(" ")[1]);

  const currentHours =
    process.env.ENVIRONMENT === "local"
      ? Number(cleansedTime.split(":")[0]) - 7
      : Number(cleansedTime.split(":")[0]);
  const currentMinutes = Number(cleansedTime.split(":")[1]);

  const dateTimeInUTC = new Date(
    currentYear,
    currentMonth,
    currentDate,
    currentHours,
    currentMinutes
  );
  return dateTimeInUTC;
}

export async function serpApiToRedis(fixtures: Partial<SingleFixture[]>): Promise<RedisFixture[]> {
  fixtures.forEach(elem => {
    elem.participants = `${elem.teams[0].name} vs ${elem.teams[1].name}`;
    (elem.tournament = elem.tournament || Tournament.OTHER),
      (elem.date_time = convertDateTimeToUTC(elem.date, elem.time)),
      (elem.stadium = getStadiumName(elem.teams));
  });

  return fixtures;
}

export async function addHours(numOfHours: number, date: Date): Promise<Date> {
  const dateCopy = new Date(date.getTime());

  dateCopy.setHours(dateCopy.getHours() + numOfHours);

  return dateCopy;
}

export const exportedForTesting = {
  getStadiumName,
  convertDateTimeToUTC,
  convertTo24HourFormat,
  cleanseDate
};