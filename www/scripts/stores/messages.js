'use strict';

var Reflux          = require('reflux');
var SocketActions   = require('../actions/socket');
var MessagesActions = require('../actions/messages');
var EmotesStore     = require('../stores/emotes');
var Events          = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, MessagesActions],
    username: "",
    buffers: {},
    curr_buffer: "#channel",
    unread: {},
    data: [],
    
    getInitialState() {
        return this.data;
    },
    
    getUnreadCount: function(name) {
        if (this.unread[name] != undefined) {
            return this.unread[name];
        }
        return 0;
    },
    
    onLoad: function(messages) {
        this.buffers["#channel"] = [];
        this.unread["#channel"]  = 0;
        
        if (messages) {
            messages.map(function (message) {
                if (message.meta === undefined) {
                    message.meta = {};
                }
                if (message.meta.color === undefined) {
                    message.meta.color = "#FFF";
                }
                message.msg = this._execEmotes(message.msg);
                this.buffers["#channel"].push(message);
                this.data.push(message);
            }.bind(this));
    
            this.trigger(this.data);
        }
    },
    
    onSwitchBuffer: function(name) {
        if (this.buffers[name] == undefined) {
            this.buffers[name] = [];
        }
        if (this.curr_buffer != name) {
            this.curr_buffer = name;
            this.data = [];
            this.buffers[name].map(function(msg) {
                this.data.push(msg);
            }.bind(this));
            this.unread[name] = 0;
            this.trigger(this.data);
        }
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHAT_MSG, this.onChatMsg);
        socket.on(Events.PM, this.onPM);
    },
    
    onLoginDone: function(data) {
        this.username = data.name;
    },
    
    onChatMsg: function(data) {
        if (data.meta === undefined) {
            data.meta = {};
        }
        if (data.meta.color === undefined) {
            data.meta.color = "#FFF";
        }
        data.msg = this._execEmotes(data.msg);
        this.data.push(data);
        this.buffers["#channel"].push(data);
        
        if (this.curr_buffer != "#channel") {
            this.unread["#channel"]++;
        }
        
        this.trigger(this.data);
    },
    
    onPM: function(data) {
        var name = data.username;
        data.msg = this._execEmotes(data.msg);
        
        if (this.buffers[name] == undefined) {
            this.buffers[name] = [];
        }
        if (this.buffers[data.to] == undefined) {
            this.buffers[data.to] = [];
        }
        this.buffers[name].push(data);
        this.buffers[data.to].push(data);
        
        if (this.curr_buffer == name || name == this.username) {
            this.data.push(data);
        } else if (name != this.username) {
            if (this.unread[name] == undefined) {
                this.unread[name] = 0;
            }
            this.unread[name]++;
        }
        this.trigger(this.data);
    },
    
    _execEmotes: function(msg) {
        EmotesStore.data.items.map(function(e) {
            msg = msg.replace(e.regex, '$1<img class="channel-buffer-emote" src="' + e.image + '" title="' + e.name + '">');
        });
        
        return msg;
    }
});