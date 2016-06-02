'use strict';

var Reflux = require('reflux');

var ChanSettingsActions = Reflux.createActions({
    show: {},
    hide: {},
    tabShow: {},
    tabShown: {},
    tabHide: {},
    tabHidden: {}
});

module.exports = ChanSettingsActions;