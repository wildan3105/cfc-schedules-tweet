// period of running: monthly (1st each month)
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
        const data: unknown = await fetch();
        console.log(data)
    } catch(e) {
        console.log(`error is`, e)
        process.exit(1);
    }
})();