/*
- goal(s):
    - get the 1st key-value in redis
    - call publisher
- period of running: hourly
- cron syntax: 0 * * * *
*/
import dotenv = require('dotenv');

dotenv.config();

async function fetch() {
    return 'ok'
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