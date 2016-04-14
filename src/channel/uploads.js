"use strict";
var ChannelModule = require("./module");
var Config        = require('../config');
var XSS           = require("../xss");
var AWS           = require('aws-sdk');
var fs            = require('fs');
var db_uploads    = require('../database/uploads');

function UploadModule(channel) {
    ChannelModule.apply(this, arguments);
    AWS.config.region = 'us-east-1';
}

UploadModule.prototype = Object.create(ChannelModule.prototype);

UploadModule.prototype.load = function (data) {

};

UploadModule.prototype.save = function (data) {
    
};

UploadModule.prototype.packInfo = function (data, isAdmin) {
    if (isAdmin) {
        
    }
};

UploadModule.prototype.onUserPostJoin = function (user) {
    user.socket.on("uploadFile", this.handleUpload.bind(this, user));
    user.socket.on("removeUpload", this.handleRemove.bind(this, user));
    this.sendUploads([user]);
};

UploadModule.prototype.sendUploads = function (users) {
    var channel = this.channel;
    
    db_uploads.fetchByChannel(this.channel.name, function(err, rows) {
        if (err) {
            return;
        }
        
        var uploads = [];
        rows.forEach(function(r) {
            uploads.push({
                url: Config.get("uploads.root_images_url") + r.path,
                size: r.size
            });
        });
        users.forEach(function (u) {
            if (channel.modules.permissions.canUpload(u)) {
                u.socket.emit("uploadList", uploads);
            }
        });
    });
};

UploadModule.prototype.handleUpload = function (user, data) {
    if (typeof data !== "object") {
        return;
    }
    if (!this.channel.modules.permissions.canUpload(user)) {
        return;
    }
    
    var chname = this.channel.name;
    db_uploads.fetchBytesUsedByChannel(chname, function(err, bytes) {
        if (err) {
            user.socket.emit("errorMsg", {
                msg: "Error uploading file.",
                alert: true
            });
        } else {
            if (bytes + data.data.length > Config.get("uploads.bytes_per_channel")) {
                user.socket.emit("errorMsg", {
                    msg: "Not enough free space available to the channel. You have to delete some existing uploads to upload new files.",
                    alert: true
                });
            } else {
                var bucket = new AWS.S3({params: {Bucket: "images.pienudes.com"}});
                var params = {
                    Key: "channels/" + chname + "/" + data.name,
                    Body: data.data,
                    ContentType: data.type,
                    ACL:'public-read'
                };
    
                bucket.upload(params, function(err, res) {
                    if (err) {
                        user.socket.emit("errorMsg", {
                            msg: "Error uploading file.",
                            alert: true
                        });
                    } else {
                        db_uploads.insert(chname, params.Key, data.data.length, function(err) {
                            if (err) {
                                user.socket.emit("errorMsg", {
                                    msg: "Error uploading file.",
                                    alert: true
                                });
                            } else {
                                user.socket.emit("uploadComplete", {
                                    url: Config.get("uploads.root_images_url") + params.Key,
                                    size: data.data.length
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};

UploadModule.prototype.handleRemove = function (user, data) {
    if (typeof data !== "object") {
        return;
    }
    if (!this.channel.modules.permissions.canUpload(user)) {
        return;
    }
    
    console.log(data);
};


module.exports = UploadModule;