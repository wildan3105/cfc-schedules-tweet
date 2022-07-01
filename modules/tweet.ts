import axios, { AxiosRequestHeaders } from "axios";
import { Oauth1Helper } from './oauth';
import { Content } from '../interfaces/tweet';

export class Tweet {
    baseURL: string;
    constructor() {
        this.baseURL = process.env.BASE_URL;
    }
      
    async sendTweet(content: Content) {
        const request = {
            url: this.baseURL + '/2/tweets',
            method: 'POST',
            body: content
        };

        const authHeader = Oauth1Helper.getAuthHeaderForRequest(request) as unknown as AxiosRequestHeaders;
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