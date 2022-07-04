import oauth1a = require('oauth-1.0a');
import legacyCrypto = require('crypto');

import { Content } from '../interfaces/tweet';

export class Oauth1Helper {
    static getAuthHeaderForRequest(request: { url: string; method: string; body: Content; }) {
        const oauth = new oauth1a({
            consumer: {
                key: process.env.API_KEY,
                secret: process.env.API_SECRET_KEY
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string: legacyCrypto.BinaryLike, key: legacyCrypto.BinaryLike | legacyCrypto.KeyObject) {
                return legacyCrypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            },
        })    
        
        const authorization = oauth.authorize(request, {
            key: process.env.ACCESS_TOKEN,
            secret: process.env.ACCESS_TOKEN_SECRET
        });

        return oauth.toHeader(authorization);
    }
}