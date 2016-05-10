'use strict';

var React  = require('react');
var Reflux = require('reflux');
var Votes  = require('./votes');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-video-controls">
                <Votes />
            </div>
        )
    }
});

module.exports = Component;
