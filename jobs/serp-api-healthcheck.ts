import { injectEnv } from "../libs/inject-env";
import { HTTP } from "../modules/http";

injectEnv();

class SerpAPIHealthCheck {
    private httpController: HTTP;

    constructor() {
        this.httpController = new HTTP();
    }

    private async sendReportingEmail(content: string): Promise<void> {
        await this.httpController.sendEmail(content);
    }

    public async getMatches(): Promise<void> {
        await this.sendReportingEmail(`test only at ${new Date().toLocaleTimeString()}`)
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