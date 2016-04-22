"use strict";

var Config      = require("./config");
var db          = require("./database");
var db_playlist = require("./database/playlist");
var db_media    = require("./database/media");

Config.load('config.yaml');
db.init();

db_playlist.fetchAll(function(err, rows) {
    if (err) {
        console.log(err);
        return;
    }
    
    rows.forEach(function(row) {
        console.log(row);
    });
});