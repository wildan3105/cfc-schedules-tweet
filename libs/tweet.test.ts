import { transformToTweetableContent, exportedForTesting } from "./tweet";

const fixedDate = new Date(2022, 10, 10, 10, 10, 10);

describe("tweet-related libs testing", () => {
  test("test the transformToReadableTime - normal flow", () => {
    const data = exportedForTesting.transformToReadableTime(fixedDate);
    expect(typeof data).toBe("string");
    expect(data).toBe("10:10");
  });

  test("test the transformToReadableTime - minutes less than 10 gets added 0 in the beginning", () => {
    const dateWithCustomTime = new Date(2022, 10, 10, 10, 5, 20);
    const data = exportedForTesting.transformToReadableTime(dateWithCustomTime);
    expect(typeof data).toBe("string");
    expect(data).toBe("10:05");
  });

  test("test the transformToReadableDate - normal flow", () => {
    const data = exportedForTesting.transformToReadableDate(fixedDate);
    expect(typeof data).toBe("string");
    expect(data).toContain(",");
    expect(data).toBe("November 10, 2022");
  });
});
