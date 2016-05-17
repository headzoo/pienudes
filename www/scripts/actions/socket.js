'use strict';

var Reflux = require('reflux');
var Events = require('../events');

var socket  = null;
var channel = null;

var SocketActions = Reflux.createActions({
    "connect"     : {children: ["done", "fail"]},
    "login"       : {children: ["done", "fail"]},
    "rank"        : {children: ["done", "fail"]},
    "emit"        : {}
});

SocketActions.connect.listen(function(channel) {
    $.getJSON("/socketconfig/" + channel + ".json", function(config) {
    
        var chosen = null;
        config.servers.map(function(server) {
            if (chosen === null) {
                chosen = server;
            } else if (server.secure && !chosen.secure) {
                chosen = server;
            } else if (!server.ipv6Only && chosen.ipv6Only) {
                chosen = server;
            }
        });
        if (chosen === null) {
            return this.fail("Socket.io configuration was unable to find a suitable server.")
        }
        
        $.getScript('https://x21.io:8443/socket.io/socket.io.js', function() {
            
            socket = io(chosen.url, {
                secure: chosen.secure
            });
            socket.on(Events.LOGIN, function(data) {
                SocketActions.login(data);
            });
            socket.on(Events.RANK, function(rank) {
                SocketActions.rank(rank);
            });
            socket.on(Events.CONNECT, function() {
                this.done(socket, channel);
            }.bind(this));
        }.bind(this));
        
    }.bind(this));
});

SocketActions.login.listen(function(data) {
    if (data.success) {
        this.done(data);
    } else {
        this.fail(data);
    }
});

SocketActions.rank.listen(function(rank) {
    this.done(rank);
});

SocketActions.emit.listen(function(event, data) {
    socket.emit(event, data);
});

module.exports = SocketActions;