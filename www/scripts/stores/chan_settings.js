'use strict';

var Reflux = require('reflux');
var ChanSettingsActions = require('../actions/chan_settings');

module.exports = Reflux.createStore({
    listenables: [ChanSettingsActions],
    data: {
        is_open: true,
        allow_voteskip: 0,
        allow_dupes: 0,
        voteskip_ratio: "0.5",
        maxlength: "HH:MM:SS",
        rngmod_count: "1",
        afk_timeout: 600,
        join_msg: "",
        enable_link_regex: true,
        chat_antiflood: true,
        chat_antiflood_burst: 4,
        chat_antiflood_sustained: 1
    },
    
    getInitialState: function() {
        return this.data;
    },
    
    onSetValue: function(key, value) {
        this.data[key] = value;
    },
    
    onSave: function() {
        
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
        console.log("Show", pane);
    },
    
    onTabShown: function(pane) {
        console.log("Shown", pane);
    },
    
    onTabHide: function(pane) {
        console.log("Hide", pane);
    },
    
    onTabHidden: function(pane) {
        console.log("Hidden", pane);
    }
});