"use strict";
var db = require("../database");

const VERSION = require("../../package.json").version;

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    insert: function(channel_id, user, type, msg, meta, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `chat_logs` (`channel_id`, `user`, `type`, `version`, `time`, `msg`, `meta`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [channel_id, user, type, VERSION, Date.now(), msg, meta],
            callback
        );
    }
};