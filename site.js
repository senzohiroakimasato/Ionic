var express = require('express');
var bodyParser = require('body-parser');
var proxy = require('./server/vidzapper');
var request=require('request');
var app = express();

var live=process.argv[2]||'live';
var vz= 'https://'+live+'.vzconsole.com';
var clientId=379,languageId=45,countryId=164,custom={ age:'not specified' };
if(vz!='live'){ clientId=5; }

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/register', function(req, res) {
    req.body.clientId = clientId;
    req.body.languageId = languageId;
    req.body.countryId = countryId;
    req.body.custom = JSON.stringify(req.body.custom || { age: 'not specified' });
    request.post({ method: 'post', body: req.body, json: true, url: vz + 'account/register/participant' }, function(err, httpResponse, body) {
        res.json(body);
    });
});
app.use(express.static('www'));
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(process.argv[3] || 8100, function () {
  console.log('Mobile app listening on port 8100!');
});

