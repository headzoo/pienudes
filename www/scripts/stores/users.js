'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var UsersActions  = require('../actions/users');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, UsersActions],
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    onLoad: function(users) {
        this.data = [];
        if (users) {
            users.map(function (u) {
                if (u.name.length > 0 && !this._hasUser(u)) {
                    this.data.push(u);
                }
            }.bind(this));
            this.data.sort(this._sortUsersByRank);
        }
        
        this.trigger(this.data);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.USER_LIST, this.onUserList);
        socket.on(Events.ADD_USER, this.onAddUser);
    },
    
    onUserList: function(users) {
        this.data = [];
        users.map(function(u) {
            if (u.name.length > 0 && !this._hasUser(u)) {
                this.data.push(u);
            }
        }.bind(this));
    
        this.data.sort(this._sortUsersByRank);
        this.trigger(this.data);
    },
    
    onAddUser: function(user) {
        if (!this._hasUser(user)) {
            this.data.push(user);
            this.data.sort(this._sortUsersByRank);
            this.trigger(this.data);
        }
    },
    
    _hasUser: function(user) {
        this.data.map(function(u) {
            if (u.name == user.name) {
                return true;
            }
        });
        
        return false;
    },
    
    _sortUsersByRank: function(a, b) {
        if (a.rank == b.rank) {
            return 0;
        } else if (a.rank > b.rank) {
            return -1;
        } else {
            return 1;
        }
    }
});