import axios from "axios";
import { Oauth1Helper } from './oauth';

export class Tweet {
    baseURL: string;
    constructor() {
        this.baseURL = process.env.BASE_URL;
    }
      
    async sendTweet(text: string) {
        const request = {
            url: this.baseURL + '/2/tweets',
            method: 'POST',
            body: {
                text
            }
        };
        

        const authHeader = Oauth1Helper.getAuthHeaderForRequest(request);
        try {
            const response = await axios.post(
            request.url,
            request.body,
            { headers: authHeader });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }
}