'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions],
    emotes: [],
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHAT_MSG, this.onChatMsg);
        socket.on(Events.EMOTE_LIST, this.onEmoteList);
    },
    
    onChatMsg: function(data) {
        if (data.meta === undefined) {
            data.meta = {};
        }
        if (data.meta.color === undefined) {
            data.meta.color = "#FFF";
        }
        //data.msg = this.execEmotes(data.msg);
        
        this.data.push(data);
        this.trigger(this.data);
    },
    
    onEmoteList: function(emotes) {
        this.emotes = [];
        emotes.map(function (e) {
            if (e.image && e.name) {
                e.regex = new RegExp(e.source, "gi");
                this.emotes.push(e);
            } else {
                console.error("Rejecting invalid emote: " + JSON.stringify(e));
            }
        }.bind(this));
    },
    
    execEmotes: function(msg) {
        this.emotes.map(function(e) {
            msg = msg.replace(e.regex, '$1<img class="channel-buffer-emote" src="' + e.image + '" title="' + e.name + '">');
        });
        
        return msg;
    }
});