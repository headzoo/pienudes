'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var PlaylistItem    = require('./playlist/item');
var PlaylistStore   = require('../../stores/playlist');

var Component = React.createClass({
    mixins: [
        Reflux.connect(PlaylistStore, "playlist")
    ],
    
    render: function () {
        return (
            <div id="channel-playlist">
                <div id="channel-playlist-items">
                    <table>
                        <tbody>
                            {this.state.playlist.tracks.map(function(t, i) {
                                return <PlaylistItem key={i} track={t}/>
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
});

module.exports = Component;
