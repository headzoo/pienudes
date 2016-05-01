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
    },
    
    fetchByChannel: function(channel_id, limit, offset, callback) {
        callback = callback || noop;
    
        limit  = limit || 200;
        offset = offset || 0;
        limit  = parseInt(limit);
        offset = parseInt(offset);
        if (isNaN(limit)) {
            limit = 200;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
        
        db.query(
            "SELECT * FROM `chat_logs` WHERE `channel_id` = ? ORDER BY `id` ASC LIMIT " + offset + "," + limit,
            [channel_id],
            callback
        );
    },
    
    fetchTodayByChannel: function(channel_id, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `chat_logs` WHERE `channel_id` = ? AND FROM_UNIXTIME(`time` / 1000) > DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY `id` ASC",
            [channel_id],
            callback
        );
    },
    
    fetchTodayByChannelAfterId: function(channel_id, after_id, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `chat_logs` WHERE `id` >= ? AND `channel_id` = ? ORDER BY `id` ASC LIMIT 100",
            [after_id, channel_id],
            callback
        );
    },
    
    fetchByChannelAndSearch: function(channel_id, search, callback) {
        callback = callback || noop;
    
        db.query(
            "SELECT * FROM `chat_logs` WHERE `channel_id` = ? AND `msg` LIKE ? ORDER BY `id` ASC LIMIT 500",
            [channel_id, '%' + search + '%'],
            callback
        );
    }
};