import { calculateDateDiffsInHours } from "./calculation";

describe("testing the behaviour of calculation of two dates", () => {
  test("test the positive difference between now and upcoming date", () => {
    const firstDate = new Date(2022, 10, 10, 10, 0, 0);
    const secondDate = new Date(2022, 10, 10, 20, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(10);
  });

  test("test the negative difference between upcoming and now date", () => {
    const firstDate = new Date(2022, 10, 10, 10, 0, 0);
    const secondDate = new Date(2022, 10, 10, 20, 0, 0);
    const data = calculateDateDiffsInHours(secondDate, firstDate);
    expect(data).toBe(-10);
  });

  test("test rounding down for fractional hours (less than half an hour)", () => {
    const firstDate = new Date(2022, 10, 10, 10, 0, 0);
    const secondDate = new Date(2022, 10, 10, 11, 29, 59);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(1);
  });

  test("test rounding down for fractional hours (more than half an hour)", () => {
    const firstDate = new Date(2022, 10, 10, 10, 0, 0);
    const secondDate = new Date(2022, 10, 10, 12, 30, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(2);
  });

  test("test zero difference when dates are the same", () => {
    const firstDate = new Date(2022, 10, 10, 10, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, firstDate);
    expect(data).toBe(0);
  });

  test("test negative rounding down for fractional hours (less than half an hour)", () => {
    const firstDate = new Date(2022, 10, 10, 11, 29, 59);
    const secondDate = new Date(2022, 10, 10, 10, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(-2);
  });

  test("test negative rounding down for fractional hours (more than half an hour)", () => {
    const firstDate = new Date(2022, 10, 10, 12, 30, 0);
    const secondDate = new Date(2022, 10, 10, 10, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(-3);
  });

  test("test difference across different days", () => {
    const firstDate = new Date(2022, 10, 10, 22, 0, 0);
    const secondDate = new Date(2022, 10, 11, 4, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(6);
  });

  test("test difference across different years", () => {
    const firstDate = new Date(2021, 11, 31, 23, 0, 0);
    const secondDate = new Date(2022, 0, 1, 1, 0, 0);
    const data = calculateDateDiffsInHours(firstDate, secondDate);
    expect(data).toBe(2);
  });
});
