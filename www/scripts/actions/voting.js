'use strict';

var Reflux        = require('reflux');
var SocketActions = require('./socket');
var Events        = require('../events');

var VotingActions = Reflux.createActions({
    vote: {},
    skip: {}
});

VotingActions.vote.listen(function(vote) {
    SocketActions.emit(Events.VOTE_VIDEO, vote);
});

VotingActions.skip.listen(function() {
    SocketActions.emit(Events.VOTE_SKIP);
});

module.exports = VotingActions;