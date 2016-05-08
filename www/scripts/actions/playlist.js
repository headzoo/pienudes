'use strict';

var Reflux = require('reflux');
var SocketActions = require('./socket');
var Events        = require('../events');

var PlaylistActions = Reflux.createActions({
    remove: {children: ["done", "fail"]}
});

PlaylistActions.remove.listen(function(index) {
    SocketActions.emit(Events.DELETE, index);
});

module.exports = PlaylistActions;