import { tournamentToHashtag } from "./tournament-hashtag";

describe("test to ensure each tournament is mapped to hashtag correctly", () => {
  test("test when tournament is Premier League", () => {
    const tournamentHashtag = tournamentToHashtag("Premier League");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#PL");
  });

  test("test when tournament is FA Cup", () => {
    const tournamentHashtag = tournamentToHashtag("FA Cup");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#FACup");
  });

  test("test when tournament is Carabao Cup", () => {
    const tournamentHashtag = tournamentToHashtag("Carabao Cup");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#CarabaoCup");
  });

  test("test when tournament is UEFA Champions League", () => {
    const tournamentHashtag = tournamentToHashtag("UEFA Champions League");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#UCL");
  });

  test("test when tournament is Club Friendlies", () => {
    const tournamentHashtag = tournamentToHashtag("Club Friendlies");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#ClubFriendlies");
  });

  test("test when tournament is not all the above", () => {
    const tournamentHashtag = tournamentToHashtag("Other");
    expect(typeof tournamentHashtag).toBe("string");
    expect(tournamentHashtag).toEqual("#OtherMatch");
  });
});
