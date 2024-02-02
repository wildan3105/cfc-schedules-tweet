import {
  addHours,
  convertToStandardSerpAPIResults,
  exportedForTesting,
  serpApiToRedis
} from "./data-conversion";

describe("test to remove incomplete data", () => {
  test("removeIncompleteSerpAPIData to return empty array if objects inside array don't have any date and time information", () => {
    const rawData = [
      {
        teams: [
          {
            name: "First Club Football"
          },
          {
            name: "Second Club Football"
          }
        ],
        tournament: "Competition Cup",
        stadium: "Homeground Stadium"
      },
      {
        teams: [
          {
            name: "First Club Football (2)"
          },
          {
            name: "Second Club Football (2)"
          }
        ],
        tournament: "Competition Cup (2)",
        stadium: "Homeground Stadium (2)"
      }
    ]
    const completedData = exportedForTesting.removeIncompleteSerpAPIData(rawData);
    expect(completedData).toEqual([]);
  });

  test("removeIncompleteSerpAPIData to return an array of an object if some of the objects inside array don't have any date and time information", () => {
    const rawData = [
      {
        teams: [
          {
            name: "First Club Football"
          },
          {
            name: "Second Club Football"
          }
        ],
        tournament: "Competition Cup",
        stadium: "Homeground Stadium",
        date: "Feb 20",
        time: "7:15 PM"
      },
      {
        teams: [
          {
            name: "First Club Football (2)"
          },
          {
            name: "Second Club Football (2)"
          }
        ],
        tournament: "Competition Cup (2)",
        stadium: "Homeground Stadium (2)"
      }
    ]
    const completedData = exportedForTesting.removeIncompleteSerpAPIData(rawData);
    expect(completedData).toHaveLength(1);
    expect(completedData[0].time).toEqual("7:15 PM");
  })
})

describe("test to ensure cleanseDate is giving the correct result", () => {
  test("cleanseDate to return month and date only when format is ddd, MMM D", () => {
    const rawDate = "Sat, Jul 30";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 30");
  });

  test("cleanseDate to return month and date only when format is ddd, MMM k", () => {
    const rawDate = "Sat, Aug 6";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Aug 6");
  });

  test("cleanseDate to return month and date only when format is MMM D", () => {
    const rawDate = "Jul 15";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 15");
  });

  test("cleanseDate to return month and date only when format is MMM D, YY", () => {
    const rawDate = "Jul 15, 22";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 15");
  });

  test("cleanseDate to return month and date only when format is D MMM", () => {
    const rawDate = "15 Jul";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 15");
  });

  test("cleanseDate to return month and date only when format is D MMMM", () => {
    const rawDate = "15 July";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 15");
  });

  test("cleanseDate to return month and date only when format is MMM k", () => {
    const rawDate = "Sep 4";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Sep 4");
  });
});

describe("convertTo24HourFormat to return the correct format", () => {
  test("convertTo24HourFormat to return back the argument (original time) when time is already in correct format", () => {
    const time = "23:00";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe(time);
  });

  test("convertTo24HourFormat to return default time when time is written as 'TBD'", () => {
    const time = "TBD";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe("00:00");
  });

  test("convertTo24HourFormat to return correct format when time is written in AM format (meridiem in capital case)", () => {
    const time = "12:30 AM";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe("0:30");
  });

  test("convertTo24HourFormat to return correct format when time is written in PM format (meridiem in capital case)", () => {
    const time = "11:30 PM";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe("23:30");
  });

  test("convertTo24HourFormat to return correct format when time is written in am format (meridiem in lower case)", () => {
    const time = "6:30 am";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe("6:30");
  });

  test("convertTo24HourFormat to return correct format when time is written in pm format (meridiem in lower case)", () => {
    const time = "5:30 pm";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("string");
    expect(convertedTime).toBe("17:30");
  });
});

describe("convertDateTimeToUTC to return the correct format", () => {
  test("convertDateTimeToUTC to return correct format when date_time is in local GMT", () => {
    const dateTime = {
      date: "Jul 10",
      time: "20:00"
    };
    const convertedDateTimeInUTC = exportedForTesting.convertDateTimeToUTC(
      dateTime.date,
      dateTime.time
    );
    expect(convertedDateTimeInUTC).toBeDefined();
    expect(typeof convertedDateTimeInUTC).toBe("object");
  });

  test("convertDateTimeToUTC to return correct format when date_time is in non-local GMT", () => {
    const dateTime = {
      date: "Sat, Jul 10",
      time: "10:00 AM"
    };
    const convertedDateTimeInUTC = exportedForTesting.convertDateTimeToUTC(
      dateTime.date,
      dateTime.time
    );
    expect(convertedDateTimeInUTC).toBeDefined();
    expect(typeof convertedDateTimeInUTC).toBe("object");
  });

  test("convertDateTimeToUTC to return correct format when date_time is in non-local GMT and env is production", () => {
    const dateTime = {
      date: "Jul 10",
      time: "10:00 AM"
    };
    process.env.ENVIRONMENT = "production";
    const convertedDateTimeInUTC = exportedForTesting.convertDateTimeToUTC(
      dateTime.date,
      dateTime.time
    );
    expect(convertedDateTimeInUTC).toBeDefined();
    expect(typeof convertedDateTimeInUTC).toBe("object");
  });
});

describe("serpApiToRedis to return the correct format of data that'll be fed into redis", () => {
  test("serpApiToReds to return correct format from serp api data - tournament is provided", async () => {
    const serpApiData = [
      {
        teams: [
          {
            name: "Chelsea"
          },
          {
            name: "Liverpool"
          }
        ],
        tournament: "Carabao Cup",
        date: "Jul 19",
        time: "10:00 AM",
        stadium: "Stamford Bridge"
      }
    ];
    const convertedData = serpApiToRedis(serpApiData);
    expect(convertedData).toBeDefined();
    expect(typeof convertedData).toBe("object");
    expect(convertedData).toHaveLength(1);
    expect(convertedData[0].tournament).toBe("Carabao Cup");
  });
});

describe("addHours to return the correct date after adding N hours from certain date", () => {
  test("addHours to return the correct date after added 7 hours", async () => {
    const now = new Date();
    const addedDate = addHours(7, now);
    expect(addedDate).toBeDefined();
    expect(typeof addedDate).toBe("object");
  });
});

describe("convertToTwitterAccountForChelseaFC to return the correct format for team name", () => {
  test("convertToTwitterAccountForChelseaFC to return @ChelseaFC if team name contains 'Chelsea'", () => {
    const teamName = "Chelsea FC";
    const convertedTeamName = exportedForTesting.convertToTwitterAccountForChelseaFC(teamName);
    expect(typeof convertedTeamName).toBe("string");
    expect(convertedTeamName).toEqual("@ChelseaFC");
  });

  test("convertToTwitterAccountForChelseaFC to return the original team name if it doesn't contain 'Chelsea'", () => {
    const teamName = "Tottenham FC";
    const convertedTeamName = exportedForTesting.convertToTwitterAccountForChelseaFC(teamName);
    expect(typeof convertedTeamName).toBe("string");
    expect(convertedTeamName).toEqual(teamName);
  });
});

describe("convertToStandardSerpAPIResults to return the correct and standard format of serp API result", () => {
  test("convertToStandardSerpAPIResults to return the standard format of game result from game spotlight when 'tomorrow' date is provided inside game_spotlight", async () => {
    const gameSpotlight = {
      league: "Florida Cup",
      date: "tomorrow, 7:00 am",
      stage: "Finale",
      teams: [
        {
          name: "Chelsea"
        },
        {
          name: "Arsenal"
        }
      ],
      stadium: "Stamford Bridge"
    };
    const convertedGameSpotlight = convertToStandardSerpAPIResults(gameSpotlight, true);
    expect(typeof convertedGameSpotlight).toBe("object");
    expect(typeof convertedGameSpotlight.date).toBe("string");
    expect(convertedGameSpotlight.time).toEqual("7:00 am");
  });

  test("convertToStandardSerpAPIResults to return the standard format of game result from game highlight when 'today' date is provided outside of game_spotlight", async () => {
    const gameSpotlight = {
      league: "Florida Cup",
      date: "today",
      time: "11:00 am",
      stage: "Finale",
      teams: [
        {
          name: "Chelsea"
        },
        {
          name: "Arsenal"
        }
      ],
      stadium: "Stamford Bridge"
    };
    const convertedGameSpotlight = convertToStandardSerpAPIResults(gameSpotlight, false);
    expect(typeof convertedGameSpotlight).toBe("object");
    expect(typeof convertedGameSpotlight.date).toBe("string");
    expect(convertedGameSpotlight.time).toEqual("11:00 am");
  });
});
