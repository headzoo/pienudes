'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var EmotesActions = require('../actions/emotes');
var ScrollActions = require('../actions/scroll');
var ErrorActions  = require('../actions/error');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, EmotesActions],
    data: {
        visible: false,
        items: [],
        user: [],
        selected: null,
        is_uploading: false
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
    
    onUploadUserStart: function() {
        this.data.is_uploading = true;
        this.trigger(this.data);
    },
    
    onDeleteUserDone: function(emote) {
        var index = -1;
        this.data.user.map(function(ue, i) {
            if (ue.text == emote.text) {
                index = i;
            }
        });
        
        if (index != -1) {
            this.data.user.splice(index, 1);
            this.trigger(this.data);
        }
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.EMOTE_LIST, this.onEmoteList);
        socket.on(Events.USER_EMOTE_LIST, this.onUserEmoteList);
        socket.on(Events.USER_EMOTE_COMPLETE, this.onUserEmoteComplete);
        socket.on(Events.ERROR_EMOTE, this.onErrorEmote);
    },
    
    onEmoteList: function(emotes) {
        this.data.items = emotes;
        this.trigger(this.data);
    },
    
    onUserEmoteList: function(emotes) {
        this.data.user = emotes;
        this.trigger(this.data);
    },
    
    onUserEmoteComplete: function(data) {
        this.data.user.push(data);
        this.data.is_uploading = false;
        this.trigger(this.data);
    },
    
    onErrorEmote: function(err) {
        this.data.is_uploading = false;
        this.trigger(this.data);
        alert(err.msg);
    }
});