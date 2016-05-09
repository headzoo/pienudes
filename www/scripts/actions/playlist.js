'use strict';

var Reflux = require('reflux');
var SocketActions = require('./socket');
var Events        = require('../events');

var PlaylistActions = Reflux.createActions({
    remove: {},
    queueMedia: {},
    queueUrl: {}
});

PlaylistActions.remove.listen(function(index) {
    SocketActions.emit(Events.DELETE, index);
});

PlaylistActions.queueMedia.listen(function(media) {
    SocketActions.emit(Events.QUEUE, media);
});

module.exports = PlaylistActions;