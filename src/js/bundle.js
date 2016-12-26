import OAuth from 'oauth';

const express = require('express');

const app = express();

/**
Get the URL from which an end user can authorize iDiet to access his/her data
*/
app.get('/authorizelink', (req, res) => {
    const API_KEY = process.env.API_KEY;
    const API_SECRET = process.env.API_SECRET;

    const oauth = new OAuth.OAuth(
     'https://oauth.withings.com/account/request_token',
     'https://oauth.withings.com/account/access_token',
     API_KEY,
     API_SECRET,
     '1.0',
     'http://localhost:3000/',
     'HMAC-SHA1',
   );

    oauth.getOAuthRequestToken((err, token, tokenSecret, parsedQueryString) => {
        res.send(JSON.stringify({
            token: token,
            tokenSecret: tokenSecret,
            url: oauth.signUrl('https://oauth.withings.com/account/authorize', token, tokenSecret),
        }));
    });
});

app.listen(3000);
