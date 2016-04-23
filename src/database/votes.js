"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetch: function(user_id, media_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `votes` WHERE `user_id` = ? AND `media_id` = ? LIMIT 1",
            [user_id, media_id],
            function(err, rows) {
                if (err) return callback(err, false);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetchVotes: function(media_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT value FROM `votes` WHERE `media_id` = ?",
            [media_id],
            function(err, rows) {
                if (err) return callback(err);
                
                var votes = {
                    up: 0,
                    down: 0
                };
                rows.forEach(function(row) {
                    if (row.value == -1) {
                        votes.down++;
                    } else {
                        votes.up++;
                    }
                });
                callback(null, votes);
            }
        );
    },
    
    insert: function(user_id, media_id, value, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `votes` (`user_id`, `media_id`, `value`, `time`) VALUES(?, ?, ?, ?)",
            [user_id, media_id, value, Date.now()],
            callback
        );
    },
    
    update: function(user_id, media_id, value, callback) {
        callback = callback || noop;
        
        db.query(
            "UPDATE `votes` SET `value` = ? WHERE `user_id` = ? AND `media_id` = ? LIMIT 1",
            [value, user_id, media_id],
            callback
        );
    }
};