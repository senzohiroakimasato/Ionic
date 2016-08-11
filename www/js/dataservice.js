// VidZapper Api Service
angular.module('app.api', [])
.factory('config', ['$http', '$rootScope', function ($http, $rootScope) {
    return $http.get('/settings', { cache: true }).then(function (response) {
        $rootScope.config = response.data;
        return response.data;
    });
}])

.service('Api',['$http', '$q', 'CacheFactory', 'config','$state', function ($http, $q, CacheFactory, config,$state) {
    var tokenName = "token";
    var cache = CacheFactory('vzmc', {
        maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes.
        cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour.
        deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
        storageMode: 'localStorage' // This cache will use `localStorage`.
    });
    var session = CacheFactory('vzms', {storageMode: 'localStorage'});
    
    var apiRoot = '/api/';
    var hack=cache.get('hack')|| new Date().getTime();
    var searched=cache.get('searched')|| [];
    
    function handleError(deferred,runUrl){
       return function(e,status){
            if (e && e.ExceptionMessage && e.ExceptionMessage.indexOf('A second operation started on this context before a previous asynchronous operation completed') > -1 && runUrl) {
                setTimeout(runUrl, 200);
            }else if(!e || e.code=='ENOTFOUND'){
                deferred.reject('Unable to connect to server');
                console.error('Unable to connect to server');
            } else if (status == 404) {
                deferred.resolve();
            } else {
                console.error('ERR01!', status);
                deferred.reject(e, status);
            }
       } 
    }
    

    function makeClient(clean) {
        if (clean) {
            $http.defaults.headers.common = {};
            $http.defaults.headers.post = {};
            $http.defaults.headers.put = {};
            $http.defaults.headers.patch = {};
        }
        
        var token = headerToken();
        $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
        $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        
        if (token && token.access_token) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + token.access_token;
        }
        return $http;
    }

    function get(url, page, pageSize, counts, orderBy, filter) {
        if (typeof (page) == 'object') {
            pageSize = page.size;
            counts = page.counts;
            orderBy = page.order;
            filter = page.filter;
            page = page.page;
        }
        var deferred = $q.defer();
        pageSize = pageSize || -1;
        page = page || 1;
        
        var args='';

        if (pageSize != -1) {
            args += "&$top=" + pageSize;
            if (page > 1) {
                args += "&$skip=" + (pageSize * (page - 1));
            }
            if (counts) {
                args += "&$inlinecount=allpages";
            }
        }
        if (orderBy) {
            args += "&$orderby=" + orderBy;
        }
        if (filter) {
            args += "&$filter=" + filter;
        }
        
        if(args!=''){
            url+=(url.indexOf('?') == -1 ? "?" :"")+args;
        }

        function runUrl() {
            var data = cache.get(url);
            if (data) {
                deferred.resolve(data);
                return;
            }
            makeClient().get(url).success(function (d) {
                if (typeof (d) === 'string' && d.indexOf('<title>Log in : VidZapper</title>') !== -1) {
                    $state.go('auth.login');
                    console.log('Unauthenticated');
                }
                if (d === 'Unauthorized') {
                    console.error('Access Denied', url);
                    deferred.resolve();
                } else {
                    cache.put(url.replace('&nocache=true',''), d);
                    deferred.resolve(d);
                }
            }).error(handleError(deferred,runUrl));
        }

        runUrl();

        return deferred.promise;
    }

    function post(url, data, clean) {
        var deferred = $q.defer();
        makeClient(clean).post(url, data).success(function (d) {
            if (d === 'Unauthorized') {
                console.error('Access Denied', url);
                deferred.reject('Unauthorized');
            } else {
                deferred.resolve(d);
            }
        }).error(handleError(deferred));
        return deferred.promise;
    }
    function put(url, data, clean) {
        var deferred = $q.defer();
        makeClient(clean).put(url, data).success(function (d) {
            if (d === 'Unauthorized') {
                console.error('Access Denied', url);
                deferred.reject('Unauthorized');
            } else {
                deferred.resolve(d);
            }
        }).error(handleError(deferred));
        return deferred.promise;
    }

    function headerToken(val) {
        if(val) session.put(tokenName, val,{maxAge:val.expires_in*1000});
        return session.get(tokenName);
    }

    function postForm(uri, model) {
        $http.defaults.headers.common = {};
        $http.defaults.headers.post = {};
        $http.defaults.headers.put = {};
        $http.defaults.headers.patch = {};
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: uri,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: model
        }).success(function (data, status, headers, cfg) {
            if (data.error) {
                deferred.reject(data.Message || data.error_description);
                return;
            } else {
                deferred.resolve(data);
            }
        }).error(handleError(deferred));
        return deferred.promise;
    }


    var obj = {
        config: function () {
            if (config.$$state.value) {
                return config.$$state.value;
            }
            return {};
        },
        token:headerToken,
        searchHistory:searched,
        search:function(keyword){
           searched.splice(0, 0,{word:keyword,when:new Date()});
           cache.put("searched", searched);
        },
        login: function (email, password, grant_type) {
            var deferred = $q.defer();
            var that = this;
            that.logout();
            postForm(apiRoot + 'token', { username: email, password: password, grant_type: grant_type || 'password' }).then(function (data) {
                headerToken(data); //store access Token.
                hack=new Date().getTime();
                cache.put('hack',hack);
                that.me().then(deferred.resolve,deferred.reject);
            },deferred.reject);
            return deferred.promise;
        },
        externalLogin: function (provider, token, grant_type) {
            var deferred = $q.defer();
            var that = this;
            postForm(apiRoot + 'token', { provider: provider, token: token, grant_type: grant_type || 'external_access_token' }).then(function (data) {
                hack=new Date().getTime();
                cache.put('hack',hack);
                headerToken(data); //store access Token.
                that.me().then(deferred.resolve,deferred.reject);                                  
            },deferred.reject);
            return deferred.promise;
        },
        getProfile: function () {
            return get(apiRoot + 'account/me/profile?_='+hack);
        },
        app: function () {
            return get(apiRoot + 'app');
        },
        updateMeta:function(meta){
           return post(apiRoot + 'account/ugc/meta', meta); 
        },
        updateProfile: function (profile) {
           var deferred = $q.defer();
           return post(apiRoot + 'account/me/profile', profile).then(function (result) {
                cache.put(apiRoot + 'account/me/profile?_='+hack,result);
                deferred.resolve(result);
            },deferred.reject);;
           return deferred.promise;
        },
        register: function (email, password) {
            return post(apiRoot + 'account/register/mobile', { email: email, password: password }, true);
        },
        logout: function () {
            $http.defaults.headers.common = {};
            $http.defaults.headers.post = {};
            $http.defaults.headers.put = {};
            $http.defaults.headers.patch = {};
            session.removeAll();
            cache.removeAll();
        },
        playlists: function () {
            return get(apiRoot + 'playlist/all/' + this.config().playlists.join(','));
        },
        likeVideo: function (programmeId) {
            return put(apiRoot + 'social/like/' + programmeId, {});
        },
        unlikeVideo: function (programmeId) {
            return put(apiRoot + 'social/unlike/' + programmeId, {});
        },
        watchLater: function (programmeId) {
            return post(apiRoot + 'account/ugc/playlist', {ProgrammeId:programmeId,Playlist:"Watch Later",IsPublic:false});
        },
        removeWatchLater: function (programmeId) {
            return put(apiRoot + 'account/ugc/playlist/remove', {ProgrammeId:programmeId,Playlist:"Watch Later"});
        },
        starVideo: function (programmeId,stars) {
            return put(apiRoot + 'social/star/' + programmeId, { stars: stars });
        },
        videosByPlaylist: function (id, pg) {
            return get(apiRoot + 'watch/pl/rox/' + id+"?page="+pg);
        },
        videosByCustom: function (id, pg) {
            return get(apiRoot + 'watch/cy/rox/' + id+"?page="+pg);
        },
        socialsByVideos: function (ids) {
            return put(apiRoot + 'social/me',{id:ids});
        },
        videoById: function (id) {
            return get(apiRoot + 'watch/ep/rox/' + id);
        },
        commentsByVideoId: function (id) {
            return get(apiRoot + 'account/comment/on/programme/' + id+'?$orderby=ID desc&$inlinecount=allpages');
        },
        changeUsername:function(username){
            return post(apiRoot + 'account/me/username', {username:username});
        },
        postFacebook:function(video,url){
            return post(apiRoot + 'account/facebook', {
                title:video.title,
                description:video.description,
                picture:video.image,
                link:url
            });
        },
        postTwitter:function(video,url){
            return post(apiRoot + 'account/twitter', {
                title: video.title,
                url:url
            });
        },
        postGoogle:function(video,url){
            return post(apiRoot + 'account/google', {
                title:video.title,
                description:video.description,
                picture:video.image,
                link:url
            });
        },
        commentOnVideo: function (comment) {
            return post(apiRoot + 'account/comment/on/programme',comment).then(function(result){
                cache.remove(apiRoot + 'account/comment/on/programme/' + comment.programmeId);
                return get(apiRoot + 'account/comment/on/programme/' + comment.programmeId+'?$orderby=ID desc&nocache=true&$inlinecount=allpages');
            });
        },
        forgot:function(email,branding){
           return post(apiRoot+'account/forgot',{username:email,branding:branding});
        },
        resetPassword:function(model){
           return post(apiRoot+'account/reset',model);
        },
        isLoggedIn: function (cb) {
            if (headerToken()) {
                this.me().then(cb);
            } else {
                cb();
            }
        },
        me: function (hk) {
            var deferred = $q.defer();
            var that = this;
            if(hk){
                hack=new Date().getTime();
                cache.put('hack',hack);
            }
            get(apiRoot + 'util/me?_='+hack).then(function (result) {
                if (!result || typeof (result) === 'string') {
                    deferred.reject('Unable to login');
                } else {
                    result.home = home;
                    that.app().then(function (data) {
                        result.encoder = data.App.Encoder;
                        deferred.resolve(result);
                    });
                }
            }, function (err) {
                deferred.reject(err && err.Message || err);
            });
            return deferred.promise;
        }
    };
    return obj;
}]);
