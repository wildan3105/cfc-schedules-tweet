/*
- goal(s):
    - call Serp API
    - set the key-value in redis
- period of running: monthly
- cron syntax: 0 0 1 * *
*/

import dotenv = require('dotenv');
import { HTTP } from '../modules/http';

dotenv.config();

const httpController = new HTTP();

async function fetch() {
    const data = await httpController.get();
    return data.data;
}

/**
 * Self executing anonymous function using TS.
 */
 (async ()=> {
    try {
        const data = await fetch();
        console.log(data)
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();