'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var EmotesActions = require('../actions/emotes');
var ScrollActions = require('../actions/scroll');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, EmotesActions],
    data: {
        visible: false,
        items: [],
        selected: null
    },
    
    getInitialState: function() {
        return this.data;
    },
    
    onLoad: function(emotes) {
        this.data.items = [];
        if (emotes) {
            emotes.map(function (e) {
                if (e.image && e.name) {
                    e.regex = new RegExp(e.source, "gi");
                    this.data.items.push(e);
                } else {
                    console.error("Rejecting invalid emote: " + JSON.stringify(e));
                }
            }.bind(this));
        }
        
        this.trigger(this.data);
    },
    
    onShow: function() {
        this.data.visible = true;
        this.trigger(this.data);
        ScrollActions.scroll();
    },
    
    onHide: function() {
        this.data.visible = false;
        this.trigger(this.data);
        ScrollActions.scroll();
    },
    
    onToggle: function() {
        this.data.visible = !this.data.visible;
        this.trigger(this.data);
        ScrollActions.scroll();
    },
    
    onSelected: function(emote, send) {
        this.data.selected = emote;
        this.trigger(this.data, send);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.EMOTE_LIST, this.onEmoteList);
    },
    
    onEmoteList: function(emotes) {
        this.data.items = emotes;
        this.trigger(this.data);
    }
});