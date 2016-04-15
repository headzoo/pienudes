"use strict";
var db = require("../database");

var blackHole = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the playlist history
     */
    insertPlaylistHistory(media, channel, user, callback) {
        if (typeof callback !== "function") {
            callback = blackHole;
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
    fetchPlaylistHistory(limit, offset, callback) {
        limit  = limit || 20;
        offset = offset || 0;
        if (typeof callback !== "function") {
            callback = blackHole;
        }
        
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
     * Returns the number of rows in the playlist_history table
     */
    countPlaylistHistory(callback) {
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history`", [], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    }
};