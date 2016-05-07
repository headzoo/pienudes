'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    socket: null,
    data: {
        meta: {},
        tracks: []
    },
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.SET_PLAYLIST_META, this.onSetPlaylistMeta);
        socket.on(Events.PLAYLIST, this.onPlaylist);
        socket.on(Events.SET_CURRENT, this.onSetCurrent);
        socket.on(Events.DELETE, this.onDelete);
        socket.on(Events.QUEUE, this.onQueue);
    },
    
    onSetPlaylistMeta: function(meta) {
        this.data.meta = meta;
        this.trigger(this.data);
    },
    
    onPlaylist: function(playlist) {
        this.data.tracks = playlist;
        this.trigger(this.data);
    },
    
    onSetCurrent: function(index) {
    
    },
    
    onDelete: function(data) {
        if (data.uid !== undefined) {
            var tracks = [];
            this.data.tracks.map(function(t) {
                if (t.uid != data.uid) {
                    tracks.push(t);
                }
            });
            this.data.tracks = tracks;
            this.trigger(this.data);
        }
    },
    
    onQueue: function(data) {
        if (data.after == "prepend") {
            this.data.tracks.push(data.item);
        } else {
            this.data.tracks.splice(data.after, 0, data.item);
        }
        this.trigger(this.data);
    }
});