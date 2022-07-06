import { calculateDateDiffsInHours } from "./calculation";

const firstDate = new Date(2022, 10, 10, 10, 0, 0);
const secondDate = new Date(2022, 10, 10, 20, 0, 0);

describe("testing the behaviour of calculation of two dates", () => {
  test("test the positive difference between now and upcoming date", async () => {
    const data = await calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(10);
  });

  test("test the negative difference between upcoming and now date", async () => {
    const data = await calculateDateDiffsInHours(secondDate, firstDate);
    expect(data).toBe(-10);
  });

  test("test the rounding up between now and upcoming date", async () => {
    const firstDateRound = new Date(2022, 10, 10, 10, 40, 20);
    const secondDateRound = new Date(2022, 10, 10, 12, 20, 20);
    const data = await calculateDateDiffsInHours(firstDateRound, secondDateRound);
    expect(data).toBe(2);
  });
});