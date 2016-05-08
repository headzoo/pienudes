"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Returns the emotes for the given user
     */
     fetchByUserId: function(user_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `emotes` WHERE `user_id` = ? ORDER BY `id` DESC",
            [user_id],
            callback
        );
    },
    
    fetchByUserIdAndText: function(user_id, text, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `emotes` WHERE `user_id` = ? AND `text` = ? LIMIT 1",
            [user_id, text],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    insert: function(user_id, path, text, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `emotes` (`user_id`, `path`, `text`, `time`) VALUES(?, ?, ?, ?)",
            [user_id, path, text, Date.now()],
            callback
        );
    },
    
    remove: function(user_id, text, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `emotes` WHERE `user_id` = ? AND `text` = ? LIMIT 1",
            [user_id, text],
            callback
        );
    }
};