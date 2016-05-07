'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    data: {},
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket, channel) {
        socket.on(Events.USER_LIST, this.onUserList);
    },
    
    onUserList: function(users) {
        users.map(function(u) {
            if (this.data[u.name] === undefined) {
                this.data[u.name] = u;
                this.trigger(this.data);
            }
        }.bind(this));
        this.trigger(this.data);
    }
});