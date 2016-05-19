'use strict';

var React                = require('react');
var Reflux               = require('reflux');
var Playlist             = require('./playlist');
var Controls             = require('./video/controls');
var Input                = require('./video/input');
var Progress             = require('./video/progress');
var YouTubePlayerStore   = require('../../stores/player/youtube');
var YouTubePlayerActions = require('../../actions/player/youtube');
var YouTubePlayer        = require('./player/youtube');

var Component = React.createClass({
    mixins: [
        Reflux.connect(YouTubePlayerStore, "player")
    ],
    
    render: function () {
        return (
            <section id="channel-video-wrap" className="col-xs-12 col-sm-5 col-md-5">
                <div id="channel-video-frame">
                    <YouTubePlayer videoId="YqeW9_5kURI" />
                </div>
                <Progress />
                <Controls />
                <Playlist />
                <Input />
            </section>
        )
    }
});


module.exports = Component;
