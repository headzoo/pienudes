"use strict";

var request = require('request');

function handle(req, res) {
    var path = req.query.u;
    request.get(path).pipe(res);
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/proxy', handle);
        app.get('/proxy/image', handle);
    }
};