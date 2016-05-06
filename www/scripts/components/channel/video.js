'use strict';

var React    = require('react');
var Reflux   = require('reflux');
var Controls = require('./controls');
var Playlist = require('./playlist');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-video-wrap" className="col-xs-12 col-sm-5 col-md-5">
                <div id="channel-video-frame">
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/dmVAmlpbnD4" frameBorder="0" allowFullScreen></iframe>
                </div>
                <Controls />
                <Playlist />
            </div>
        )
    }
});

module.exports = Component;
