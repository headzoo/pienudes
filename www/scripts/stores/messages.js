'use strict';

var Reflux          = require('reflux');
var SocketActions   = require('../actions/socket');
var MessagesActions = require('../actions/messages');
var EmotesStore     = require('../stores/emotes');
var Events          = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, MessagesActions],
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    onLoad: function(messages) {
        messages.map(function(message) {
            if (message.meta === undefined) {
                message.meta = {};
            }
            if (message.meta.color === undefined) {
                message.meta.color = "#FFF";
            }
            message.msg = this.execEmotes(message.msg);
        }.bind(this));
        
        this.data = messages;
        this.trigger(this.data);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHAT_MSG, this.onChatMsg);
    },
    
    onChatMsg: function(data) {
        if (data.meta === undefined) {
            data.meta = {};
        }
        if (data.meta.color === undefined) {
            data.meta.color = "#FFF";
        }
        data.msg = this.execEmotes(data.msg);
        
        this.data.push(data);
        this.trigger(this.data);
    },
    
    execEmotes: function(msg) {
        EmotesStore.data.items.map(function(e) {
            msg = msg.replace(e.regex, '$1<img class="channel-buffer-emote" src="' + e.image + '" title="' + e.name + '">');
        });
        
        return msg;
    }
});