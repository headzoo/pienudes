'use strict';
import template from '../template';
import db_us from '../../database/user_scripts';

function handleExists(req, res) {
    if (req.user === undefined) {
        return res.sendStatus(401);
    }
    if (req.query.name === undefined || req.query.name.trim().length == 0) {
        return res.sendStatus(400);
    }
    
    db_us.findByUserAndName(req.user.id, req.query.name.trim(), function(err, row) {
        if (err) {
            return res.sendStatus(500);
        }
        if (row) {
            res.send("true");
        } else {
            res.send("false");
        }
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/scripting/exists', handleExists);
    }
};