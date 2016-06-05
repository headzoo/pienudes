"use strict";

module.exports = {
    init: function (app) {
        app.get('/kpop', function(req, res) {
            res.redirect(302, '/r/lobby');
        });
    }
};