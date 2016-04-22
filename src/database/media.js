"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a row to the table
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
     * Inserts a row if not already found
     */
    insertIgnore(uid, type, title, seconds, callback) {
        callback = callback || noop;
        
        this.fetchByUidAndType(uid, type, function(err, row) {
            if (err) return callback(err);
           
            if (row) {
                callback(null, row.id);
            } else {
                db.query(
                    "INSERT IGNORE INTO `media` (`uid`, `type`, `title`, `seconds`, `time`) VALUES(?, ?, ?, ?, ?)",
                    [uid, type, title, seconds, Date.now()],
                    function(err, res) {
                        if (err) return callback(err);
                        callback(null, res.insertId);
                    }
                );
            }
        }.bind(this));
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