import { transformToTweetableContent } from "./tweet";
import { Emojis } from "../enums/emojis";

const fixedDate = new Date(2022, 10, 10, 10, 10, 10);
const templateBody = {
  stadium: "Stamford Bridge",
  participants: "Chelsea vs Atletico",
  tournament: "Champions League",
  date_time: fixedDate
};

describe("tweet-related libs testing", () => {
  test("transformToTweetableContent - 1 hour before the match", async () => {
    const body = {
      hours_to_match: 1,
      ...templateBody
    };
    const data = transformToTweetableContent(body);
    expect(typeof data).toBe("string");
    expect(data).toContain(Emojis.date);
    expect(data).toContain(Emojis.stadium);
    expect(data).toContain(Emojis.time);
    expect(data).toContain(Emojis.versus);
    expect(data).toContain('#');
    expect(data).toContain('[Matchday! ONE HOUR TO GO]');
  });

  test("transformToTweetableContent - 24 hours before the match", async () => {
    const body = {
      hours_to_match: 24,
      ...templateBody
    };
    const data = transformToTweetableContent(body);
    expect(typeof data).toBe("string");
    expect(data).toContain('#');
    expect(data).toContain('[Day - 1!]')
  });

  test("transformToTweetableContent - other hours before the match", async () => {
    const body = {
      hours_to_match: 20,
      ...templateBody
    };
    const data = transformToTweetableContent(body);
    expect(typeof data).toBe("string");
    expect(data).toContain('#');
  });
});
