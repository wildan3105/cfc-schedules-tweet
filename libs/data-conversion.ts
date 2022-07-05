import { MultipleFixtures, Teams } from '../interfaces/serp-api';
import { Tournament } from '../constants/tournament';
import { MonthIndex } from '../constants/months';
import { Team } from '../constants/team';

function cleanseDate(date: string): string {
    const splittedDate = date.split(',');
    const clean = splittedDate.length > 1 ? splittedDate[1].trim() : splittedDate[0];
    return clean;
}

function convertDateTimeToUTC(date: string, time: string): Date {
    const currentYear = (new Date()).getFullYear();

    const cleansedDate = cleanseDate(date); 
    // TODO: need to handle AM/PM
    const cleansedTime = time === 'TBD' ? '00:00': time;

    const currentMonth = MonthIndex[cleansedDate.slice(0, 3)];
    const currentDate = Number(cleansedDate.split(' ')[1])

    const currentHours = (Number(cleansedTime.split(':')[0]));
    const currentMinutes = Number(cleansedTime.split(':')[1]);

    const dateTimeInUTC = new Date(currentYear, currentMonth, currentDate, currentHours, currentMinutes);
    return dateTimeInUTC;
}

function getStadiumName(teams: Teams[]): string {
    const stadiumName = teams[0].name.includes(Team.name) ? Team.stadium : "Opponent's Stadium";
    return stadiumName;
}

export async function serpApiToRedis(fixtures: MultipleFixtures) {
    fixtures.forEach(elem => {
        elem.participants = `${elem.teams[0].name} vs ${elem.teams[1].name}`
        elem.tournament = elem.tournament || Tournament.OTHER,
        elem.date_time = convertDateTimeToUTC(elem.date, elem.time),
        elem.stadium = getStadiumName(elem.teams)
    });

    return fixtures;
}

export async function RedisToTweet() {
    return 'ok'
}