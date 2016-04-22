"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the table
     */
     insert(uid, type, title, seconds, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `media` (`uid`, `type`, `title`, `seconds`, `time`) VALUES(?, ?, ?, ?, ?)",
            [uid, type, title, seconds, Date.now()],
            callback
        );
    },
    
    /**
     * Finds the row with the given uid and type
     */
    fetchByUidAndType: function(uid, type, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `media` WHERE `uid` = ? AND `type` = ? LIMIT 1",
            [uid, type],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) callback(null, null);
                callback(null, rows[0])
            }
        );
    }
};