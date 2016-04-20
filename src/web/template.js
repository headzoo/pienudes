var nunjucks    = require('nunjucks');
var dateFilter  = require('nunjucks-date-filter');
var commaFilter = require('nunjucks-comma-filter');
var fs          = require("fs");
var path        = require("path");
var Config      = require("../config");
var templates   = path.join(__dirname, "..", "..", "templates");

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates), {
    autoescape: true
});
env.addFilter("date", dateFilter);
env.addFilter("comma", commaFilter);

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
