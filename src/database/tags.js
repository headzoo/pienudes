"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetchAll: function(callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `tags`",
            callback
        );
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
    
    fetchByUser: function(user_id, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT tags.* " +
            "FROM `tags_to_favorites` " +
            "INNER JOIN `tags` ON `tags`.`id` = tags_to_favorites.tag_id " +
            "INNER JOIN `favorites` ON `favorites`.`id` = `tags_to_favorites`.`favorite_id` " +
            "WHERE `user_id` = ? " +
            "GROUP BY `tags`.`name` " +
            "ORDER BY `name` ASC",
            [user_id],
            callback
        );
    },
    
    fetchByUserAndName: function(user_id, name, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT `tags_to_favorites`.`id` AS `t2f_id`, tags.* " +
            "FROM `tags_to_favorites` " +
            "INNER JOIN `tags` ON `tags`.`id` = tags_to_favorites.tag_id " +
            "INNER JOIN `favorites` ON `favorites`.`id` = `tags_to_favorites`.`favorite_id` " +
            "WHERE `user_id` = ? " +
            "AND `tags`.`name` = ?",
            [user_id, name],
            callback
        );
    },
    
    fetchByUserAndMedia: function(user_id, media_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT tags.* " +
            "FROM `tags_to_favorites` " +
            "INNER JOIN `tags` ON `tags`.`id` = tags_to_favorites.tag_id " +
            "INNER JOIN `favorites` ON `favorites`.`id` = `tags_to_favorites`.`favorite_id` " +
            "WHERE `user_id` = ? AND `media_id` = ?",
            [user_id, media_id],
            callback
        );
    },
    
    create: function(name, callback) {
        callback = callback || noop;
        name = name.trim();
        
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
    },
    
    removeAssociation: function(t2f_id, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `tags_to_favorites` WHERE `id` = ? LIMIT 1",
            [t2f_id],
            callback
        );
    }
};