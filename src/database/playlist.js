"use strict";
var db = require("../database");

var blackHole = function () { };

module.exports = {
    init: function () {
    },
    
    /**
     * Adds a video to the playlist history
     */
    insertPlaylistHistory(media, channel, user, callback) {
        if (typeof callback !== "function") {
            callback = blackHole;
        }
        
        db.query("INSERT INTO `playlist_history` (`uid`, `title`, `seconds`, `type`, `channel`, `user`, `time`) VALUES(?, ?, ?, ?, ?, ?, ?)",
            [media.id, media.title, media.seconds, media.type, channel, user, Date.now()],
            function (err, res) {
                if (err) {
                    callback(err, []);
                    return;
                }
            
                callback(err, res);
            });
    }
};