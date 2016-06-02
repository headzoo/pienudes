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
    
    /*
    USEROPTS.secure_connection    = $("#us-ssl").prop("checked");
    USEROPTS.synch                = $("#us-synch").prop("checked");
    USEROPTS.sync_accuracy        = parseFloat($("#us-synch-accuracy").val()) || 2;
    USEROPTS.wmode_transparent    = $("#us-wmode-transparent").prop("checked");
    USEROPTS.hidevid              = $("#us-hidevideo").prop("checked");
    USEROPTS.qbtn_hide            = $("#us-playlistbuttons").prop("checked");
    USEROPTS.qbtn_idontlikechange = $("#us-oldbtns").prop("checked");
    USEROPTS.default_quality      = $("#us-default-quality").val();
    USEROPTS.chatbtn              = $("#us-sendbtn").prop("checked");
    USEROPTS.no_emotes            = $("#us-no-emotes").prop("checked");
    if (CLIENT.rank >= 2) {
        USEROPTS.modhat      = $("#us-modflair").prop("checked");
        USEROPTS.joinmessage = $("#us-joinmessage").prop("checked");
        USEROPTS.show_shadowchat = $("#us-shadowchat").prop("checked");
    }
    */
    
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
        boop: "onlyping"
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
        this.trigger(this.data);
    },
    
    onSave: function() {
        for(var key in this.data) {
            if (key == "is_open") continue;
            if (this.data.hasOwnProperty(key)) {
                var value = JSON.stringify(this.data[key]);
                NO_STORAGE ? createCookie(key, value, 1000) : localStorage.setItem(key, value);
            }
        }
    },
    
    onShow: function() {
        this.data.is_open = true;
        this.trigger(this.data);
    },
    
    onHide: function() {
        this.data.is_open = false;
        this.trigger(this.data);
    },
    
    onTabShow: function(pane) {
        
    },
    
    onTabShown: function(pane) {
        
    },
    
    onTabHide: function(pane) {
        
    },
    
    onTabHidden: function(pane) {
        
    }
});