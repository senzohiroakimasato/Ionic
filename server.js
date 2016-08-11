var express = require('express');
var bodyParser = require('body-parser');
var proxy = require('./server/vidzapper');
var request = require('request');
var http = require('http');
var https = require('https');
var fs=require('fs');
var path=require('path');
var URL=require('url');
var querystring=require('querystring');
var compression = require('compression');
var apicache  = require('apicache');
var cache     = apicache.middleware;

var ssl = {
    key: fs.readFileSync('./ssl/vz.pem','utf-8'),
    cert: fs.readFileSync('./ssl/vz.pem','utf-8'),
};

var app = express();
var port = process.argv[2] || 80;
var sslPort = process.argv[3] || 443;

function findAppName(req){
    var k=URL.parse('http://'+req.headers.host);
    if(k.hostname=='localhost') return 'lat-mobile.vzconsole.com';
    return k.hostname; 
}

function apiBaseUri(req){
    var appName = findAppName(req);
    var info = require('./keys')[appName];
    return info.serviceBase;
}

function findConfig(req){
    var appName = findAppName(req);
    var info = require('./keys')[appName];
    return info;
}

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  // fallback to standard filter function
  return compression.filter(req, res);
}

app.use(compression({filter: shouldCompress}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api',cache('20 minute',function(req,res){
    return req.method=='GET'  && !req.query.nocache;
}),proxy({
    processBody: function (req) {
        var appName = findAppName(req);
        var info = require('./keys')[appName];
        if (req.url === '/token'){
            req.body.clientId = info.id;
        } 
        if(req.url.indexOf('/account/register') === 0) {
            req.body.clientId = info.id;
            req.body.languageId = req.body.languageId || info.languageId;
            req.body.countryId = req.body.countryId || info.countryId;
        }
        return req.body;
    },
    forwardPath: function (req, res) {
        var vz=apiBaseUri(req);
        if (req.url === '/token' || req.url.indexOf('/account/register') === 0) {
            return vz + req.url;
        }
        //res.setHeader('Cache-Control', 'public, max-age=600');
        if (req.url.indexOf('/watch') === 0) {
            return vz + req.url;
        }
        return vz + 'api/v2/my' + req.url;
    }
}));

app.use(function (err, req, res,next) {
    console.error(err.stack);
    res.status(500).send(err);
});

app.get('/setup',function(req,res){
   var minifier=require('./minifier');//runs minifier task;
   minifier.app();
   minifier.libs();
   res.json(1); 
});
app.get('/rich/:mode/:id',function(req,res){
   var appName = findAppName(req);
   var info = require('./keys')[appName];
   if(req.params.mode=='video'){
       res.redirect(info.serviceBase+'watch?v=8&epkey='+req.params.id+'&'+querystring.stringify(URL.parse(req.url, true).query));
   }else{
       res.send(req.params); 
   }
});

app.get('/settings', function (req, res) {
    delete require.cache[require.resolve('./keys')]
    res.json(findConfig(req));
});

app.post('/register', function (req, res) {
    var appName = findAppName(req);
    var info = require('./keys')[appName];
    req.body.clientId = info.id;
    req.body.languageId = info.languageId;
    req.body.countryId = info.countryId;
    req.body.custom = JSON.stringify(req.body.custom || { age: 'not specified' });
    request.post({ method: 'post', body: req.body, json: true, url: info.serviceBase + 'account/register/participant' }, function (err, httpResponse, body) {
        res.json(body);
    });
});

var oneDay = 86400000;
app.use(express.static('www', { maxAge: oneDay }));

http.createServer(app).listen(port);
https.createServer(ssl, app).listen(sslPort);

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});
