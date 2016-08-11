function calculatePaging(page, pageSize) {
    pageSize = pageSize || factory.pageSize;
    var pg = "&$top=" + pageSize;
    if (page > 1) {
        pg += "&$skip=" + ((page - 1) * pageSize);
    }
    return pg;
}

function orderBy(order) {
    return '&$orderby=' + order;
}

var _formatBitrate = function (bits) {
    if (typeof bits !== 'number') {
        return '';
    }
    if (bits >= 1000000000) {
        return (bits / 1000000000).toFixed(2) + ' Gbit/s';
    }
    if (bits >= 1000000) {
        return (bits / 1000000).toFixed(2) + ' Mbit/s';
    }
    if (bits >= 1000) {
        return (bits / 1000).toFixed(2) + ' kbit/s';
    }
    return bits.toFixed(2) + ' bit/s';
};

var _formatTime = function (seconds) {
    var date = new Date(seconds * 1000),
        days = Math.floor(seconds / 86400);
    days = days ? days + 'd ' : '';
    return days +
    ('0' + date.getUTCHours()).slice(-2) + ':' +
    ('0' + date.getUTCMinutes()).slice(-2) + ':' +
    ('0' + date.getUTCSeconds()).slice(-2);
};

var _formatPercentage = function (floatValue) {
    return (floatValue * 100).toFixed(2) + ' %';
};

function _formatFileSize(bytes) {
    var exp = bytes === 0 ? 0 : Math.round(Math.log(bytes) / Math.log(1024) || 0);
    var result = (bytes / Math.pow(1024, exp)).toFixed(2);
    return result + ' ' + (exp === 0 ? 'bytes' : 'KMGTPEZY'[exp - 1] + 'B');
}


function _inKB(bytes) {
    return bytes / 1024;
}

function _inMB(bytes) {
    return _inKB(bytes) / 1024;
}

function _inGB(bytes) {
    return _inMB(bytes) / 1024;
}

function findCurrentIP() {
    var tmp = window.location.hash.split('#');
    return tmp[tmp.length - 1].split('?')[0].split('/')[0];
}

function getIP(ips) {
    if (!!ips) {
        var o = {};
        for (var i = 0; i < ips.length; i++) {
            var x = {
                name: ips[i].Name,
                plural: ips[i].Plural,
                id: ips[i].ID,
                icon: ips[i].Icon
            };
            o[makeWebSafe(x.name)] = x;
            o[makeWebSafe(x.plural)] = x;
        }
        this.IP = o;
    }
    return this.IP[findCurrentIP()];
}
function getAllIP() {
    return this.allIP;
}

function getAllIntellectNav() {
    return this.allIntellectNavs;
}

function setAllIP(ips) {
    this.allIP = ips;
    this.allIntellectNavs = JSON.parse(JSON.stringify(ips));
    this.allIntellectNavs.push({ Mode: 'a', Name: "Video", Plural: "Videos", Icon: "film" });
    this.allIntellectNavs.push({ Mode: 'a', Name: "Audio", Plural: "Audios", Icon: "music" });
    this.allIntellectNavs.push({ Mode: 'a', Name: "Image", Plural: "Images", Icon: "picture-o" });
    this.allIntellectNavs.push({ Mode: 'a', Name: "Document", Plural: "Documents", Icon: "file-o" });
    this.allIntellectNavs.unshift({ Mode: 'c', Name: "Company", Plural: "Companies", Icon: "building" });
}
function makeWebSafe(val) {
    if (val == null) return "";
    return val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function isEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var funcs = {
    pageSize: 10,
    calculatePaging: calculatePaging,
    orderBy: orderBy,
    ip: getIP,
    setAllIP: setAllIP,
    getAllIP: getAllIP,
    getAllIntellectNav: getAllIntellectNav,
    safe: makeWebSafe,
    format: {
        bit: _formatBitrate,
        time: _formatTime,
        cent: _formatPercentage,
        size: _formatFileSize,
        gb: _inGB
    },
    capitalize: function (val) {
        return val.replace(/^./, function (match) {
            return match.toUpperCase();
        });
    }
};



angular.module('app.filters', [])
.filter('eta', function () {
    return function (val) {
        var output = "0:00:00";
        if (val && !isNaN(val)) {
            output = funcs.format.time(val);
        }
        return output;
    }
})
.filter('rawHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
})
.filter('filesize', function () {
    return function (bytes) {
        return funcs.format.size(bytes);
    };
})
.filter('parseDate', function () {
    return function (value) {
        return Date.parse(value);
    };
})
.filter('eta', function () {
    return function (val) {
        var output = "0:00:00";
        if (val && !isNaN(val)) {
            output = funcs.format.time(val);
        }
        return output;
    }
})
.filter('encode', function() {
    return window.encodeURIComponent;
})
.filter('time', function () {
    return function (duration, ms) {
        var num = parseInt(duration);
        if (isNaN(num)) num = 0;
        var hours = Math.floor(num / 3600) < 10 ? ("00" + Math.floor(num / 3600)).slice(-2) : Math.floor(num / 3600);
        var minutes = ("00" + Math.floor((num % 3600) / 60)).slice(-2);
        var seconds = ("00" + (num % 3600) % 60).slice(-2);
        var val = (hours != '00' ? hours + ":" : '') + minutes + ":" + seconds;
        if (ms) {
            var msValue = ("000" + parseInt((duration - parseInt(duration)) * 1000)).slice(-3);
            val += "." + msValue;
        }
        return val;
    }
})
.filter('moment', function () {
    return function (value, format) {
        if (!value) return '';
        return moment(value).format(format);
    };
})
.filter('fromNow', function () {
    return function (date) {
        if (date && date.indexOf('+') == -1 && date.indexOf('Z') == -1) date += '+00:00';
        return moment(date).utc().fromNow();
    }
})
.filter('viewer', function () {
    return function (input) {
        if (input < 800) return input;
        if (input < 800000) return (input/1000).toFixed(2)+'k';
        if (input < 800000000) return (input / 1000000).toFixed(2) + 'M';
        return (input / 1000000000).toFixed(2) + 'B';
    }
})
.filter('resize', ['resizer',function (resizer) {
    return resizer;
}])
.filter('gravtaar', ['md5','resizer', function (md5,resizer) {
    function isEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    return function (value, email, size, missing) {
        size = size || 150;
        if (!!value) {
            if (value.indexOf('youtube.com') > -1) { return value; }
            if (value.indexOf('http://') === -1) { value = 'http://images.vidzapper.com/' + value; }
            if (value.indexOf('www.gravatar.com') === -1 
                && value.indexOf("notfound") === -1 
                && value.indexOf('placehold.it/') === -1 
                && value !== "http://images.vidzapper.com/") { 
                    return resizer(value, size); 
            }  
        }
        if (isEmail(email)) { return '//www.gravatar.com/avatar/' + md5(email) + '?s=' + size + '&d=' + (missing || 'mm'); }
        if (missing != 'notfound') { return '//www.gravatar.com/avatar/' + md5(value || '') + '?s=' + size + '&d=' + (missing || 'mm'); }
        return null;
    };
}])
;
