var nunjucks    = require('nunjucks');
var dateFilter  = require('nunjucks-date-filter');
var commaFilter = require('nunjucks-comma-filter');
var moment      = require('moment');
var fs          = require("fs");
var path        = require("path");
var Config      = require("../config");
var templates   = path.join(__dirname, "..", "..", "templates");

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates), {
    autoescape: true
});
env.addFilter("date", dateFilter);
env.addFilter("comma", commaFilter);
env.addFilter('nl2p', function(str) {
    str = '<p>' + str.replace(/\n([ \t]*\n)+/g, '</p><p>')
            .replace('\n', '<br />') + '</p>';
    return str;
});
env.addFilter('media_url', function(media) {
    switch(media.type) {
        case "yt":
            return "http://youtube.com/watch?v=" + media.uid;
            break;
        case "sc":
            return media.uid;
            break;
        case "vi":
            return "http://vimeo.com/" + media.uid;
            break;
        case "dm":
            return "http://dailymotion.com/video/" + media.uid;
            break;
        case "li":
            return "http://livestream.com/" + media.uid;
            break;
        case "tw":
            return "http://twitch.tv/" + media.uid;
            break;
        case "im":
            return "http://imgur.com/a/" + media.uid;
            break;
        case "us":
            return "http://imgur.com/a/" + media.uid;
            break;
        case "gd":
            return "https://docs.google.com/file/d/" + media.uid;
            break;
        case "hb":
            return "http://hitbox.tv/" + media.uid;
            break;
        default:
            return media.uid;
            break;
    
    }
});

env.addFilter('thumbnail_url', function(media) {
    switch(media.type) {
        case "yt":
            return "https://i.ytimg.com/vi/" + media.uid + "/default.jpg";
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
});

env.addFilter('fromNow', function(date) {
    var result;
    var errs = [];
    var obj;
    
    try {
        obj = moment.utc(date);
    } catch (err) {
        errs.push(err);
    }
    if (obj) {
        try {
            result = obj.fromNow(false);
        } catch(err) {
            errs.push(err);
        }
    }
    
    if (errs.length) {
        return errs.join("\n");
    }
    return result;
});

/**
 * Merges locals with globals for template rendering
 */
function merge(locals, res) {
    var _locals = {
        siteTitle:       Config.get("html-template.title"),
        siteDescription: Config.get("html-template.description"),
        siteAuthor:      "",
        cacheBuster:     guid(),
        csrfToken:       typeof res.req.csrfToken === 'function' ? res.req.csrfToken() : '',
        baseUrl:         getBaseUrl(res),
        loginDomain:     Config.get("https.enabled") ? Config.get("https.full-address")
                                                     : Config.get("http.full-address")
    };
    if (typeof locals !== "object") {
        return _locals;
    }
    for (var key in locals) {
        _locals[key] = locals[key];
    }
    
    return _locals;
}

/**
 * Returns the site base url
 */
function getBaseUrl(res) {
    var req = res.req;
    return req.realProtocol + "://" + req.header("host");
}

/**
 * Renders and serves a template
 */
function send(res, view, locals) {
    locals.loggedIn  = locals.loggedIn || !!res.user;
    locals.loginName = locals.loginName || res.user ? res.user.name : false;
    var file = view + ".html.twig";
    var html = env.render(file, merge(locals, res));
    res.send(html);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4();
}

module.exports = {
    send: send
};
