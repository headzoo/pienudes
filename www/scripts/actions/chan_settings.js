'use strict';

var Reflux = require('reflux');

var ChanSettingsActions = Reflux.createActions({
    show: {},
    hide: {},
    save: {},
    setValue: {},
    tabShow: {},
    tabShown: {},
    tabHide: {},
    tabHidden: {}
});

module.exports = ChanSettingsActions;