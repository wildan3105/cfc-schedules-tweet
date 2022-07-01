const oauth1a = require('oauth-1.0a');
const legacyCrypto = require('crypto');

export class Oauth1Helper {
    static getAuthHeaderForRequest(request) {
        const oauth = oauth1a({
            consumer: {
                key: process.env.API_KEY,
                secret: process.env.API_SECRET_KEY
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return legacyCrypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64')
            },
        })    
        
        const authorization = oauth.authorize(request, {
            key: process.env.ACCESS_TOKEN,
            secret: process.env.ACCESS_TOKEN_SECRET
        });

        return oauth.toHeader(authorization);
    }
}