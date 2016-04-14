var ChannelModule = require("./module");
var XSS = require("../xss");
var fs = require('fs');

function UploadModule(channel) {
    ChannelModule.apply(this, arguments);
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
    //var f = this.emotes.pack();
   // var chan = this.channel;
    //users.forEach(function (u) {
    //    u.socket.emit("uploadList", f);
    //});
};

UploadModule.prototype.handleUpload = function (user, data) {
    if (typeof data !== "object") {
        return;
    }
    if (!this.channel.modules.permissions.canUpload(user)) {
        return;
    }
    //console.log(this.channel);
    var chname = this.channel.name;
    fs.writeFile("/home/sean/Desktop/channel2.jpg", data.data, function(err) {
        if(err) {
            return console.log(err);
        }
        user.socket.emit("uploadComplete", {
            url: "https://images.pienudes/channels/" + chname + "/channel2.jpg"
        });
    });
};

UploadModule.prototype.handleRemove = function (user, data) {
    if (typeof data !== "object") {
        return;
    }
    if (!this.channel.modules.permissions.canUpload(user)) {
        return;
    }
};


module.exports = UploadModule;