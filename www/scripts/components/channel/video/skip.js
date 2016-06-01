'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var VotingActions = require('../../../actions/voting');
var VotingStore   = require('../../../stores/voting');

var Component = React.createClass({
    mixins: [
        Reflux.connect(VotingStore, "votes")
    ],
    
    render: function () {
        var count = (
            <span className="channel-video-controls-skip-value"></span>
        );
        if (this.state.votes.skip > 0) {
            count = (
                <span className="channel-video-controls-skip-value">[{this.state.votes.skip}/{this.state.votes.need}]</span>
            );
        }
        
        return (
            <div id="channel-video-controls-skip">
                <div id="channel-video-controls-skip-button" title="Vote to skip this video.">
                    <span className="glyphicon glyphicon-ban-circle" onClick={this.handleClick}></span>
                    {count}
                </div>
            </div>
        )
    },
    
    handleClick: function() {
        VotingActions.skip();
    }
});

module.exports = Component;
