'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    socket: null,
    data: {
        connected: false
    },
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.DISCONNECT, this.onDisconnected);
        
        this.socket         = socket;
        this.data.connected = true;
        this.trigger(this.data);
    },
    
    onConnectFail: function(err) {
        alert(err);
    },
    
    onDisconnected: function() {
        this.data.connected = false;
        this.trigger(this.data);
    }
});