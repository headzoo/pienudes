'use strict';

var db_votes    = require('./database/votes');
var db_accounts = require('./database/accounts');
var db_media    = require('./database/media');

var noop = function() {};

module.exports = {
    vote: function(media_id, user_id, value, callback) {
        callback = callback || noop;
    
        value = parseInt(value, 10);
        if (isNaN(value) || (value !== -1 && value !== 1)) {
            return callback("Invalid vote value.");
        }
    
        var success  = function(created) {
            db_votes.fetchVotes(media_id, function(err, votes) {
                if (err) return callback(err);
                callback(null, votes, created);
            });
        };
        
        db_media.fetchById(media_id, function(err, media) {
            if (err) return callback(err);
            if (!media) {
                return callback("Media not found.");
            }
            
            db_votes.fetch(user_id, media_id, function(err, vote) {
                if (err) return callback(err);
                if (vote) {
                    if (vote.value == value) {
                        db_votes.remove(user_id, media_id, function(err) {
                            if (err) return callback(err);
                            success(false);
                        });
                    } else {
                        db_votes.update(user_id, media_id, value, function(err) {
                            if (err) return callback(err);
                            success(true);
                        });
                    }
                } else {
                    db_votes.insert(user_id, media_id, value, function(err) {
                        if (err) return callback(err);
                        success(true);
                    });
                }
            });
        });
    },
    
    attachVotes: function(req, row, callback) {
        db_votes.fetchByMediaId(row.media_id, function(err, rows) {
            if (err) return callback(err);
        
            row.votes = {
                up: 0,
                down: 0,
                user: 0
            };
            rows.forEach(function(r) {
                if (r.value == 1) {
                    row.votes.up++;
                } else if (r.value == -1) {
                    row.votes.down++;
                }
                if (req.user != undefined && req.user.id != undefined && req.user.id == r.user_id) {
                    row.votes.user = r.value;
                }
            });
        
            callback(null, row);
        });
    }
};