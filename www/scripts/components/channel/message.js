'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    propTypes: {
        username: React.PropTypes.string.isRequired,
        text: React.PropTypes.string.isRequired
    },
    
    getDefaultProps: function() {
        return {
            username: "",
            text: "",
            color: "#FFFFFF"
        }
    },
    
    render: function () {
        var style = {
            color: this.props.color
        };
        
        return (
            <div>
                <strong className="username">{this.props.username}: </strong><span style={style}>{this.props.text}</span>
            </div>
        )
    }
});

module.exports = Component;
