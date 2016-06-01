'use strict';

var React  = require('react');
var Reflux = require('reflux');
var Votes  = require('./votes');
var Skip   = require('./skip');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-video-controls">
                <Votes />
                <Skip />
            </div>
        )
    }
});

module.exports = Component;
