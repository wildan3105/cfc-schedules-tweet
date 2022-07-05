import { calculateDateDiffsInHours } from "./calculation";

const firstDate = new Date(2022, 10, 10, 10, 0, 0);
const secondDate = new Date(2022, 10, 10, 20, 0, 0);

test("test the positive difference between now and upcoming date", async () => {
  const data = await calculateDateDiffsInHours(firstDate, secondDate);
  expect(data).toBe(10);
});

test("test the negative difference between now and upcoming date", async () => {
  const data = await calculateDateDiffsInHours(secondDate, firstDate);
  expect(data).toBe(-10);
});
