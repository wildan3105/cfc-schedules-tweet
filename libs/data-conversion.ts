import { MultipleFixtures, Teams } from '../interfaces/serp-api';
import { Tournament } from '../constants/tournament';
import { MonthIndex } from '../constants/months';
import { Team } from '../constants/team';
import { Time, defaultTimeFormat, TBDFormat } from '../constants/time-conversion';

interface TimeFormat {
    time: string;
    isNonLocalGMT?: boolean;
}

function cleanseDate(date: string): string {
    const splittedDate = date.split(',');
    const clean = splittedDate.length > 1 ? splittedDate[1].trim() : splittedDate[0];
    return clean;
}

function convertTo24HourFormat(time: string): TimeFormat {
    const meridiems = ['AM', 'PM'];
    
    if (meridiems.some(v => time.includes(v))) {
        const meridiem = (time.split(":")[1]).slice(3,5);
        const minutes = time.split(":")[1].slice(0,2);
    
        let hours = Number(time.split(":")[0]);
        
        if (meridiem == "PM" && hours < Time.offset) hours = hours + Time.offset;
        if (meridiem == "AM" && hours === Time.offset) hours = hours - Time.offset;
        
        return {
            time: `${hours}:${minutes}`,
            isNonLocalGMT: true
        }
      } else if (time === TBDFormat) {
        return {
            time: defaultTimeFormat,
            isNonLocalGMT: false
        }
      }
      return {
        time,
        isNonLocalGMT: false
      };
}

function convertDateTimeToUTC(date: string, time: string): Date {
    const currentYear = (new Date()).getFullYear();

    const cleansedDate = cleanseDate(date); 
    const cleansedTime = convertTo24HourFormat(time);

    const currentMonth = MonthIndex[cleansedDate.slice(0, 3)];
    const currentDate = Number(cleansedDate.split(' ')[1])

    const needToAdd12Hours = cleansedTime.isNonLocalGMT ? true : false;

    const currentHours = needToAdd12Hours ? Number(cleansedTime.time.split(':')[0]) + Time.serverToLocaleDiff : Number(cleansedTime.time.split(':')[0]);
    const currentMinutes = Number(cleansedTime.time.split(':')[1]);

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