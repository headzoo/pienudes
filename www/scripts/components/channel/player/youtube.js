'use strict';

var React                = require('react');
var Reflux               = require('reflux');
var YouTubePlayerStore   = require('../../../stores/player/youtube');
var YouTubePlayerActions = require('../../../actions/player/youtube');

var Component = React.createClass({
    mixins: [
        Reflux.connect(YouTubePlayerStore, "player")
    ],
    
    getDefaultProps: function() {
        return {
            videoId: ""
        }
    },
    
    getInitialState: function() {
        return {
            ready: false
        }
    },
    
    componentWillMount: function() {
        YouTubePlayerActions.load();
    },
    
    render: function () {
        if (!this.state.player.ready) {
            return (
                <div id="player-youtube">
                    <img src="/img/spinner.gif" />
                </div>
            );
        }
        
        return (
            <div id="player-youtube" className="player"></div>
        )
    }
});

module.exports = Component;
