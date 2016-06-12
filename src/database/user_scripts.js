"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    findByUser: function(user_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `user_scripts` WHERE `user_id` = ? ORDER BY `name` ASC",
            [user_id],
            callback
        );
    },
    
    findByUserAndName: function(user_id, name, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `user_scripts` WHERE `user_id` = ? AND `name` = ? LIMIT 1",
            [user_id, name],
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    insert: function(user_id, name, script, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `user_scripts` (`user_id`, `name`, `script`) VALUES(?, ?, ?)",
            [user_id, name, script],
            callback
        );
    },
    
    insertOrUpdate: function(user_id, name, script, callback) {
        callback = callback || noop;
        
        this.findByUserAndName(user_id, name, function(err, row) {
            if (err) return callback(err);
            if (!row) {
               this.insert(user_id, name, script, callback); 
            } else {
                this.update(user_id, name, script, callback);
            }
        }.bind(this));
    },
    
    update: function(user_id, name, script, callback) {
        callback = callback || noop;
        
        db.query(
            "UPDATE `user_scripts` SET `script` = ? WHERE `user_id` = ? AND `name` = ? LIMIT 1",
            [script, user_id, name],
            callback
        );
    },
    
    removeByUserAndName: function(user_id, name, callback) {
        callback = callback || noop;
        
        db.query(
            "DELETE FROM `user_scripts` WHERE `user_id` = ? AND `name` = ? LIMIT 1",
            [user_id, name],
            callback
        );
    }
};