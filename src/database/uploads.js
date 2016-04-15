"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Returns the uploads for the given channel
     */
     fetchByChannel(channel, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `uploads` WHERE `channel` = ?",
            [channel],
            callback
        );
    },
    
    /**
     * Returns the row with the given channel and path
     */
    fetchByChannelAndPath(channel, path, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `uploads` WHERE `channel` = ? AND `path` = ? LIMIT 1",
            [channel, path],
            callback
        );
    },
    
    /**
     * Returns the total number of bytes used by the given channel
     */
    fetchBytesUsedByChannel(channel, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT SUM(`size`) AS `total` FROM `uploads` WHERE `channel` = ?",
            [channel],
            function(err, rows) {
                if (err) {
                    callback(err, 0);
                } else {
                    callback(null, rows[0]["total"]);
                }
            }
        );
    },
    
    /**
     * Adds an upload to the table
     */
     insert(channel, path, size, callback) {
        callback = callback || noop;
        
        db.query("INSERT INTO `uploads` (`channel`, `path`, `size`, `time`) VALUES(?, ?, ?, ?)",
            [channel, path, size, Date.now()],
            function (err, res) {
                if (err) {
                    callback(err, []);
                    return;
                }
                
                callback(err, res);
            });
    },
    
    /**
     * Deletes an upload from the table
     */
    remove(channel, path, callback) {
        callback = callback || noop;
    
        db.query("DELETE FROM `uploads` WHERE `channel` = ? AND `path` = ? LIMIT 1",
            [channel, path],
            function (err, res) {
                if (err) {
                    callback(err, []);
                    return;
                }
                callback(err, res);
            });
    }
};