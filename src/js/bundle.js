import OAuth from 'oauth';
import express from 'express';

const app = express();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

let _token;
let _secret;

/**
Get the URL from which an end user can authorize iDiet to access his/her data
*/
app.get('/authorizelink', (req, res) => {
    const oauth = new OAuth.OAuth(
        'https://oauth.withings.com/account/request_token',
        'https://oauth.withings.com/account/access_token',
        API_KEY,
        API_SECRET,
        '1.0',
        'http://localhost:3000/callback',
        'HMAC-SHA1',
    );

    oauth.getOAuthRequestToken((err, token, tokenSecret) => {
        _token = token;
        _secret = tokenSecret;
        console.log('1st step:' + JSON.stringify({t: token, s: tokenSecret}));
        res.send(JSON.stringify({
            url: oauth.signUrl('https://oauth.withings.com/account/authorize', token, tokenSecret),
        }));
    });
});

/**
Callback handler for the OAuth redirect. Returns the oauth token which is required for Withins API data queries
*/
app.get('/callback', (req, res) => {
    console.log('starting callback');
    const oauth = new OAuth.OAuth(
        null,
        'https://oauth.withings.com/account/access_token',
        API_KEY,
        API_SECRET,
        '1.0',
        'http://localhost:3000/callback',
        'HMAC-SHA1',
    );

    console.log(JSON.stringify({a: req.query.oauth_token, b: API_SECRET, c: req.query.oauth_verifier}));
    oauth.getOAuthAccessToken(
        _token,
        _secret,
        req.query.oauth_verifier,
        (error, oauth_access_token, oauth_access_token_secret, results) => {
            if (error) {
                res.send(JSON.stringify(error));
            } else {
                res.send(JSON.stringify({
                    user_id: req.query.userid,
                    oauth_access_token: oauth_access_token,
                }));
            }
        });
});

app.listen(3000);
