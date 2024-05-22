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

    private formatSportsResultsToHtml(matches: SportsResults): string {
        let html = `<h1>${matches.title}</h1>`;
        html += `<p>${matches.rankings}</p>`;
        html += `<img src="${matches.thumbnail}" alt="${matches.title}" />`;

        if (matches.game_spotlight) {
            html += `<h2>Game Spotlight</h2>`;
            html += `<p>League: ${matches.game_spotlight.league}</p>`;
            html += `<p>Stadium: ${matches.game_spotlight.stadium}</p>`;
            if (matches.game_spotlight.stage) {
                html += `<p>Stage: ${matches.game_spotlight.stage}</p>`;
            }
            html += `<p>Date: ${matches.game_spotlight.date}</p>`;

            if (Number(matches.game_spotlight.video_highlight_carousel.length) > 0) {
                html += `<h3>Video Highlights</h3>`;
                matches.game_spotlight.video_highlight_carousel.forEach(video => {
                    html += `<p>${video.title} (${video.duration})</p>`;
                    html += `<a href="${video.link}">Watch</a>`;
                    html += `<img src="${video.thumbnail}" alt="${video.title}" />`;
                });
            }

            if (matches.game_spotlight.teams.length > 0) {
                html += `<h3>Teams</h3>`;
                matches.game_spotlight.teams.forEach(team => {
                    html += `<p>${team.name}</p>`;
                    html += `<img src="${team.thumbnail}" alt="${team.name}" />`;
                });
            }

            html += `<hr />`;
        }

        if (matches.games.length > 0) {
            html += `<h2>Upcoming Games</h2>`;
            matches.games.forEach(game => {
                html += `<h3>${game.tournament}`;
                if (game.stage) {
                    html += ` - ${game.stage}`;
                }
                html += `<p>Stadium: ${game.stadium}</p>`;
                html += `<p>Date: ${game.date}</p>`;
                html += `<p>Time: ${game.time}</p>`;

                if (game.teams.length > 0) {
                    html += `<h4>Teams</h4>`;
                    game.teams.forEach(team => {
                        html += `<p>${team.name}</p>`;
                        html += `<img src="${team.thumbnail}" alt="${team.name}" />`;
                    });
                }
                html += `<hr />`;
            });
        }

        return html;
    }

    public async sendReportingEmail(matches: SportsResults): Promise<void> {
        const emailBody = this.formatSportsResultsToHtml(matches);
        await this.httpController.sendEmail(emailBody);
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