'use strict';

var Reflux = require('reflux');

var EmotesActions = Reflux.createActions({
    show: {},
    hide: {},
    toggle: {},
    selected: {}
});

module.exports = EmotesActions;