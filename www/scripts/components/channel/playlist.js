'use strict';

var React  = require('react');
var Reflux = require('reflux');
var Media  = require('../../media');

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
                <tr key={i}  style={{height: "50px", padding: "0"}}>
                    <td className="channel-playlist-thumbnail">
                        <a href={Media.clickUrl(t.media)} target="_blank">
                            <img src={Media.thumbnailUrl(t.media)} />
                        </a>
                    </td>
                    <td style={{verticalAlign: "top"}}>
                        <div className="channel-playlist-info">
                            <div className="channel-playlist-duration pull-right">
                                <img src="/img/equalizer.gif" />
                                {t.media.duration}
                            </div>
                            <div className="channel-playlist-title">
                                <a href={Media.clickUrl(t.media)} target="_blank">{t.media.title}</a>
                            </div>
                            <div className="channel-playlist-username">
                                {queueby}<span className={icon}></span>
                            </div>
                        </div>
                    </td>
                </tr>
            );
        });
        
        return (
            <div id="channel-playlist">
                <div id="channel-playlist-items">
                    <table>
                        <tbody>
                            {items}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
});

module.exports = Component;
