/* eslint-disable no-self-assign */
import parseFormat = require("moment-parseformat");
import moment = require("moment");

import { Fixture, GameSpotlight } from "../interfaces/serp-api";
import { RedisFixture } from "../interfaces/redis";
import { PartialMonthToIndex } from "../enums/months";
import { Team } from "../constants/team";
import { Time, defaultTimeFormat, TBDFormat } from "../constants/time-conversion";

const MOMENT_DEFAULT_FORMAT = "MMM D";
type Operation = "add" | "substract";

function cleanseDate(date: string): string {
  const excludedMomentFormats = [
    "MMM YY",
    "ddd, MMM YY",
    "ddd, MMM k",
    "MMM k",
    "MMM DD",
    "MMMM YY",
    "ddd, MMMM YY"
  ];
  const momentFormat = parseFormat(date);
  let clean: string;
  /**
   * excluded because it's being falsy read
   * e.g.
   * Jul 30 being read as MMM YYY instead of MMM D
   * Sep 4 being read as MMM k instead of MMM D
   * Sat, Jul 30 being read as ddd, MMM YY instead of ddd, MMM D
   * Sat, Aug 6 being read as ddd, MMM k instead of ddd, MMM D
   */
  if (excludedMomentFormats.includes(momentFormat)) {
    const splittedDate = date.split(",");
    clean = splittedDate.length > 1 ? splittedDate[1].trim() : splittedDate[0];
  } else {
    clean = moment(date, momentFormat).format(MOMENT_DEFAULT_FORMAT);
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
    process.env.ENVIRONMENT === "production"
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

export function removeIncompleteSerpAPIData(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter(f => f.time !== "TBD" && f.date !== undefined);
}

function convertToTwitterAccountForChelseaFC(team: string): string {
  return team.includes(Team.name) ? Team.twitterAccount : team;
}

export function convertToStandardSerpAPIResults(
  data: GameSpotlight | Fixture,
  fromSpotlight: boolean
): Record<string, unknown> {
  let time: unknown, date: string | string[];
  if (fromSpotlight) {
    time = data.date.split(",")[1].trim();
    date = data.date.split(",")[0].toLowerCase().trim();
  } else {
    time = data.time.trim();
    date = data.date.toLowerCase().trim();
  }
  if (date.includes("tomorrow")) {
    date = moment(adjustHours("add", 24, new Date())).format(MOMENT_DEFAULT_FORMAT);
  } else if (date.includes("today")) {
    date = moment(new Date()).format(MOMENT_DEFAULT_FORMAT);
  }
  return {
    teams: data.teams,
    tournament: data.tournament || data.league,
    stadium: data.stadium,
    date,
    time
  };
}

export function serpApiToRedis(fixtures: Fixture[]): RedisFixture[] {
  return fixtures.map(elem => {
    return {
      ...elem,
      participants: `${convertToTwitterAccountForChelseaFC(elem.teams[0].name)} vs ${convertToTwitterAccountForChelseaFC(elem.teams[1].name)}`,
      tournament: elem.tournament,
      match_time: convertDateTimeToUTC(elem.date, elem.time),
      stadium: elem.stadium
    };
  });
}

export function adjustHours(opType: Operation, numOfHours: number, date: Date): Date {
  const dateCopy = new Date(date.getTime());

  if (opType === "add") {
    dateCopy.setHours(dateCopy.getHours() + numOfHours);
  } else if (opType === "substract") {
    dateCopy.setHours(dateCopy.getHours() - numOfHours);
  }

  return dateCopy;
}

export const exportedForTesting = {
  convertDateTimeToUTC,
  convertTo24HourFormat,
  cleanseDate,
  convertToTwitterAccountForChelseaFC,
  removeIncompleteSerpAPIData
};
