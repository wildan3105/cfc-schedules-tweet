import {
  addHours,
  exportedForTesting,
  serpApiToRedis,
  convertToStandardSerpAPIResults
} from "./data-conversion";

const rawData = {
  teams: [
    {
      name: "Chelsea FC"
    },
    {
      name: "Real Madrid"
    }
  ],
  date_time: new Date(2022, 10, 10, 10, 0, 0)
};

describe("test to ensure getStadiumName is giving the correct result", () => {
  test("getStadiumName to return Chelsea's Stadium", () => {
    const stadiumName = exportedForTesting.getStadiumName(rawData.teams);
    expect(stadiumName).toBeDefined();
    expect(typeof stadiumName).toBe("string");
    expect(stadiumName).toBe("Stamford Bridge");
  });

  test("getStadiumName to return Opponent's stadium", () => {
    const stadiumName = exportedForTesting.getStadiumName(rawData.teams.reverse());
    expect(stadiumName).toBeDefined();
    expect(typeof stadiumName).toBe("string");
    expect(stadiumName).toBe("Opponent's Stadium");
  });
});

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

  test("cleanseDate to return month and date only when format is ddd, D MMMM", () => {
    const rawDate = "Sat, 30 July";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 30");
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
        time: "10:00 AM"
      }
    ];
    const convertedData = await serpApiToRedis(serpApiData);
    expect(convertedData).toBeDefined();
    expect(typeof convertedData).toBe("object");
    expect(convertedData).toHaveLength(1);
    expect(convertedData[0].tournament).toBe("Carabao Cup");
  });

  test("serpApiToReds to return correct format from serp api data - tournament is not provided", async () => {
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
        date: "Jul 19",
        time: "10:00 AM"
      }
    ];
    const convertedData = await serpApiToRedis(serpApiData);
    expect(convertedData).toBeDefined();
    expect(typeof convertedData).toBe("object");
    expect(convertedData).toHaveLength(1);
    expect(convertedData[0].tournament).toEqual("#OtherMatch");
  });
});

describe("addHours to return the correct date after adding N hours from certain date", () => {
  test("addHours to return the correct date after added 7 hours", async () => {
    const now = new Date();
    const addedDate = await addHours(7, now);
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
  test("convertToStandardSerpAPIResults to return the standard format of game result from game highlight", async () => {
    const gameHighlight = {
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
      ]
    };
    const convertedGameHighlight = await convertToStandardSerpAPIResults(gameHighlight);
    expect(typeof convertedGameHighlight).toBe("object");
    expect(typeof convertedGameHighlight.date).toBe("string");
    expect(convertedGameHighlight.time).toEqual("7:00 am");
  });
});
