'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var UsersActions  = require('../actions/users');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, UsersActions],
    data: {},
    
    getInitialState() {
        return this.data;
    },
    
    onLoad: function(users) {
        this.data = {};
        users.map(function(u) {
            if (u.name.length > 0) {
                if (this.data[u.name] === undefined) {
                    this.data[u.name] = u;
                    this.trigger(this.data);
                }
            }
        }.bind(this));
        this.trigger(this.data);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.USER_LIST, this.onUserList);
    },
    
    onUserList: function(users) {
        this.data = {};
        users.map(function(u) {
            if (u.name.length > 0) {
                if (this.data[u.name] === undefined) {
                    this.data[u.name] = u;
                    this.trigger(this.data);
                }
            }
        }.bind(this));
        this.trigger(this.data);
    }
});