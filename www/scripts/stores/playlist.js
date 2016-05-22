'use strict';

var Reflux          = require('reflux');
var SocketActions   = require('../actions/socket');
var PlaylistActions = require('../actions/playlist');
var Events          = require('../events');
var Media           = require('../media');

module.exports = Reflux.createStore({
    listenables: [SocketActions, PlaylistActions],
    socket: null,
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    onLoad: function(playlist) {
        if (playlist) {
            this.data = playlist;
            this.trigger(this.data);
        }
    },
    
    onQueueUrl: function(url) {
        var m = Media.parseMediaLink(url);
        if (m.id === null) {
            // @todo Display error
            return;
        }
        
        m.pos = "end";
        m.temp = true;
        PlaylistActions.queueMedia(m);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.PLAYLIST, this.onPlaylist);
        socket.on(Events.SET_CURRENT, this.onSetCurrent);
        socket.on(Events.DELETE, this.onDelete);
        socket.on(Events.QUEUE, this.onQueue);
    },
    
    onPlaylist: function(playlist) {
        playlist.map(function(p) {
            p.playing = false;
        });
        this.data = playlist;
        this.trigger(this.data);
    },
    
    onSetCurrent: function(uid) {
        this.data.map(function(t) {
            t.playing = (t.uid == uid);
        });
        this.trigger(this.data);
    },
    
    onDelete: function(data) {
        if (data.uid !== undefined) {
            var tracks = [];
            this.data.map(function(t) {
                if (t.uid != data.uid) {
                    tracks.push(t);
                }
            });
            
            this.data = tracks;
            this.trigger(this.data);
        }
    },
    
    onQueue: function(data) {
        if (data.after == "prepend") {
            this.data.push(data.item);
        } else {
            this.data.splice(data.after, 0, data.item);
        }
        this.trigger(this.data);
    }
});