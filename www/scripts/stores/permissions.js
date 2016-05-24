'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var ChannelStore  = require('./channel');
var ClientStore   = require('./client');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    rank: 0,
    data: {},
    
    getInitialState: function() {
        return this.data;
    },
    
    can: function(key) {
        if(key.indexOf("playlist") == 0 && ChannelStore.data.openqueue) {
            var key2 = "o" + key;
            var v = this.data[key2];
            if(typeof v == "number" && this.rank >= v) {
                return true;
            }
        }
        
        var v = this.data[key];
        if(typeof v != "number") {
            return false;
        }
        
        return this.rank >= v;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.SET_PERMISSIONS, this.onSetPermissions);
        socket.on(Events.RANK, this.onRank);
    },
    
    onRank: function(rank) {
        this.rank = rank;
    },
    
    onSetPermissions: function(perms) {
        this.data = perms;
        this.trigger(this.data);
    }
});