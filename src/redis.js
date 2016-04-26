"use strict";

var redis   = require("redis");
var Config  = require("./config");

module.exports.createClient = function(db, callback) {
    var client = redis.createClient({
        host: Config.get("redis.host"),
        port: Config.get("redis.port")
    });
    client.select(db, function(err, res) {
        if (err) return callback(err);
        callback(null, client);
    });
};