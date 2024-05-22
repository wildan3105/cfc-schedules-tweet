import { Server } from 'http';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { RequestHandler } from 'express';

export interface MockSerpAPIServer {
    server: Server;
    assertRequests: (assertFn: (request: any[]) => boolean) => void;
    clearRequests: () => void;
}

export const startMockSerpAPIServer = (): Promise<MockSerpAPIServer> => {
    const app = express();
    app.disable('x-powered-by');
    app.use(bodyParser.json({ limit: '5mb', type: 'application/json' }) as RequestHandler);
    app.use(bodyParser.urlencoded({ extended: true }) as RequestHandler);

    const requests: any[] = [];

    app.get(`/search`, (req, res) => {

        const { api_key, q, location } = req.query;

        if (!api_key) {
            res.status(401).json({
                error: "Invalid API key. Your API key should be here: https://serpapi.com/manage-api-key"
            })
        }

        if (!q || !location) {
            res.status(400).json({
                error: "Missing query `q` parameter."
            })
        }

        requests.push(req.query); // Collect requests for assertion

        const response = {
            search_metadata: {},
            search_parameters: {},
            search_information: {},
            sports_results: {
                title: "Chelsea FC",
                rankings: "xth in Premier League",
                thumbnail: "https://serpapi.com/searches/664c6debd5a531e26c40de85/images/5c2e766222da2daf89a3f8923a77c1b481e15eaedf850cab6c2d44ed889d174f.png",
                games: [
                    {
                        tournament: "FA Cup",
                        stage: "Final",
                        stadium: "Wembley",
                        date: "May 23",
                        time: "2:00 AM",
                        teams: [
                            {
                                name: "Chelsea",
                                thumbnail: ""
                            },
                            {
                                name: "Manchester City",
                                thumbnail: ""
                            }
                        ]
                    },
                    {
                        tournament: "Champions League",
                        stage: "Final",
                        stadium: "Wembley",
                        date: "May 31",
                        time: "4:00 AM",
                        teams: [
                            {
                                name: "Chelsea",
                                thumbnail: ""
                            },
                            {
                                name: "Bayern Munich",
                                thumbnail: ""
                            }
                        ]
                    },
                ]
            },
        };

        return res.status(200).send(response);
    })

    const assertRequests = (assertFn: (requests: any[]) => boolean) => {
        expect(assertFn(requests)).toEqual(true);
    };
    const clearRequests = () => {
        requests.splice(0, requests.length);
    }

    const server = app.listen(8888);
    return new Promise((resolve) => {
        server.on('listening', () => {
            resolve({ server, assertRequests, clearRequests });
        });
    });
}