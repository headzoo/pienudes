"use strict";
var ChannelModule = require("./module");
var Config        = require('../config');
var XSS           = require("../xss");
var AWS           = require('aws-sdk');
var fs            = require('fs');
var url           = require("url");
var db_uploads    = require('../database/uploads');
var db_emotes     = require('../database/emotes');

function UploadModule(channel) {
    ChannelModule.apply(this, arguments);
    AWS.config.region = 'us-east-1';
}

UploadModule.prototype = Object.create(ChannelModule.prototype);

UploadModule.prototype.onUserPostJoin = function (user) {
    user.socket.on("uploadFile", this.handleUpload.bind(this, user));
    user.socket.on("removeUpload", this.handleRemove.bind(this, user));
    user.socket.on("userEmoteUpload", this.handleUploadEmote.bind(this, user));
    user.socket.on("userEmoteRemove", this.handleRemoveEmote.bind(this, user));
    this.sendUploads([user]);
    this.sendEmotes(user);
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
                url: Config.get("uploads.uploads_url") + r.path,
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

UploadModule.prototype.sendEmotes = function (user) {
    if (user.account.guest) {
        return;
    }
    
    db_emotes.fetchByUserId(user.account.id, function(err, rows) {
        if (err) {
            return;
        }
        
        var emotes = [];
        rows.forEach(function(r) {
            emotes.push({
                url: Config.get("emotes.uploads_url") + r.path,
                text: r.text
            });
        });
        user.socket.emit("userEmoteList", emotes);
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
    var logger = this.channel.logger;
    db_uploads.fetchBytesUsedByChannel(chname, function(err, bytes) {
        if (err) {
            user.socket.emit("errorMsg", {
                msg: "Error uploading file. #1",
                alert: true
            });
        } else {
            if (bytes + data.data.length > Config.get("uploads.bytes_per_channel")) {
                user.socket.emit("errorMsg", {
                    msg: "Not enough free space available to the channel. You have to delete some existing uploads to upload new files.",
                    alert: true
                });
            } else if (data.data.length > Config.get("uploads.bytes_per_file")) {
                user.socket.emit("errorMsg", {
                    msg: "File exceeds max byte value of " + Config.get("uploads.bytes_per_file") + " bytes",
                    alert: true
                });
            } else {
                var bucket = new AWS.S3({params: {Bucket: Config.get("uploads.s3_bucket")}});
                var params = {
                    Key: chname + "/" + data.name,
                    Body: data.data,
                    ContentType: data.type,
                    ACL:'public-read'
                };
    
                bucket.upload(params, function(err, res) {
                    if (err) {
                        console.log(err);
                        user.socket.emit("errorMsg", {
                            msg: "Error uploading file. #2",
                            alert: true
                        });
                    } else {
                        db_uploads.remove(chname, params.Key, function(err) {
                            if (err) {
                                user.socket.emit("errorMsg", {
                                    msg: "Error uploading file. #3",
                                    alert: true
                                });
                            } else {
                                db_uploads.insert(chname, params.Key, data.data.length, function(err) {
                                    if (err) {
                                        user.socket.emit("errorMsg", {
                                            msg: "Error uploading file. #4",
                                            alert: true
                                        });
                                    } else {
                                        user.socket.emit("uploadComplete", {
                                            url: Config.get("uploads.uploads_url") + params.Key,
                                            size: data.data.length
                                        });
                                        logger.log("[upload] " + user.getName() + " uploaded file: '" + params.Key + "'");
                                    }
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
    
    try {
        var d      = url.parse(data.url);
        var path   = d.path.replace(/^\//, "");;
        var chname = this.channel.name;
        var logger = this.channel.logger;
        db_uploads.fetchByChannelAndPath(chname, path, function(err, rows) {
            if (err) {
                user.socket.emit("errorMsg", {
                    msg: "There was an error deleting the upload.",
                    alert: true
                });
                return;
            }
            if (rows.length == 0) {
                user.socket.emit("errorMsg", {
                    msg: "Upload not found.",
                    alert: true
                });
                return;
            }
    
            var bucket = new AWS.S3({params: {Bucket: Config.get("uploads.s3_bucket")}});
            var params = {
                Key: path
            };
            bucket.deleteObject(params, function(err) {
                if (err) {
                    user.socket.emit("errorMsg", {
                        msg: "Error deleting upload.",
                        alert: true
                    });
                } else {
                    db_uploads.remove(chname, path, function(err) {
                        if (err) {
                            user.socket.emit("errorMsg", {
                                msg: "Error deleting upload.",
                                alert: true
                            });
                        } else {
                            user.socket.emit("removeUpload", {
                                url: data.url
                            });
                            logger.log("[upload] " + user.getName() + " removed file: '" + params.Key + "'");
                        }
                    });
                }
            });
        });
    } catch (e) {
        user.socket.emit("errorMsg", {
            msg: "There was an error deleting the upload.",
            alert: true
        });
    }
};

UploadModule.prototype.handleUploadEmote = function(user, data) {
    if (typeof data !== "object" || user.account.guest) {
        return;
    }
    
    if (data.data.length > Config.get("emotes.bytes_per_file")) {
        user.socket.emit("errorEmote", {
            msg: "File exceeds max byte value of " + Config.get("emotes.bytes_per_file") + " bytes",
            alert: true
        });
        return;
    }
    
    var text = data.text.trim();
    if (text.length == 0) {
        user.socket.emit("errorEmote", {
            msg: "Emote text cannot be empty.",
            alert: true
        });
        return;
    } else if (text.length > 20) {
        user.socket.emit("errorEmote", {
            msg: "Emote text cannot exceed 20 characters.",
            alert: true
        });
        return;
    }
    
    db_emotes.fetchByUserIdAndText(user.account.id, data.text, function(err, row) {
        if (row) {
            user.socket.emit("errorEmote", {
                msg: "You are already using " + data.text + " for another emote.",
                alert: true
            });
            return;
        }
    
        var filename = user.account.name + "/" + makeRandom() + "_" + data.name;
        var bucket   = new AWS.S3({params: {Bucket: Config.get("emotes.s3_bucket")}});
        var params   = {
            Key: filename,
            Body: data.data,
            ContentType: data.type,
            ACL:'public-read'
        };
    
        bucket.upload(params, function(err) {
            if (err) {
                user.socket.emit("errorEmote", {
                    msg: "Error uploading file. Try again in a minute.",
                    alert: true
                });
                return;
            }
        
            db_emotes.insert(user.account.id, filename, text, function(err) {
                if (err) {
                    user.socket.emit("errorEmote", {
                        msg: "Error saving emote. Try again in a minute.",
                        alert: true
                    });
                    return;
                }
            
                user.socket.emit("userEmoteComplete", {
                    url: Config.get("emotes.uploads_url") + filename,
                    text: text
                });
            });
        });
    });
};

UploadModule.prototype.handleRemoveEmote = function(user, data) {
    if (typeof data !== "object" || user.account.guest) {
        return;
    }
    
    var text = data.text;
    db_emotes.fetchByUserIdAndText(user.account.id, text, function(err, row) {
        if (err) {
            user.socket.emit("errorEmote", {
                msg: "Unable to delete emote at this time."
            });
            return;
        }
        
        if (row) {
            try {
                var d    = url.parse(data.url);
                var path = d.path.replace(/^\//, "");
    
                var bucket = new AWS.S3({params: {Bucket: Config.get("emotes.s3_bucket")}});
                var params = {
                    Key: path
                };
                bucket.deleteObject(params, function(err) {
                    if (err) {
                        user.socket.emit("errorEmote", {
                            msg: "Error deleting emote."
                        });
                    } else {
                        db_emotes.remove(user.account.id, text, function() {
                            user.socket.emit("userEmoteRemove", {
                                url: data.url,
                                text: text
                            });
                        });
                    }
                });
            } catch(e) {
                user.socket.emit("errorEmote", {
                    msg: "Unable to delete emote at this time."
                });
            }
        }
    });
};

function makeRandom() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

module.exports = UploadModule;