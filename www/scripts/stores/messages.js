'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHAT_MSG, this.onChatMsg);
    },
    
    onChatMsg: function(data) {
        if (data.meta === undefined) {
            data.meta = {};
        }
        if (data.meta.color === undefined) {
            data.meta.color = "#FFF";
        }
        this.data.push(data);
        this.trigger(this.data);
    }
});