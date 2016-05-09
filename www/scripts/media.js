'use strict';

function extractQueryParam(query, param) {
    var params = {};
    query.split("&").forEach(function (kv) {
        kv = kv.split("=");
        params[kv[0]] = kv[1];
    });
    
    return params[param];
}

module.exports = {
    clickUrl: function(media) {
        switch(media.type) {
            case "yt":
                return "https://youtu.be/" + media.id;
                break;
            case "sc":
                return media.id;
                break;
            case "vi":
                return "https://vimeo.com/" + media.id;
                break;
            case "dm":
                return "https://dailymotion.com/video/" + media.id;
                break;
            case "li":
                return "http://livestream.com/" + media.id;
                break;
            case "tw":
                return "https://twitch.tv/" + media.id;
                break;
            case "im":
                return "https://imgur.com/a/" + media.id;
                break;
            case "us":
                return "https://imgur.com/a/" + media.id;
                break;
            case "gd":
                return "https://docs.google.com/file/d/" + media.id;
                break;
            case "hb":
                return "https://hitbox.tv/" + media.id;
                break;
            default:
                return media.id;
                break;
        
        }
    },
    
    thumbnailUrl: function(media) {
        switch(media.type) {
            case "yt":
                return "https://i.ytimg.com/vi/" + media.id + "/default.jpg";
                break;
            case "sc":
                return "/img/thumbs/sc.png";
                break;
            case "vi":
                return "/img/thumbs/missing.jpg";
                break;
            case "dm":
                return "/img/thumbs/missing.jpg";
                break;
            case "li":
                return "/img/thumbs/missing.jpg";
                break;
            case "tw":
                return "/img/thumbs/missing.jpg";
                break;
            case "im":
                return "/img/thumbs/missing.jpg";
                break;
            case "us":
                return "/img/thumbs/missing.jpg";
                break;
            case "gd":
                return "/img/thumbs/missing.jpg";
                break;
            case "hb":
                return "/img/thumbs/missing.jpg";
                break;
            default:
                return "/img/thumbs/missing.jpg";
                break;
        
        }
    },
    
    parseMediaLink: function(url) {
        if(typeof url != "string") {
            return {
                id: null,
                type: null
            };
        }
        
        url = url.trim();
        url = url.replace("feature=player_embedded&", "");
    
        if(url.indexOf("jw:") == 0) {
            return {
                id: url.substring(3),
                type: "fi"
            };
        }
    
        if(url.indexOf("rtmp://") == 0) {
            return {
                id: url,
                type: "rt"
            };
        }
    
        var m;
        if((m = url.match(/youtube\.com\/watch\?([^#]+)/))) {
            return {
                id: extractQueryParam(m[1], "v"),
                type: "yt"
            };
        }
    
        if((m = url.match(/youtu\.be\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "yt"
            };
        }
    
        if((m = url.match(/youtube\.com\/playlist\?([^#]+)/))) {
            return {
                id: extractQueryParam(m[1], "list"),
                type: "yp"
            };
        }
    
        if((m = url.match(/twitch\.tv\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "tw"
            };
        }
    
        if((m = url.match(/livestream\.com\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "li"
            };
        }
    
        if((m = url.match(/ustream\.tv\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "us"
            };
        }
    
        if ((m = url.match(/hitbox\.tv\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "hb"
            };
        }
    
        if((m = url.match(/vimeo\.com\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "vi"
            };
        }
    
        if((m = url.match(/dailymotion\.com\/video\/([^\?&#_]+)/))) {
            return {
                id: m[1],
                type: "dm"
            };
        }
    
        if((m = url.match(/imgur\.com\/a\/([^\?&#]+)/))) {
            return {
                id: m[1],
                type: "im"
            };
        }
    
        if((m = url.match(/soundcloud\.com\/([^\?&#]+)/))) {
            return {
                id: url,
                type: "sc"
            };
        }
    
        if ((m = url.match(/(?:docs|drive)\.google\.com\/file\/d\/([^\/]*)/)) ||
            (m = url.match(/drive\.google\.com\/open\?id=([^&]*)/))) {
            return {
                id: m[1],
                type: "gd"
            };
        }
    
        if ((m = url.match(/plus\.google\.com\/(?:u\/\d+\/)?photos\/(\d+)\/albums\/(\d+)\/(\d+)/))) {
            return {
                id: m[1] + "_" + m[2] + "_" + m[3],
                type: "gp"
            };
        }
    
        /*  Shorthand URIs  */
        // To catch Google Plus by ID alone
        if ((m = url.match(/^(?:gp:)?(\d{21}_\d{19}_\d{19})/))) {
            return {
                id: m[1],
                type: "gp"
            };
        }
        // So we still trim DailyMotion URLs
        if((m = url.match(/^dm:([^\?&#_]+)/))) {
            return {
                id: m[1],
                type: "dm"
            };
        }
        // Raw files need to keep the query string
        if ((m = url.match(/^fi:(.*)/))) {
            return {
                id: m[1],
                type: "fi"
            };
        }
        // Generic for the rest.
        if ((m = url.match(/^([a-z]{2}):([^\?&#]+)/))) {
            return {
                id: m[2],
                type: m[1]
            };
        }
    
        /* Raw file */
        var tmp = url.split("?")[0];
        if (tmp.match(/^https?:\/\//)) {
            if (tmp.match(/\.(mp4|flv|webm|og[gv]|mp3|mov)$/)) {
                return {
                    id: url,
                    type: "fi"
                };
            } else {;
                throw new Error("ERROR_QUEUE_UNSUPPORTED_EXTENSION");
            }
        }
    
        return {
            id: null,
            type: null
        };
    }
};