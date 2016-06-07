"use strict";
var db    = require("../database");
var async = require('async');

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    fetchById: function(pid, callback) {
        callback = callback || noop;
        
        pid = parseInt(pid);
        db.query(
            "SELECT * FROM `alts` WHERE `id` = ? LIMIT 1",
            [pid],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetchByName: function(name, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `alts` WHERE `name` = ? LIMIT 1",
            [name],
            function(err, rows) {
                if (err) return callback(err);
                if (rows.length == 0) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    fetch: function(limit, offset, callback) {
        callback = callback || noop;
        
        limit  = limit || 20;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (isNaN(limit)) {
            limit = 20;
        }
        if (isNaN(offset)) {
            offset = 0;
        }
        
        var sql = "SELECT * FROM `alts` " +
            "ORDER BY `id` DESC " +
            "LIMIT " + offset + ", " + limit;
        db.query(sql, [], callback);
    },
    
    fetchByChannel: function(channel, callback) {
        callback = callback || noop;
        
        var sql = "SELECT * FROM `alts` WHERE `channels` LIKE ?";
        db.query(sql, ['%' + channel + '%'], callback);
    },
    
    update: function(id, name, password, channels, responses, playlist, queue_interval, is_enabled, callback) {
        callback = callback || noop;
        
        db.query(
            "UPDATE `alts` SET `name` = ?, `password` = ?, `channels` = ?, `responses` = ?, `playlist` = ?, `queue_interval` = ?, `is_enabled` = ? WHERE `id` = ? LIMIT 1",
            [name, password, channels, responses, playlist, queue_interval, is_enabled, id],
            callback
        );
    },
    
    insert: function(name, password, channels, responses, playlist, queue_interval, is_enabled, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `alts` (`name`, `password`, `channels`, `responses`, `playlist`, `queue_interval`, `is_enabled`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [name, password, channels, responses, playlist, queue_interval, is_enabled],
            callback
        );
    }
};