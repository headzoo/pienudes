'use strict';

var Reflux = require('reflux');
var UserOptionsActions = require('../actions/user_options');

module.exports = Reflux.createStore({
    listenables: [UserOptionsActions],
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