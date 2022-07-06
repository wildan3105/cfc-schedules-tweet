import { transformToTweetableContent, exportedForTesting } from "./tweet";
import { Emojis } from "../enums/emojis";

const fixedDate = new Date(2022, 10, 10, 10, 10, 10);
const templateBody = {
  stadium: "Stamford Bridge",
  participants: "Chelsea vs Atletico",
  date_time: fixedDate
};

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

  test("transformToTweetableContent - 1 hour before the match", async () => {
    const body = {
      hours_to_match: 1,
      ...templateBody
    };
    const data = await transformToTweetableContent(body);
    expect(typeof data).toBe("string");
    expect(data).toContain(Emojis.date);
    expect(data).toContain(Emojis.stadium);
    expect(data).toContain(Emojis.time);
    expect(data).toContain(Emojis.versus);
  });

  test("transformToTweetableContent - 24 hours before the match", async () => {
    const body = {
      hours_to_match: 24,
      ...templateBody
    };
    const data = await transformToTweetableContent(body);
    expect(typeof data).toBe("string");
  });

  test("transformToTweetableContent - other hours before the match", async () => {
    const body = {
      hours_to_match: 20,
      ...templateBody
    };
    const data = await transformToTweetableContent(body);
    expect(typeof data).toBe("string");
  });
});
