'use strict';

var Reflux = require('reflux');

var EmotesActions = Reflux.createActions({
    load: {},
    show: {},
    hide: {},
    toggle: {},
    selected: {}
});

module.exports = EmotesActions;