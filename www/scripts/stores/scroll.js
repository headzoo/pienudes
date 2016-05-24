'use strict';

var Reflux        = require('reflux');
var ScrollActions = require('../actions/scroll');

module.exports = Reflux.createStore({
    listenables: [ScrollActions],
    data: {},
    
    getInitialState: function() {
        return this.data;
    },
    
    onScroll: function() {
        this.trigger(this.data);
    }
});