import Config from './config';
import db from './database';
var db_playlists = require('./database/playlist');
var db_media     = require('./database/media');
var async        = require('async');

Config.load('config.yaml');
db.init();

function migrate(row, callback) {
    console.log(row);
    db_media.fetchByUidAndType(row.uid, row.type, function(err, media) {
        if (err) return callback(err);
        db_playlists.insertNew(media.id, row.channel, row.user, callback);
    });
}

db_playlists.fetchAll(function(err, rows) {
    async.map(rows, migrate, function(err, results){
        console.log("Done!");
    });
});