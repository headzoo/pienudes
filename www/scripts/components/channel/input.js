'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    render: function () {
        
        return (
            <div id="channel-buffer-input-wrap">
                <input id="channel-buffer-input" type="text" placeholder="Say something..." onKeyUp={this.handleKeyUp} />
                <button id="channel-buffer-send" className="hidden-lg">Send</button>
                <input id="channel-buffer-color" type="color" />
                <button id="channel-buffer-emote">
                    <img src="https://twemoji.maxcdn.com/16x16/1f600.png" />
                </button>
            </div>
        )
    },
    
    handleKeyUp: function(e) {
        if (e.keyCode == 13) {
            
        }
    }
});

module.exports = Component;
