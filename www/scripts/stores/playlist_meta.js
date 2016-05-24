'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    data: {},
    
    getInitialState: function() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.SET_PLAYLIST_META, this.onSetPlaylistMeta);
    },
    
    onSetPlaylistMeta: function(meta) {
        this.meta = meta;
        this.trigger(this.data);
    }
});