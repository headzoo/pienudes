'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var VotingStore   = require('../../../stores/voting');
var VotingActions = require('../../../actions/voting');
var classnames    = require('classnames');

var Component = React.createClass({
    mixins: [
        Reflux.connect(VotingStore, "votes")
    ],
    
    render: function () {
        var up_classes = classnames({
            active: (this.state.votes.user == 1)
        });
        var down_classes = classnames({
            active: (this.state.votes.user == -1)
        });
        
        return (
            <div id="channel-video-controls-votes">
                <div id="channel-video-controls-vote-down" className={down_classes}>
                    <span className="glyphicon glyphicon-chevron-down" onClick={this.handleDownVote}></span>
                    <span className="channel-video-controls-vote-value">{this.state.votes.down}</span>
                </div>
                <div id="channel-video-controls-vote-up" className={up_classes}>
                    <span className="channel-video-controls-vote-value">{this.state.votes.up}</span>
                    <span className="glyphicon glyphicon-chevron-up" onClick={this.handleUpVote}></span>
                </div>
            </div>
        )
    },
    
    handleUpVote: function() {
        VotingActions.vote(1);
    },
    
    handleDownVote: function() {
        VotingActions.vote(-1);
    }
});

module.exports = Component;
