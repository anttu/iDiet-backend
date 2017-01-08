import OAuth from 'oauth';
import express from 'express';

const app = express();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const oauth = new OAuth.OAuth(
    'https://oauth.withings.com/account/request_token',
    'https://oauth.withings.com/account/access_token',
    API_KEY,
    API_SECRET,
    '1.0',
    'http://localhost:3000/callback',
    'HMAC-SHA1',
);

/**
Get the URL from which an end user can authorize iDiet to access his/her data
*/
app.get('/authorizelink', (req, res) => {
    oauth.getOAuthRequestToken((err, token, tokenSecret) => {
        res.type('json');
        res.send(JSON.stringify({
            token: token,
            token_secret: tokenSecret,
            url: oauth.signUrl('https://oauth.withings.com/account/authorize', token, tokenSecret),
        }));
    });
});

/**
Callback handler for the OAuth redirect. User will return here when iDiet has been authorized.
*/
app.get('/callback', (req, res) => {
    res.type('json');
    res.send(JSON.stringify({
        user_id: req.query.userid,
        verifier: req.query.oauth_verifier,
    }));
});

/*
Generate oauth access token.
*/
app.get('/accesstoken', (req, res) => {
    res.type('json');
    oauth.getOAuthAccessToken(
        req.query.token,
        req.query.tokensecret,
        req.query.oauthverifier,
        (error, oauth_access_token, oauth_access_token_secret, results) => {
            if (error) {
                res.send(JSON.stringify(error));
            } else {
                res.send(JSON.stringify({
                    user_id: req.query.userid,
                    oauth_access_token: oauth_access_token,
                    oauth_access_token_secret: oauth_access_token_secret,
                    results: results,
                }));
            }
        });
});

app.listen(3000);
