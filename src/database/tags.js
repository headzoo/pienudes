"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetchByName: function(name, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `tags` WHERE `name` = ? LIMIT 1",
            [name],
            function(err, rows) {
                if (err) {
                    return callback(err, []);
                }
                if (!rows) {
                    return callback(null, null);
                }
                callback(err, rows[0]);
            }
        );
    },
    
    create: function(name, callback) {
        callback = callback || noop;
        name = name.toLowerCase();
        
        this.fetchByName(name, function(err, tag) {
            if (err) return callback(err);
            if (!tag) {
                db.query(
                    "INSERT INTO `tags` (`name`) VALUES(?)",
                    [name],
                    function(err, res) {
                        if (err) return callback(err);
                        callback(null, res.insertId);
                    }
                );
            } else {
                callback(null, tag.id);
            }
        });
    }
};