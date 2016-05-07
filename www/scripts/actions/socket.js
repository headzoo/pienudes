'use strict';

var Reflux = require('reflux');
var Events = require('../events');

var socket  = null;
var channel = null;

var SocketActions = Reflux.createActions({
    "connect"     : {children: ["done", "fail"]},
    "emit"        : {}
});

SocketActions.connect.listen(function(chan) {
    if (chan !== undefined) {
        channel = chan;
    }
    
    $.getJSON("/socketconfig/" + channel + ".json", function(config) {
    
        var chosen = null;
        config.servers.forEach(function (server) {
            if (chosen === null) {
                chosen = server;
            } else if (server.secure && !chosen.secure) {
                chosen = server;
            } else if (!server.ipv6Only && chosen.ipv6Only) {
                chosen = server;
            }
        });
        
        if (chosen === null) {
            this.fail("Socket.io configuration was unable to find a suitable server.")
        } else {
            var opts = {
                secure: chosen.secure
            };
            socket = io(chosen.url, opts);
            socket.on(Events.CONNECT, function() {
                this.done(socket, channel);
            }.bind(this));
        }
    }.bind(this));
});

SocketActions.emit.listen(function(event, data) {
    socket.emit(event, data);
});

module.exports = SocketActions;