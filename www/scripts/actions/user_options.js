'use strict';

var Reflux = require('reflux');

var UserOptionsActions = Reflux.createActions({
    show: {},
    hide: {},
    tabShow: {},
    tabShown: {},
    tabHide: {},
    tabHidden: {}
});

module.exports = UserOptionsActions;