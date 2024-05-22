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

    public async sendReportingEmail(matches: SportsResults): Promise<void> {
        // construct email body
        await this.httpController.sendEmail(matches.title);
    }

    public async getMatches(): Promise<SportsResults> {
        const serpAPIResponse = await this.httpController.get();
        return serpAPIResponse.sports_results;
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
        const matches = await healthcheck.getMatches();
        await healthcheck.sendReportingEmail(matches);
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