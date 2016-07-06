"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the playlist history
     */
    insert: function(media_id, channel, user, callback) {
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
    
    removeById: function(pid, callback) {
        callback = callback || noop;
        
        pid = parseInt(pid);
        db.query("DELETE FROM `playlist_history` WHERE `id` = ? LIMIT 1", [pid], callback);
    },
    
    fetchById: function(pid, callback) {
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
    
    fetchUsersByMediaId: function(mid, callback) {
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
    fetch: function(limit, offset, callback) {
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
        
        var sql = "SELECT *, `playlist_history`.`time`, `playlist_history`.`id` AS `pid` FROM `playlist_history` " +
        "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
        "ORDER BY `pid` DESC " +
        "LIMIT " + offset + ", " + limit;
        db.query(sql, [], callback);
    },
    
    fetchByChannel: function(channel, limit, offset, callback) {
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
        
        var sql = "SELECT *, `playlist_history`.`time` FROM `playlist_history` " +
            "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
            "WHERE `playlist_history`.`channel` = ? " +
            "ORDER BY `playlist_history`.`id` DESC " +
            "LIMIT " + offset + ", " + limit;
        db.query(sql, [channel], callback);
    },
    
    /**
     * Returns every row in the table
     */
    fetchAll: function(callback) {
        callback = callback || noop;
        db.query("SELECT *, `playlist_history`.`time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id`", [], callback);
    },
    
    /**
     * Returns rows matching the given user
     */
    fetchByUser: function(user, limit, offset, callback) {
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
    
    fetchByMediaTitle: function(title, limit, offset, callback) {
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
    
        var sql = "SELECT *, `playlist_history`.`id` AS `pid`, `playlist_history`.`time` AS `time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` WHERE `media`.`title` LIKE ? ORDER BY `playlist_history`.`id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, ['%' + title + '%'], callback);
    },
    
    fetchByUserAndMediaTitle: function(user, title, limit, offset, callback) {
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
    
        var sql = "SELECT *, `playlist_history`.`id` AS `pid`, `playlist_history`.`time` AS `time` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` WHERE `playlist_history`.`user` = ? AND `media`.`title` LIKE ? ORDER BY `playlist_history`.`id` DESC LIMIT " + offset + ", " + limit;
        db.query(sql, [user, '%' + title + '%'], callback);
    },
    
    fetchFirstPlay: function(media_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT `user` FROM `playlist_history` WHERE `media_id` = ? ORDER BY `id` ASC LIMIT 1",
            [media_id],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]["user"]);
            }
        );
    },
    
    /**
     * Returns the names of each user in the table
     */
    fetchDistinctUsers: function(callback) {
        callback = callback || noop;
        
        db.query("SELECT `users`.*, COUNT(*) AS `cnt` FROM `playlist_history` INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` INNER JOIN `users` ON `users`.`name` = `playlist_history`.`user` GROUP BY `playlist_history`.`user` ORDER BY `cnt` DESC", callback);
    },
    
    fetchDistinctChannels: function(callback) {
        callback = callback || noop;
    
        db.query("SELECT DISTINCT(`channel`) FROM `playlist_history`", function(err, rows) {
            if (err) return callback(err);
            var channels = [];
            rows.forEach(function(row) {
                channels.push(row.channel);
            });
            callback(null, channels);
        });
    },
    
    fetchDistinctDays: function(callback) {
        callback = callback || noop;
    
        db.query("SELECT DISTINCT(DATE_FORMAT(FROM_UNIXTIME(`time` / 1000), '%M %D %Y')) AS `d`, DATE_FORMAT(FROM_UNIXTIME(`time` / 1000), '%Y-%m-%d') AS `s` FROM `playlist_history` ORDER BY `time` DESC", function(err, rows) {
            if (err) return callback(err);
            var dates = [];
            rows.forEach(function(row) {
                dates.push({
                    full: row.d,
                    short: row.s
                });
            });
            callback(null, dates);
        });
    },
    
    /**
     * Returns the most watch media
     */
    fetchMostWatched: function(limit, callback) {
        callback = callback || noop;
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
        
        var sql = "SELECT *, COUNT(*) AS `cnt` FROM playlist_history INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` GROUP BY `uid` ORDER BY `cnt` DESC, `playlist_history`.`time` ASC LIMIT " + limit;
        db.query(sql, [], callback);
    },
    
    fetchMostWatchedByChannel: function(channel, limit, callback) {
        callback = callback || noop;
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
    
        var sql = "SELECT *, COUNT(*) AS `cnt` FROM playlist_history INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` WHERE `playlist_history`.`channel` = ? GROUP BY `uid` ORDER BY `cnt` DESC, `playlist_history`.`time` ASC LIMIT " + limit;
        db.query(sql, [channel], callback);
    },
    
    fetchMostWatchedByDate: function(date, limit, callback) {
        callback = callback || noop;
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
        
        var start = date + " 00:00:00";
        var end   = date + " 23:59:59";
    
        var sql = "SELECT *, COUNT(*) AS `cnt` " +
        "FROM playlist_history INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
        "WHERE FROM_UNIXTIME(`playlist_history`.`time` / 1000) BETWEEN ? AND ? " +
        "GROUP BY `uid` " +
        "ORDER BY `cnt` DESC, `playlist_history`.`time` ASC " +
        "LIMIT " + limit;
        
        db.query(sql, [start, end], callback);
    },
    
    fetchMostWatchedByChannelAndDate: function(channel, date, limit, callback) {
        callback = callback || noop;
        limit = parseInt(limit);
        if (isNaN(limit)) {
            limit = 25;
        }
    
        var start = date + " 00:00:00";
        var end   = date + " 23:59:59";
    
        var sql = "SELECT *, COUNT(*) AS `cnt` " +
            "FROM playlist_history INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
            "WHERE `playlist_history`.`channel` = ? " +
            "AND (FROM_UNIXTIME(`playlist_history`.`time` / 1000) BETWEEN ? AND ?) " +
            "GROUP BY `uid` " +
            "ORDER BY `cnt` DESC, `playlist_history`.`time` ASC " +
            "LIMIT " + limit;
        
        db.query(sql, [channel, start, end], callback);
    },
    
    /**
     * Returns a random row from the table
     */
    fetchRandomByChannel: function(channel, limit, callback, must_pick_old) {
        callback = callback || noop;
        limit = limit || 1;
        
        var sql;
        var rand     = (Math.floor(Math.random() * 10) + 1);
        var pick_old = rand >= 8;
        if (pick_old || must_pick_old) {
            sql = "SELECT * FROM `playlist_history` " +
                "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
                "INNER JOIN `votes` ON `votes`.`media_id` = `media`.`id` " +
                "WHERE `channel` = ? " +
                "GROUP BY `media`.`id` " +
                "HAVING SUM(`votes`.`value`) > 1 " +
                "ORDER BY RAND() " +
                "LIMIT " + limit;
        } else {
            sql = "SELECT * FROM `playlist_history` " +
                "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
                "INNER JOIN `votes` ON `votes`.`media_id` = `media`.`id` " +
                "WHERE `channel` = ? " +
                "AND FROM_UNIXTIME(`playlist_history`.`time` / 1000) > DATE_SUB(NOW(), INTERVAL 2 WEEK)" +
                "GROUP BY `media`.`id` " +
                "HAVING SUM(`votes`.`value`) > 1 " +
                "ORDER BY RAND() " +
                "LIMIT " + limit;
        }

        db.query(sql, [channel], function(err, rows) {
            if (err) {
                return callback(err, null);
            }
            if (rows.length == 0 && !pick_old) {
                this.fetchRandomByChannel(channel, limit, callback, true);
            } else {
                callback(null, rows);
            }
        }.bind(this));
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
    
    fetchLast: function(callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `playlist_history` ORDER BY `id` DESC LIMIT 1",
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    /**
     * Returns the number of rows in the playlist_history table
     */
    count: function(callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history`", [], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countByMediaID: function(media_id, callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history` WHERE `media_id` = ?", [media_id], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countByMediaTitle: function(title, callback) {
        callback = callback || noop;
        
        var sql = "SELECT COUNT(*) AS `c` " +
            "FROM `playlist_history` " +
            "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
            "WHERE `media`.`title` LIKE ?";
        db.query(sql, ['%' + title + '%'], function(err, rows) {
            if (err) return callback(err);
            callback(null, rows[0]["c"]);
        });
    },
    
    countByUser: function(user, callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history` WHERE `user` = ?", [user], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countByUserAndMediaTitle: function(user, title, callback) {
        callback = callback || noop;
    
        var sql = "SELECT COUNT(*) AS `c` " +
            "FROM `playlist_history` " +
            "INNER JOIN `media` ON `media`.`id` = `playlist_history`.`media_id` " +
            "WHERE `playlist_history`.`user` = ? " +
            "AND `media`.`title` LIKE ?";
        db.query(sql, [user, '%' + title + '%'], function(err, rows) {
            if (err) return callback(err);
            callback(null, rows[0]["c"]);
        });
    },
    
    countByChannel: function(channel, callback) {
        callback = callback || noop;
        db.query("SELECT COUNT(*) AS `c` FROM `playlist_history` WHERE `channel` = ?", [channel], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["c"]);
        });
    },
    
    countDistinctUsersById: function(pid, callback) {
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