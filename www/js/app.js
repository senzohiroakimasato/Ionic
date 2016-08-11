// Ionic Starter App
/* jshint -W100 */

angular.module('underscore', [])
.factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
});

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', [
  'ionic',
  'angularMoment',
  'app.api',
  'app.controllers',
  'app.directives',
  'app.filters',
  'app.services',
  'app.factories',
  'app.config',
  //'app.views',
  'underscore',
  'ngMap',
  'ngResource',
  'ngSanitize',
  'ngCordova',
  'slugifier',
  'ionic.contrib.ui.tinderCards',
  'youtube-embed',
  'blueimp.fileupload',
  'LocalStorageModule',
  'md5',
  'angular-cache',
  'jett.ionic.filter.bar'
])

.run(['$ionicPlatform', 'PushNotificationsService', '$rootScope', '$ionicConfig', '$timeout', 'Api',function ($ionicPlatform, PushNotificationsService, $rootScope, $ionicConfig, $timeout, Api) {

    //if the user is logged in;
    Api.isLoggedIn(function (result) {
        $rootScope.me = result;
    });

    $ionicPlatform.on("deviceready", function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        PushNotificationsService.register();

    });

    // This fixes transitions for transparent background views
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf('auth.login') > -1) {
            // set transitions to android to avoid weird visual effect in the walkthrough transitions
            $timeout(function () {
                $ionicConfig.views.transition('android');
                $ionicConfig.views.swipeBackEnabled(false);
            }, 0);
        }
    });
    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        if (toState.name.indexOf(home) > -1) {
            // Restore platform default transition. We are just hardcoding android transitions to auth views.
            $ionicConfig.views.transition('platform');
            // If it's ios, then enable swipe back again
            if (ionic.Platform.isIOS()) {
                $ionicConfig.views.swipeBackEnabled(true);
            }
        }
    });

    $ionicPlatform.on("resume", function () {
        PushNotificationsService.register();
    });

}])


.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider','fileUploadProvider',function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider,fileUploadProvider) {
    
    angular.extend(fileUploadProvider.defaults, {
        previewMaxWidth: 320,
        previewMaxHeight: 180,
        previewMinWidth: 320,
        disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
        maxFileSize: Math.pow(1024, 3) * 200, // 500MB
        maxChunkSize: Math.pow(1024, 2) * 2,
        acceptFileTypes: /(^Video\/(x-ms-wmv|mp4|avi|x-flv)+$)|(\.|\/)(264|787|3gp2|3gpp|3p2|aaf|aep|aetx|ajp|amv|amx|arf|avb|axm|bdmv|bin|bmk|camrec|clpi|cmmp|cmmtpl|cmproj|cmrec|cst|cvc|d2v|d3v|dat|dce|dck|dir|dmb|dmsd|dmsd3d|dmss|dpa|dpg|dv|dv-avi|dvr|dvx|dxr|dzt|evo|eye|f4p|fbz|fcp|flc|flh|fli|gfp|gts|hkm|ifo|imovieproject|ismc|ivf|ivr|izz|izzy|jts|jtv|m1pg|m21|m21|m2t|m2ts|m2v|mgv|mj2|mjp|mnv|mp21|mp21|mpgindex|mpl|mpls|mpv|mqv|msdvd|mswmm|mtv|mvb|mvd|mve|mvp|mvp|mvy|ncor|nsv|nuv|nvc|ogm|ogx|pgi|photoshow|piv|pmf|ppj|prel|pro|prtl|pxv|qtl|qtz|rdb|rec|rmd|rmp|rms|roq|rsx|rum|rv|sbk|scc|screenflow|seq|sfvidcap|smi|smk|ssm|stl|svi|swt|tda3mt|tivo|tod|tp|tp0|tpd|tpr|tsp|tvs|vc1|vcpf|vcv|vdo|vdr|vep|vfz|vgz|viewlet|vlab|vp6|vp7|vpj|vsp|wcp|wmd|wmmp|wmx|wp3|wpl|wvx|xej|xel|xesc|xfl|xlmv|zm1|zm2|zm3|zmv|aepx|ale|avp|avs|bdm|bik|bsf|camproj|cpi|divx|dmsm|dream|dvdmedia|dvr-ms|dzm|dzp|edl|f4v|fbr|fcproject|hdmov|imovieproj|ism|ismv|m2p|m4v|mkv|mod|moi|mpeg|mts|mxf|ogv|pds|prproj|psh|r3d|rcproject|rmvb|scm|smil|sqz|srt|stx|swi|tix|trp|ts|veg|vf|vro|webm|wlmp|wtv|xvid|yuv|anim|bix|dsy|gl|grasp|gvi|ivs|lsf|m15|m4e|m75|mmv|mob|mpeg4|mpf|mpg2|mpv2|msh|rmd|rts|scm|sec|tdx|viv|vivo|vp3|3gpp2|3mm|60d|aet|avd|avs|bnp|box|bs4|byu|dav|ddat|dif|dlx|dmsm3d|dnc|dv4|fbr|flx|gvp|h264|irf|iva|k3g|lrec|lsx|m1v|m2a|m4u|meta|mjpg|modd|moff|moov|movie|mp2v|mp4v|mpe|mpsub|mvc|mys|osp|par|playlist|pns|pssd|pva|pvr|qt|qtch|qtm|rp|rts|sbt|scn|sfd|sml|smv|spl|str|vcr|vem|vft|vfw|vid|video|vs4|vse|w32|wm|wot|3g2|3gp|asf|asx|avi|flv|mov|mp4|mpg|rm|swf|vob|wmv|gif|svg|jpe?g|png|tif|bmp|xls|xlsx|ppt|pptx|txt|rtf|pdf|doc|docx|html|htm|mp3|mp4|wav|3gp|aac|m4a|m4p|ogg|wma|vox)$/i,
        maxNumberOfFiles: 20,
        maxRetries: 100,
        retryTimeout: 500
    });
    
    
    $stateProvider

    //INTRO
    .state('auth', {
        url: "/auth",
        templateUrl: "views/auth/auth.html",
        abstract: true,
        controller: 'AuthCtrl'
    })
    .state('auth.login', {
        url: '/login',
        controller: 'LoginCtrl',
        templateUrl: "views/auth/login.html"
    })
    .state('auth.logout', {
        url: '/logout',
        controller: 'SignoutCtrl',
        templateUrl: "views/auth/login.html"
    })
    .state('auth.signup', {
        url: '/signup',
        templateUrl: "views/auth/signup.html",
        controller: 'SignupCtrl'
    })

    .state('auth.forgot-password', {
        url: "/forgot-password",
        templateUrl: "views/auth/forgot-password.html",
        controller: 'ForgotPasswordCtrl'
    })

    .state('auth.reset-password', {
        url: "/reset-password?email",
        templateUrl: "views/auth/reset-password.html",
        controller: 'ResetPasswordCtrl'
    })

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "views/app/side-menu.html"
    })
    .state('app.password', {
        url: '/change-password',
        controller: 'ChangePasswordCtrl',
        views: {
            'menuContent': {
                templateUrl: "views/auth/password.html"
            }
        }
    })
    //FEEDS
    .state('app.home', {
        url: "/home",
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: "views/app/home.html"
            }
        }
    })
     .state('app.home.upload', {
         url: '/upload',
         views: {
             'upload-tab': {
                 templateUrl: "views/app/home/upload.html",
                 controller: 'UploadCtrl',
             }
         }
     })
    .state('app.home.playlist', {
        url: '/playlist',
        abstract:true,
        views: {
            'watch-tab': {
                templateUrl: "views/app/home/playlist.html"
            }
        }
    })
    .state('app.home.playlist.categories', {
        url: '/categories',
        views: {
            'categories-tab': {
                templateUrl: "views/app/home/playlist.categories.html",
                controller: 'PlaylistCtrl',
            }
        }
    })
    .state('app.home.playlist.featured', {
        url: '/featured',
        data:{ custom:'featured' },
        views: {
            'featured-tab': {
                templateUrl: "views/app/home/playlist.items.html",
                controller: 'PlaylistItemsCtrl'
            }
        }
    })
    .state('app.home.playlist.trending', {
        url: '/trending',
        data:{ custom:'trending' },
        views: {
            'trending-tab': {
                templateUrl: "views/app/home/playlist.items.html",
                controller: 'PlaylistItemsCtrl'
            }
        }
    })
    .state('app.home.playlist.my', {
        url: '/my',
        data:{ custom:'my' },
        views: {
            'my-tab': {
                templateUrl: "views/app/home/playlist.items.html",
                controller: 'PlaylistItemsCtrl'
            }
        }
    })
    .state('app.home.playlist.items', {
        url: '/items/:id',
        views: {
            'categories-tab': {
                templateUrl: "views/app/home/playlist.items.html",
                controller: 'PlaylistItemsCtrl'
            }
        }
    })
    .state('app.home.upcoming', {
        url: '/upcoming',
        views: {
            'upload-tab': {
                templateUrl: "views/app/home/upcoming-event.html",
                controller: 'UpcomingCtrl',
            }
        }
    })
    .state('app.home.saving', {
        url: '/saving',
        views: {
            'saving-tab': {
                templateUrl: "views/app/home/saving.html",
                controller: 'BasicCtrl',
                data:{
                    title:"Savings"
                }
            }
        }
    })
    .state('app.shop', {
        url: '/shop',
        views: {
            'menuContent': {
                templateUrl: "views/ext/shop.html",
                controller: 'BasicCtrl'
            }
        }
    })
    .state('app.events', {
        url: '/events',
        views: {
            'menuContent': {
                templateUrl: "views/ext/events.html",
                controller: 'BasicCtrl'
            }
        }
    })
    .state('app.about', {
        url: '/about',
        views: {
            'menuContent': {
                templateUrl: "views/ext/about.html",
                controller: 'BasicCtrl'
            }
        }
    })
    .state('auth.terms', {
        url: '/terms',
        controller: 'BasicCtrl',
        templateUrl: "views/auth/terms.html"
    })
    .state('app.home.playlist.watch', {
        url: '/watch/:id',
        views: {
            'categories-tab': {
                templateUrl: "views/app/home/watch.html",
                controller: 'WatchCtrl'
            }
        }
    }).state('app.home.send', {
        url: '/send',
        views: {
            'send-tab': {
                templateUrl: "views/app/home/send.html",
                controller: 'SendCtrl'
            }
        }
    })

    //OTHERS
    .state('app.settings', {
        url: "/settings",
        views: {
            'menuContent': {
                templateUrl: "views/app/settings.html",
                controller: 'SettingsCtrl'
            }
        }
    })

    .state('app.profileEdit', {
        url: "/profile/edit",
        views: {
            'menuContent': {
                templateUrl: "views/app/profile.edit.html",
                controller: 'EditProfileCtrl'
            }
        }
    })

        .state('search', {
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: "views/app/home/search.html",
                    controller: 'SearchCtrl'
                }
            }
        })

    .state('app.profile', {
        url: "/profile",
        views: {
            'menuContent': {
                templateUrl: "views/app/profile.html"
            }
        }
    })

    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/auth/login');

}]);
