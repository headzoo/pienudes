'use strict';

var Reflux        = require('reflux');
var PlayerActions = require('../actions/player');

module.exports = Reflux.createStore({
    listenables: [PlayerActions],
    data: {
        progress: 0
    },
    
    getInitialState() {
        return this.data;
    },
    
    onProgress: function(percent) {
        this.data.progress = percent;
        this.trigger(this.data);
    }
});