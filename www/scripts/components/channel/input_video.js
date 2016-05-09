'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-video-input-wrap">
                <input ref="msg" id="channel-video-input" type="text" placeholder="Play something..." onKeyUp={this.handleKeyUp} />
                <button id="channel-video-search" className="channel-video-button">
                    <span className="glyphicon glyphicon-search"></span>
                </button>
                <button id="channel-video-catalog" className="channel-video-button">
                    <img src="https://twemoji.maxcdn.com/16x16/1f525.png" />
                </button>
                <button id="channel-video-add" className="channel-video-button hidden-lg" onClick={this.handleSendClick}>Add</button>
            </div>
        )
    }
});

module.exports = Component;
