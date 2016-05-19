'use strict';

var React  = require('react');
var Reflux = require('reflux');
var PlayerStore = require('../../../stores/player');

var Component = React.createClass({
    mixins: [
        Reflux.connect(PlayerStore, "player")
    ],
    
    render: function () {
        var style = {
            width: this.state.player.progress + "%"
        };
        
        return (
            <div id="channel-video-progress">
                <span style={style}></span>
            </div>
        )
    }
});

module.exports = Component;
