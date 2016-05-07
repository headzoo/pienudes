'use strict';

var Reflux        = require('reflux');
var PlayerActions = require('../actions/player');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [PlayerActions, SocketActions],
    data: {
        loaded: false
    },
    
    getInitialState() {
        return this.data;
    },
    
    onLoadDone: function() {
        this.data.loaded = true;
        this.trigger(this.data);
    },
    
    onLoadFail: function(jqxhr, settings, exception) {
        console.log(exception);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHANGE_MEDIA, this.onChangeMedia);
    },
    
    onChangeMedia: function(data) {
        console.log(data);
        loadMediaPlayer(data);
        handleMediaUpdate(data);
    }
});