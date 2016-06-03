'use strict';

var Reflux             = require('reflux');
var UserOptionsActions = require('../actions/user_options');

var NO_STORAGE = typeof localStorage == "undefined" || localStorage === null;

function createCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    
    document.cookie = name + "=" + value + expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==" ") c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

module.exports = Reflux.createStore({
    listenables: [UserOptionsActions],
    
    data: {
        is_open: true,
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
                var value = NO_STORAGE ? readCookie(key) : localStorage.getItem(key);
                try {
                    value = JSON.parse(value);
                } catch (e) { }
                if (value === null || value === undefined) {
                    value = this.data[key];
                }
                this.data[key] = value;
            }
        }
    },
    
    getInitialState() {
        return this.data;
    },
    
    onSetValue: function(key, value) {
        this.data[key] = value;
    },
    
    onSave: function() {
        for(var key in this.data) {
            if (key == "is_open") continue;
            if (this.data.hasOwnProperty(key)) {
                var value = JSON.stringify(this.data[key]);
                NO_STORAGE ? createCookie(key, value, 1000) : localStorage.setItem(key, value);
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