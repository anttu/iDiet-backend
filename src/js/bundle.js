import OAuth from 'oauth';
import express from 'express';
import axios from 'axios';

const app = express();

const CONSUMER_KEY = process.env.API_KEY;
const CONSUMER_SECRET = process.env.API_SECRET;

const TYPE = {
    weight: 1,
};

const oauth = new OAuth.OAuth(
    'https://oauth.withings.com/account/request_token',
    'https://oauth.withings.com/account/access_token',
    CONSUMER_KEY,
    CONSUMER_SECRET,
    '1.0',
    'http://localhost:3000/callback',
    'HMAC-SHA1',
);

/**
Get user measurements from Withings database. Requires following parameters:
    mtype: measurement type (e.g. weight)
    userid: ID of the user, (e.g. 1232456)
    oauthtoken: oauth token
    oauthsecret: oauth secret
*/
app.get('/measurement', (req, res) => {
    const mtype = TYPE[req.query.mtype];
    if (!mtype) {
        res.send(JSON.stringify({ error: `unsupported measurement type ${req.query.mtype}` }));
        return;
    }
    const api = `http://wbsapi.withings.net/measure?action=getmeas&meastype=${mtype}&userid=${req.query.userid}`;
    const oapi = oauth.signUrl(api, req.query.oauthtoken, req.query.oauthsecret);
    axios.get(oapi)
    .then((response) => {
        try {
            res.send(JSON.stringify(
                response.data.body.measuregrps.map(x => (
                    {
                        date: x.date,
                        weight: x.measures[0].value,
                    }
                ))
            ));
        } catch (error) {
            console.error(`Failed to parse measurement response ${error.message}`);
            console.log(JSON.stringify(response.data));
        }
    })
    .catch((error) => {
        console.log(error);
    });
});

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

React Native webview (bridge) is responsible for parsing the following javascript and communicating it back to
the application.
*/
app.get('/callback', (req, res) => {
    res.send(
        `
        <html><body>
        <script type="text/javascript">
            var verifier = '${req.query.oauth_verifier}';
            var user_id = '${req.query.userid}';
        </script>
        </html></body>
        `
    );
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
