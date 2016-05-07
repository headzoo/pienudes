'use strict';

var React  = require('react');
var Reflux = require('reflux');

var PlaylistStore = require('../../stores/playlist');

var Component = React.createClass({
    mixins: [
        Reflux.connect(PlaylistStore, "playlist")
    ],
    
    render: function () {
        var items = [];
        this.state.playlist.tracks.map(function(t, i) {
            var icon    = null;
            var queueby = t.queueby;
            if (queueby[0] == "@") {
                queueby = queueby.substring(1);
                icon = "glyphicon glyphicon-refresh channel-playlist-requeue-icon";
            }
            
            items.push(
                <li key={i}>
                    <div className="channel-playlist-duration pull-right">
                        {t.media.duration}
                    </div>
                    <div className="channel-playlist-title">
                        {t.media.title}
                    </div>
                    <div className="channel-playlist-username">
                        {queueby}<span className={icon}></span>
                    </div>
                </li>
            );
        });
        
        return (
            <div id="channel-playlist">
                <div id="channel-playlist-items">
                    <ul>
                        {items}
                    </ul>
                </div>
            </div>
        )
    }
});

module.exports = Component;
