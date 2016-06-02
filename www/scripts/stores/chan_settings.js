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
    }
});