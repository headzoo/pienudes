'use strict';

var Reflux        = require('reflux');
var SocketActions = require('../actions/socket');
var VotingActions = require('../actions/voting');
var Events        = require('../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, VotingActions],
    data: {
        up: 0,
        down: 0,
        user: 0
    },
    
    getInitialState() {
        return this.data;
    },
    
    onVote: function(vote) {
        if (vote == this.data.user) {
            this.data.user = 0;
        } else {
            this.data.user = vote;
        }
        this.trigger(this.data);
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHANGE_VOTES, this.onChangeVotes);
        socket.on(Events.CHANGE_USER_VIDEO_VOTE, this.onChangeUserVideoVote);
    },
    
    onChangeVotes: function(votes) {
        this.data.up   = votes.up;
        this.data.down = votes.down;
        this.trigger(this.data);
    },
    
    onChangeUserVideoVote: function(vote) {
        this.data.user = vote;
        this.trigger(this.data);
    }
});