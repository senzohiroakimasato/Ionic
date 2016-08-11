var assert = require('assert');
var util = require('util');
var url = require('url');
var fs = require('fs');
var path = require('path');
var is = require('type-is');
var request = require('request');
var apicache  = require('apicache');
var cache     = apicache.middleware;

module.exports = function proxy(options) {

  options = options || {};

  /** 
   * intercept(targetResponse, data, res, req, function(err, json));
   */
  var decorateRequest = options.decorateRequest;
  var forwardPath = options.forwardPath;
  var proccessBody = options.processBody;
  var filter = options.filter;
  
  return function handleProxy(req, res, next) {
    if (filter && !filter(req, res)) return next();
    
    var headers = options.headers || {};

    var skipHdrs = [ 'connection', 'content-length','host'];
    var hds = extend(headers, req.headers, skipHdrs);
    hds.connection = 'close';
    hds['User-Agent']='vidzapper mobile app proxy v1.0';

      var reqOpt = {
        headers: hds,
        method: req.method,
        uri: forwardPath ? forwardPath(req, res) : url.parse(req.url).path
      };

      if(proccessBody){
        req.body=proccessBody(req);
      }

      req.apicacheGroup =  url.parse(reqOpt.uri).hostname;

      if(hds['content-type']=='application/x-www-form-urlencoded'){
          reqOpt.form=req.body;  
      }else{
          reqOpt.json=req.body;
      }
      
      if (decorateRequest)
        reqOpt = decorateRequest(reqOpt) || reqOpt;

      request(reqOpt, function(error,body,rsp) {
          if (error) {
            next(error);return;
          }
          console.log('proxy',body.statusCode,reqOpt.uri);
          res.status(body.statusCode).send(rsp);
      });
  };
};


function extend(obj, source, skips) {
  if (!source) return obj;

  for (var prop in source) {
    if (!skips || skips.indexOf(prop) == -1)
      obj[prop] = source[prop];
  }

  return obj;
}
