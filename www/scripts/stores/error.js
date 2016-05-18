'use strict';

var Reflux       = require('reflux');
var ErrorActions = require('../actions/error');

module.exports = Reflux.createStore({
    listenables: [ErrorActions],
    data: "",
    
    getInitialState() {
        return this.data;
    },
    
    onAlert: function(msg) {
        this.data = msg;
        this.trigger(this.data);
    }
});