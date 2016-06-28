"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Returns the emotes for the given user
     */
    fetchByUserId: function(user_id, limit, offset, callback) {
        callback = callback || noop;
        limit  = limit || 20;
        offset = offset || 0;
        limit  = parseInt(limit);
        offset = parseInt(offset);
        if (isNaN(limit)) {
            limit = 20;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
        
        db.query(
            "SELECT * FROM `attachments` WHERE `user_id` = ? ORDER BY `id` DESC LIMIT " + offset + ", " + limit,
            [user_id],
            callback
        );
    },
    
    insert: function(user_id, channel, path, size, type, md5, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `attachments` (`user_id`, `channel`, `path`, `size`, `type`, `md5`, `time`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [user_id, channel, path, size, type, md5, Date.now()],
            callback
        );
    }
};