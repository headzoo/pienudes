'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var SocketActions = require('../../../actions/socket');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-buffer-input-wrap">
                <input
                    ref="username"
                    id="channel-buffer-input"
                    className="channel-buffer-guest-login"
                    type="text"
                    placeholder="Enter a nickname to join chat"
                    onKeyUp={this.handleKeyUp} />
                <button
                    id="channel-buffer-send"
                    className="channel-buffer-button"
                    onClick={this.handleJoinClick}>Join</button>
            </div>
        )
    },
    
    handleKeyUp: function(e) {
        if (e.keyCode == 13) {
            SocketActions.guestLogin(this.refs.username.value);
            this.refs.username.value = "";
        }
    },
    
    handleJoinClick: function() {
        SocketActions.guestLogin(this.refs.username.value);
        this.refs.username.value = "";
    }
});

module.exports = Component;
