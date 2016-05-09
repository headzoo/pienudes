'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var EmotesActions = require('../actions/emotes');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, EmotesActions],
    data: {
        visible: false,
        items: []
    },
    
    getInitialState() {
        return this.data;
    },
    
    onShow: function() {
        this.data.visible = true;
        this.trigger(this.data);
    },
    
    onHide: function() {
        this.data.visible = false;
        this.trigger(this.data);
    },
    
    onToggle: function() {
        this.data.visible = !this.data.visible;
        this.trigger(this.data);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.EMOTE_LIST, this.onEmoteList);
    },
    
    onEmoteList: function(emotes) {
        this.data.items = emotes;
        this.trigger(this.data);
    }
});