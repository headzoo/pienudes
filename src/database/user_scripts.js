"use strict";
var db = require("../database");

var noop = function () { };

module.exports = {
    init: function () {
    },
    
    findByUser: function(user_id, callback) {
        callback = callback || noop;
        
        db.query(
            "SELECT * FROM `user_scripts` WHERE `user_id` = ? LIMIT 1",
            [user_id],
            function(err, rows) {
                if (err) return callback(err);
                if (!rows) return callback(null, null);
                callback(null, rows[0]);
            }
        );
    },
    
    insert: function(user_id, script, callback) {
        callback = callback || noop;
        
        db.query(
            "INSERT INTO `user_scripts` (`user_id`, `script`) VALUES(?, ?)",
            [user_id, script],
            callback
        );
    },
    
    insertOrUpdate: function(user_id, script, callback) {
        callback = callback || noop;
        
        this.findByUser(user_id, function(err, row) {
            if (err) return callback(err);
            if (!row) {
               this.insert(user_id, script, callback); 
            } else {
                this.update(user_id, script, callback);
            }
        }.bind(this));
    },
    
    update: function(user_id, script, callback) {
        callback = callback || noop;
        
        db.query(
            "UPDATE `user_scripts` SET `script` = ? WHERE `user_id` = ? LIMIT 1",
            [script, user_id],
            callback
        );
    }
};