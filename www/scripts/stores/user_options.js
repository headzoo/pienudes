'use strict';

var Reflux             = require('reflux');
var UserOptionsActions = require('../actions/user_options');
var Storage            = require('../storage');

module.exports = Reflux.createStore({
    listenables: [UserOptionsActions],
    
    data: {
        is_open: false,
        ignore_channelcss: false,
        ignore_channeljs: false,
        show_colors: true,
        show_timestamps: true,
        show_joins: true,
        sort_rank: true,
        sort_afk: true,
        blink_title: "onlyping",
        boop: "onlyping",
        sync_accuracy: 2,
        default_quality: "auto",
        synch: true,
        wmode_transparent: true,
        chatbtn: true,
        modhat: false,
        joinmessage: true,
        show_shadowchat: true
    },
    
    qualities: {
        "auto": "Auto",
        "240": "240p",
        "360": "360p",
        "480": "480p",
        "720": "720p",
        "1080": "1080p",
        "best": "Highest Available"
    },

    notifications: {
        "never": "Never",
        "onlyping": "Only when I am mentioned or PMed",
        "always": "Always"
    },
    
    init: function() {
        for(var key in this.data) {
            if (key == "is_open") continue;
            if (this.data.hasOwnProperty(key)) {
                var value = Storage.getValue(key);
                if (value === null || value === undefined) {
                    value = this.data[key];
                }
                this.data[key] = value;
            }
        }
    },
    
    getInitialState: function() {
        return this.data;
    },
    
    onSetValue: function(key, value) {
        this.data[key] = value;
    },
    
    onSave: function() {
        for(var key in this.data) {
            if (key == "is_open") continue;
            if (this.data.hasOwnProperty(key)) {
                Storage.setValue(key, this.data[key]);
            }
        }
    
        this.trigger(this.data);
    },
    
    onShow: function() {
        this.data.is_open = true;
        this.trigger(this.data);
    },
    
    onHide: function() {
        this.data.is_open = false;
        this.trigger(this.data);
    }
});