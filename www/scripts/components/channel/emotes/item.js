'use strict';

var React        = require('react');
var Reflux       = require('reflux');
var EmoteActions = require('../../../actions/emotes');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            emote: {}
        }
    },
    
    render: function () {
        if (!this.props.emote.image) {
            return null;
        }
        
        return (
            <div onClick={this.handleClick}>
                <img src={this.props.emote.image} />
            </div>
        )
    },
    
    handleClick: function(e) {
        EmoteActions.selected(this.props.emote, e.shiftKey);
    }
});

module.exports = Component;
