"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the playlist history
     */
    insert(media_id, channel, user, callback) {
        callback = callback || noop;
        
        if (user[0] == "@") {
            user = user.substring(1);
        }
        
        db.query("INSERT INTO `playlist_history` (`media_id`, `channel`, `user`, `time`) VALUES(?, ?, ?, ?)",
            [media_id, channel, user, Date.now()],
            function (err, res) {
                if (err) {
                    callback(err, []);
                    return;
                }
            
                callback(err, res);
            });
    },
    
    removeById(pid, callback) {
        callback = callback || noop;
        
        pid = parseInt(pid);
        db.query("DELETE FROM `playlist_history` WHERE `id` = ? LIMIT 1", [pid], callback);
    },
    
    fetchById(pid, callback) {
        callback = callback || noop;
    
        pid = parseInt(pid);
        db.query(
            "SELECT * FROM `playlist_history` WHERE `id` = ? LIMIT 1",
            [pid],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetchUsersByMediaId(mid, callback) {
        callback = callback || noop;
    
        mid = parseInt(mid);
        db.query(
            "SELECT `users`.*, `playlist_history`.`id` AS `pid` " +
            "FROM `playlist_history` " +
            "INNER JOIN `users` ON `users`.`name` = `playlist_history`.`user` " +
            "WHERE `playlist_history`.`media_id` = ? " +
            "GROUP BY `playlist_history`.`user` " +
            "ORDER BY `playlist_history`.`id`",
            [mid],
            callback
        );
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
        
        var sql = "SELECT *, `playlist_history`.`time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` ORDER BY `playlist_history`.`id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, [], callback);
    },
    
    /**
     * Returns every row in the table
     */
    fetchAll(callback) {
        callback = callback || noop;
        db.query("SELECT *, `playlist_history`.`time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id`", [], callback);
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
    
        var sql = "SELECT *, `playlist_history`.`id` AS `pid`, `playlist_history`.`time` AS `time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` WHERE `user` = ? ORDER BY `playlist_history`.`id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, [user], callback);
    },
    
    /**
     * Returns the names of each user in the table
     */
    fetchDistinctUsers(callback) {
        callback = callback || noop;
        
        db.query("SELECT `users`.*, COUNT(*) AS `cnt` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` INNER JOIN `users` ON `users`.`name` = `playlist_history`.`user` GROUP BY `playlist_history`.`user` ORDER BY `cnt` DESC", callback);
    },
    
    /**
     * Returns the most watch media
     */
    fetchMostWatched(limit, callback) {
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
        
        var sql = "SELECT *, COUNT(*) AS `cnt` FROM playlist_history INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` GROUP BY `uid` ORDER BY `cnt` DESC, `playlist_history`.`time` ASC LIMIT " + limit;
        db.query(sql, [], callback);
    },
    
    /**
     * Returns a random row from the table
     */
    fetchRandomByChannel(channel, limit, callback) {
        callback = callback || noop;
        limit = limit || 1;
        
        var sql = "SELECT * FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` WHERE `channel` = ? ORDER BY RAND() LIMIT " + limit;
        db.query(sql, [channel], function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            callback(null, rows);
        });
    },
    
    fetchBySearchTerm: function(term, limit, offset, callback) {
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
        
        db.query(
            "SELECT SQL_CALC_FOUND_ROWS * FROM `playlist_history` " +
            "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
            "WHERE `media`.`title` LIKE ? " +
            "GROUP BY `media`.`id`" +
            "LIMIT " + offset + "," + limit +
            "; SELECT FOUND_ROWS() AS `f`;",
            ['%' + term + '%'],
            function(err, rows) {
                if (err) return callback(err);
                callback(null, rows[0], rows[1].f);
            }
        );
    },
    
    /**
     * Returns the number of rows in the playlist_history table
     */
    count(callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history`", [], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countByUser(user, callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history` WHERE `user` = ?", [user], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countDistinctUsersById(pid, callback) {
        callback = callback || noop;
        
        this.fetchById(pid, function(err, row) {
            if (err) return callback(err);
            if (!row) return callback(null, 0);
            
            db.query(
                "SELECT COUNT(DISTINCT(`user`)) AS `cnt` FROM `playlist_history` WHERE `media_id` = ?",
                [row.media_id],
                function(err, rows) {
                    if (err) return callback(err);
                    if (!rows) return callback(null, 0);
                    callback(null, rows[0].cnt);
                }
            );
        });

    }
};