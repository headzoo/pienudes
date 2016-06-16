"use strict";

var request        = require('request');
var db_api_storage = require('../../database/api_storage');

function handleGetDatabase(req, res) {
    if (!req.user) {
        return res.send(401);
    }
    if (req.query.key == undefined) {
        return res.send(400);
    }
    
    db_api_storage.fetchByUserAndKey(req.user.id, req.query.key, function(err, row) {
        if (err) {
            if (typeof err == "string") {
                res.json(err, 500);
            } else {
                res.json("Server Error", 500);
            }
            return;
        }
        
        if (!row) return res.json(null);
        res.send(row.value);
    });
}

function handleSetDatabase(req, res) {
    if (!req.user) {
        return res.send(401);
    }
    if (req.body.key == undefined || req.body.value == undefined) {
        return res.send(400);
    }
    
    db_api_storage.insertOrUpdate(req.user.id, req.body.key, req.body.value, function(err, obj) {
        if (err) {
            if (typeof err == "string") {
                res.json(err, 500);
            } else {
                res.json("Server Error", 500);
            }
            return;
        }
        
        res.json({
            affectedRows: obj.affectedRows,
            changedRows: obj.changedRows
        });
    });
}

function handleDeleteDatabase(req, res) {
    if (!req.user) {
        return res.send(401);
    }
    if (req.body.key == undefined) {
        return res.send(400);
    }
    
    db_api_storage.remove(req.user.id, req.body.key, function(err, obj) {
        if (err) {
            if (typeof err == "string") {
                res.json(err, 500);
            } else {
                res.json("Server Error", 500);
            }
            return;
        }
    
        res.json({
            affectedRows: obj.affectedRows,
            changedRows: obj.changedRows
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/api/database', handleGetDatabase);
        app.post('/api/database', handleSetDatabase);
        app.delete('/api/database', handleDeleteDatabase);
    }
};