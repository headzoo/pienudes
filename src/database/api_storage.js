"use strict";
var db    = require("../database");
var async = require('async');

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetchByUserAndKey: function(user_id, key, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `api_storage` WHERE `user_id` = ? AND `key` = ? LIMIT 1",
            [user_id, key],
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    insertOrUpdate: function(user_id, key, value, callback) {
        callback = callback || noop;
        
        this.fetchByUserAndKey(user_id, key, function(err, row) {
            if (err) return callback(err);
            if (!row) {
                this.insert(user_id, key, value, callback);
            } else {
                this.update(user_id, key, value, callback);
            }
        }.bind(this));
    },
    
    insert: function(user_id, key, value, callback) {
        callback = callback || noop;
        
        if (key.length > 150) {
            return callback("Key exceeds 150 character max length.");
        }
        if (value.length > 1024) {
            return callback("Value exceeds 1024 character max length.");
        }
        
        db.query(
            "INSERT INTO `api_storage` (`user_id`, `key`, `value`, `time`) VALUES(?, ?, ?, ?)",
            [user_id, key, value, Date.now()],
            callback
        );
    },
    
    update: function(user_id, key, value, callback) {
        callback = callback || noop;
    
        if (key.length > 150) {
            return callback("Key exceeds 150 character max length.");
        }
        if (value.length > 1024) {
            return callback("Value exceeds 1024 character max length.");
        }
        
        db.query(
            "UPDATE `api_storage` SET `value` = ? WHERE `user_id` = ? AND `key` = ? LIMIT 1",
            [value, user_id, key],
            callback
        );
    },
    
    remove: function(user_id, key, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `api_storage` WHERE `user_id` = ? AND `key` = ? LIMIT 1",
            [user_id, key],
            callback
        );
    }
};