import { MultipleFixtures } from '../interfaces/serp-api';
import { Tournament } from '../constants/tournament';
import { MonthIndex } from '../constants/months';

function cleanseDate(date: string): string {
    const splittedDate = date.split(',');
    const clean = splittedDate.length > 1 ? splittedDate[1].trim() : splittedDate[0];
    return clean;
}

function convertDateTimeToUTC(date: string, time: string): Date {
    const currentYear = (new Date()).getFullYear();

    const cleansedDate = cleanseDate(date); // remove day
    const cleansedTime = time === 'TBD' ? '00:00': time ; // remove AM/PM and TBD

    const currentMonth = MonthIndex[cleansedDate.slice(0, 3)];
    const currentDate = Number(cleansedDate.split(' ')[1])

    const currentHours = (Number(cleansedTime.split(':')[0]));
    const currentMinutes = Number(cleansedTime.split(':')[1]);

    const dateTimeInUTC = new Date(currentYear, currentMonth, currentDate, currentHours, currentMinutes);
    return dateTimeInUTC;
}

export async function serpApiToRedis(fixtures: MultipleFixtures) {
    fixtures.forEach(elem => {
        elem.participants = `${elem.teams[0].name} vs ${elem.teams[1].name}`
        elem.tournament = elem.tournament || Tournament.OTHER,
        elem.date_time = convertDateTimeToUTC(elem.date, elem.time)
    });

    return fixtures;
}

export async function RedisToTweet() {
    return 'ok'
}