import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { SportsResults } from "../interfaces/serp-api";

injectEnv();

class SerpAPIHealthCheck {
    private httpController: HTTP;

    constructor() {
        this.httpController = new HTTP();
    }

    private async sendReportingEmail(content: string): Promise<void> {
        await this.httpController.sendEmail(content);
    }

    private checkIfSerpAPIResponseValid(data: Record<string, object>): boolean {
        if(!data) return false;
        if(!this.isValidSportsResults(data)) return false;
        return true;
    }

    private isValidSportsResults(obj: any): obj is SportsResults {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'title' in obj &&
            'rankings' in obj &&
            'thumbnail' in obj &&
            'games' in obj &&
            Array.isArray(obj.games)
        );
    }

    public async getMatches(): Promise<void> {
        const serpAPIResponse = await this.httpController.get();
        const sportsResults = serpAPIResponse.sports_results;
        const isValid = this.checkIfSerpAPIResponseValid(sportsResults);
        if(!isValid) {
            console.log(`Error when validating response from Serp API. Sending email notification...`);
            const errorObject = {
                payload: sportsResults,
                context: 'Error when validating response from Serp API.'
            }
            await this.sendReportingEmail(JSON.stringify(errorObject));
        } else {
            console.log(`Serp API response is valid. Exiting.`)
        }
    }
}

process.on("uncaughtException", e => {
    setTimeout(() => {
        console.log(`an error occured [uncaughtException]`, e);
        process.exit(1);
    }, 3000);
});
  
process.on("unhandledRejection", e => {
    setTimeout(() => {
        console.log(`an error occured [unhandledRejection]`, e);
        process.exit(1);
    }, 3000);
});

(async() => {
    try {
        const healthcheck = new SerpAPIHealthCheck();
        await healthcheck.getMatches();
    } catch (e) {
        console.log(`an error occured when performing serp API healthcheck cron`, e);
        process.exit(1);
    } finally {
        console.log(`SerpAPI Healthcheck cron executed.`)
        setTimeout(() => {
            process.exit(0);
        }, 3000);
    }
})();