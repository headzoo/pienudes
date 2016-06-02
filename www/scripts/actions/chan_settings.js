'use strict';

var Reflux = require('reflux');

var ChanSettingsActions = Reflux.createActions({
    show: {},
    hide: {},
    save: {},
    tabShow: {},
    tabShown: {},
    tabHide: {},
    tabHidden: {}
});

module.exports = ChanSettingsActions;