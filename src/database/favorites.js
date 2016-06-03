"use strict";
var db    = require("../database");
var async = require('async');

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetchById: function(fav_id, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `favorites` WHERE `id` = ? LIMIT 1",
            [fav_id],
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetchByUserAndMedia: function(user_id, media_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `favorites` WHERE `user_id` = ? AND `media_id` = ? LIMIT 1",
            [user_id, media_id],
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetchByUser: function(user_id, limit, offset, callback) {
        callback = callback || noop;
        limit    = limit || 50;
        offset   = offset || 0;
        limit    = parseInt(limit);
        offset   = parseInt(offset);
        if (isNaN(limit)) {
            limit = 50;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
    
        db.query(
            "SELECT `media`.*, `media`.`id` AS `media_id`, `favorites`.`id` AS `favorite_id`, favorites.time AS `time` " +
            "FROM `favorites` " +
            "INNER JOIN `media` ON `media`.`id` = `favorites`.`media_id` " +
            "WHERE `user_id` = ? " +
            "ORDER BY `favorites`.`id` DESC LIMIT " + offset + "," + limit,
            [user_id],
            function(err, rows) {
                if (err) return callback(err);
                callback(null, rows);
            }
        );
    },
    
    removeById: function(fav_id, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `favorites` WHERE `id` = ? LIMIT 1",
            [fav_id],
            callback
        );
    },
    
    create: function(user_id, media_id, tag_ids, callback) {
        callback = callback || noop;
        
        this.fetchByUserAndMedia(user_id, media_id, function(err, favorite) {
            if (err) return callback(err);
            if (favorite) {
                db.query(
                    "DELETE FROM `tags_to_favorites` WHERE `favorite_id` = ?",
                    [favorite.id],
                    function(err) {
                        if (err) return callback(err);
                        async.map(tag_ids, this.linkFavoriteToTag.bind(this, favorite.id), function(err, results) {
                            if (err) return callback(err);
                            callback(null, favorite.id);
                        });
                    }.bind(this)
                );

                return;
            }
    
            db.query(
                "INSERT INTO `favorites` (`user_id`, `media_id`, `time`) VALUES(?, ?, ?)",
                [user_id, media_id, Date.now()],
                function(err, res) {
                    if (err) return callback(err);
                    if (tag_ids.length > 0) {
                        async.map(tag_ids, this.linkFavoriteToTag.bind(this, res.insertId), function(err) {
                            if (err) return callback(err);
                            callback(null, res.insertId);
                        });
                    } else {
                        callback(null, res.insertId);
                    }
                }.bind(this)
            );
        }.bind(this));
    },
    
    countByUser: function(user_id, callback) {
        callback = callback || noop;
    
        db.query("SELECT COUNT(*) AS `cnt` FROM `favorites` WHERE `user_id` = ?", [user_id], function(err, rows) {
            if (err) {
                callback(err, []);
                return;
            }
            callback(null, rows[0]["cnt"]);
        });
    },
    
    linkFavoriteToTag: function(fav_id, tag_id, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `tags_to_favorites` WHERE `favorite_id` = ? AND `tag_id` = ? LIMIT 1",
            [fav_id, tag_id],
            function(err) {
                if (err) return callback(err);
                db.query(
                    "INSERT INTO `tags_to_favorites` (`favorite_id`, `tag_id`) VALUES(?, ?)",
                    [fav_id, tag_id],
                    callback
                );
            }
        );
    }
};