var uglify = require("uglify-js");
var fs = require("fs");
var path = require("path");

function _minifyLibs(){
  var uglified = uglify.minify([
      "www/lib/angular-local-storage/angular-local-storage.min.js",
      "www/lib/angular-resource/angular-resource.min.js",
      "www/lib/angular-uploader/jquery.ui.widget.js",
      "www/lib/angular-uploader/jquery.iframe-transport.js",
      "www/lib/angular-uploader/jquery.fileupload.js",
      "www/lib/angular-uploader/jquery.fileupload-process.js",
      "www/lib/angular-uploader/jquery.fileupload-image.js",
      "www/lib/angular-uploader/jquery.fileupload-audio.js",
      "www/lib/angular-uploader/jquery.fileupload-video.js",
      "www/lib/angular-uploader/jquery.fileupload-validate.js",
      "www/lib/angular-uploader/jquery.fileupload-angular.js",
      "www/lib/angular-uploader/load-image.js",
      "www/lib/angular-uploader/load-image-ios.js",
      "www/lib/angular-uploader/load-image-orientation.js",
      "www/lib/angular-uploader/load-image-meta.js",
      "www/lib/angular-uploader/load-image-exif.js",
      "www/lib/angular-uploader/load-image-exif-map.js",
      "www/lib/angular-uploader/canvas-to-blob.js",
      "www/lib/angular-uploader/jquery.iframe-transport.js",
      "www/lib/angular-uploader/angular-uploader.js",
      "www/lib/angular-sanitize/angular-sanitize.js",
      "www/lib/extra/angular-gravtaar.js",
      "www/lib/extra/angular-cache.js",
      "www/lib/underscore/underscore-min.js",
      "www/lib/ngmap/build/scripts/ng-map.min.js",
      "www/lib/ngCordova/dist/ng-cordova.min.js",
      "www/lib/moment/min/moment.min.js",
      "www/lib/angular-moment/angular-moment.min.js",
      "www/lib/angular-slugify/dist/angular-slugify.min.js",
      "www/lib/collide/collide.js",
      "www/lib/ionic-contrib-tinder-cards/ionic.tdcards.js",
      "www/lib/ngCordova/dist/ng-cordova.min.js",
      "www/lib/ionic-filter-bar/dist/ionic.filter.bar.js",
      "www/lib/angular-youtube-mb/dist/angular-youtube-embed.min.js"
  ]);
  var minFile=path.join(__dirname,'www/js/mobile-app.min.js');
  fs.writeFile(minFile, uglified.code, function (err){
    if(err) {
      console.log(err);
    } else {
      console.log("Script generated and saved:",minFile);
    }      
  }); 
} 

function _minifyApp(){
  var uglified = uglify.minify([
      "www/js/app.js",
      "www/js/uploader.js",
      "www/js/dataservice.js",
      "www/js/controllers.js",
      "www/js/directives.js",
      "www/js/filters.js",
      "www/js/services.js",
      "www/js/factories.js",
      "www/js/config.js"
  ]);
  var minFile=path.join(__dirname,'www/js/app.min.js');
  fs.writeFile(minFile, uglified.code, function (err){
    if(err) {
      console.log(err);
    } else {
      console.log("Script generated and saved:",minFile);
    }      
  }); 
  //watch directory ? 
}  

module.exports={
  libs:_minifyLibs,
  app:_minifyApp
}

 