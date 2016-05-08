'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var Media           = require('../../../media');
var PlaylistActions = require('../../../actions/playlist');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            track: {}
        }
    },
    
    render: function () {
        var track     = this.props.track;
        
        var play_icon = null;
        if (track.playing) {
            play_icon = <img src="/img/equalizer.gif" />;
        }
        
        var rng_icon  = null;
        var queueby   = track.queueby;
        if (queueby[0] == "@") {
            queueby = queueby.substring(1);
            rng_icon = "glyphicon glyphicon-refresh channel-playlist-requeue-icon";
        }
        
        return (
            <tr>
                <td className="channel-playlist-thumbnail">
                    <a href={Media.clickUrl(track.media)} target="_blank">
                        <img src={Media.thumbnailUrl(track.media)} />
                    </a>
                </td>
                <td style={{verticalAlign: "top"}}>
                    <div className="channel-playlist-info">
                        <div className="channel-playlist-duration pull-right">
                            {play_icon}
                            {track.media.duration}
                        </div>
                        <div className="channel-playlist-title">
                            <a href={Media.clickUrl(track.media)} target="_blank">{track.media.title}</a>
                        </div>
                        <div className="channel-playlist-username">
                            {queueby}<span className={rng_icon}></span>
                        </div>
                        <div className="channel-playlist-links">
                            <a onClick={this.handleDelete}>Delete</a>
                        </div>
                    </div>
                </td>
            </tr>
        )
    },
    
    handleDelete: function() {
        PlaylistActions.remove(this.props.track.uid);
    }
});

module.exports = Component;
