import { MultipleFixtures } from '../interfaces/serp-api';
import { Tournament } from '../constants/tournament';

export async function serpApiToRedis(fixtures: MultipleFixtures) {
    fixtures.forEach(elem => {
        elem.participants = `${elem.teams[0].name} vs ${elem.teams[1].name}`
        elem.tournament = elem.tournament || Tournament.OTHER
    });

    return fixtures;
}

export async function RedisToTweet() {
    return 'ok'
}