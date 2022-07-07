import { exportedForTesting, serpApiToRedis } from "./data-conversion";

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
  test("cleanseDate to return month and date only when day is provided", () => {
    const rawDate = "Sat, Jul 16";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 16");
  });

  test("cleanseDate to return month and date only when day is not provided", () => {
    const rawDate = "Jul 15";
    const cleansedDate = exportedForTesting.cleanseDate(rawDate);
    expect(cleansedDate).toBeDefined();
    expect(typeof cleansedDate).toBe("string");
    expect(cleansedDate).toBe("Jul 15");
  });
});

describe("convertTo24HourFormat to return the correct format", () => {
  test("convertTo24HourFormat to return back the argument (original time) when time is already in correct format", () => {
    const time = "23:00";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("object");
    expect(convertedTime.isNonLocalGMT).toBeFalsy();
    expect(convertedTime.time).toBe(time);
  });

  test("convertTo24HourFormat to return default time when time is written as 'TBD'", () => {
    const time = "TBD";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("object");
    expect(convertedTime.isNonLocalGMT).toBeFalsy();
    expect(convertedTime.time).toBe("00:00");
  });

  test("convertTo24HourFormat to return correct format when time is written in AM format", () => {
    const time = "12:30 AM";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("object");
    expect(convertedTime.isNonLocalGMT).toBeTruthy();
    expect(convertedTime.time).toBe("0:30");
  });

  test("convertTo24HourFormat to return correct format when time is written in PM format", () => {
    const time = "11:30 PM";
    const convertedTime = exportedForTesting.convertTo24HourFormat(time);
    expect(convertedTime).toBeDefined();
    expect(typeof convertedTime).toBe("object");
    expect(convertedTime.isNonLocalGMT).toBeTruthy();
    expect(convertedTime.time).toBe("23:30");
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