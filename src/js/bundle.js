var express = require('express');
var app = express();

var API_HOST = 'https://oauth.withings.com';


app.get('/', function(req, res) {
    var API_KEY = process.env.API_KEY;
    var API_SECRET = process.env.API_SECRET;

    res.send(JSON.stringify([API_KEY, API_SECRET]));
});

app.listen(3000);
