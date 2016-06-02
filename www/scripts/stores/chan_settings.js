'use strict';

var Reflux = require('reflux');
var ChanSettingsActions = require('../actions/chan_settings');

module.exports = Reflux.createStore({
    listenables: [ChanSettingsActions],
    data: {
        is_open: false
    },
    
    getInitialState() {
        return this.data;
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