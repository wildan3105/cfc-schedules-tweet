import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";
import { SportsResults } from "../interfaces/serp-api";
import { loggerService } from "../modules/log";

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
            loggerService.error(`Error when validating response from Serp API. Sending email notification...`);
            const errorObject = {
                payload: sportsResults,
                context: 'Error when validating response from Serp API.'
            }
            await this.sendReportingEmail(JSON.stringify(errorObject));
        } else {
            loggerService.info(`Serp API response is valid. Exiting.`)
        }
    }
}

process.on("uncaughtException", e => {
    setTimeout(() => {
        loggerService.error(`an error occured [uncaughtException]: ${e}`);
        process.exit(1);
    }, 3000);
});
  
process.on("unhandledRejection", e => {
    setTimeout(() => {
        loggerService.error(`an error occured [unhandledRejection]: ${e}`);
        process.exit(1);
    }, 3000);
});

(async() => {
    try {
        const healthcheck = new SerpAPIHealthCheck();
        await healthcheck.getMatches();
    } catch (e) {
        loggerService.error(`an error occured when performing serp API healthcheck cron: ${e}`);
        process.exit(1);
    } finally {
        loggerService.info(`SerpAPI Healthcheck cron executed.`)
        setTimeout(() => {
            process.exit(0);
        }, 3000);
    }
})();