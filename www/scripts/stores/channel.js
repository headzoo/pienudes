'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    data: {
        opts: {},
        openqueue: false,
        css: "",
        js: "",
        motd: "",
        bio: "",
        name: false,
        usercount: 0,
        uploads: []
    },
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket, channel) {
        socket.on(Events.SET_MOTD, this.onSetMotd);
        socket.on(Events.SET_BIO, this.onSetBio);
        socket.on(Events.SET_PLAYLIST_LOCKED, this.onSetPlaylistLocked);
        socket.on(Events.CHANNEL_OPTS, this.onChannelOpts);
        socket.on(Events.CHANNEL_CSS_JS, this.onChannelCSSJS);
        socket.on(Events.USER_COUNT, this.onUserCount);
        socket.on(Events.UPLOAD_LIST, this.onUploadList);
        
        SocketActions.emit(Events.JOIN_CHANNEL, {
            name: channel
        });
        
        this.data.name = channel;
        this.trigger(this.data);
    },
    
    onSetMotd: function(motd) {
        this.data.motd = motd;
        this.trigger(this.data);
    },
    
    onSetBio: function(bio) {
        this.data.bio = bio;
        this.trigger(this.data);
    },
    
    onSetPlaylistLocked: function(locked) {
        this.data.openqueue = !locked;
        this.trigger(this.data);
    },
    
    onChannelOpts: function(opts) {
        this.data.opts = opts;
        this.trigger(this.data);
    },
    
    onChannelCSSJS: function(data) {
        if (data.css) {
            this.data.css = data.css;
        }
        if (data.js) {
            this.data.js = data.js;
        }
        this.trigger(this.data);
    },
    
    onUserCount: function(count) {
        this.data.usercount = count;
        this.trigger(this.data);
    },
    
    onUploadList: function(uploads) {
        this.data.uploads = uploads;
        this.trigger(this.data);
    }
});