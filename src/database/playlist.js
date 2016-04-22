"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the playlist history
     */
    insert(media, channel, user, callback) {
        if (typeof callback !== "function") {
            callback = noop;
        }
        if (user[0] == "@") {
            user = user.substring(1);
        }
        
        db.query("INSERT INTO `playlist_history` (`uid`, `title`, `seconds`, `type`, `channel`, `user`, `time`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [media.id, media.title, media.seconds, media.type, channel, user, Date.now()],
            function (err, res) {
                if (err) {
                    callback(err, []);
                    return;
                }
            
                callback(err, res);
            });
    },
    
    /**
     * Returns rows from the playlist history
     */
    fetch(limit, offset, callback) {
        callback = callback || noop;
        
        limit  = limit || 20;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (isNaN(limit)) {
            limit = 20;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
        
        var sql = "SELECT * FROM `playlist_history` ORDER BY `id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, [], callback);
    },
    
    /**
     * Returns every row in the table
     */
    fetchAll(callback) {
        callback = callback || noop;
        db.query("SELECT * FROM `playlist_history`", [], callback);
    },
    
    /**
     * Returns rows matching the given user
     */
    fetchByUser(user, limit, offset, callback) {
        callback = callback || noop;
    
        limit  = limit || 20;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (isNaN(limit)) {
            limit = 20;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
    
        var sql = "SELECT * FROM `playlist_history` WHERE `user` = ? ORDER BY `id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, [user], callback);
    },
    
    /**
     * Returns the names of each user in the table
     */
    fetchDistinctUsers(callback) {
        callback = callback || noop;
        
        db.query("SELECT `user`, COUNT(*) AS `cnt` FROM `playlist_history` GROUP BY `user` ORDER BY `cnt` DESC", callback);
    },
    
    /**
     * Returns the most watch media
     */
    fetchMostWatched(limit, callback) {
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
        
        var sql = "SELECT *, COUNT(*) AS `cnt` FROM playlist_history GROUP BY `uid` ORDER BY `cnt` DESC, `time` ASC LIMIT " + limit;
        db.query(sql, [], callback);
    },
    
    /**
     * Returns a random row from the table
     */
    fetchRandomByChannel(channel, limit, callback) {
        callback = callback || noop;
        limit = limit || 1;
        
        var sql = "SELECT * FROM playlist_history WHERE `channel` = ? ORDER BY RAND() LIMIT " + limit;
        db.query(sql, [channel], function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            callback(null, rows);
        });
    },
    
    /**
     * Returns the number of rows in the playlist_history table
     */
    count(callback) {
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history`", [], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countByUser(user, callback) {
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history` WHERE `user` = ?", [user], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    }
};