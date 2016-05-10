'use strict';

var Reflux        = require('reflux');
var SocketActions = require('./socket');
var Events        = require('../events');

var VotingActions = Reflux.createActions({
    vote: {}
});

VotingActions.vote.listen(function(vote) {
    SocketActions.emit(Events.VOTE_VIDEO, vote);
});

module.exports = VotingActions;