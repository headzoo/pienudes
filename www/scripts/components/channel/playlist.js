'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var PlaylistItem    = require('./playlist/item');
var PlaylistStore   = require('../../stores/playlist');

var Component = React.createClass({
    mixins: [
        Reflux.connect(PlaylistStore, "playlist")
    ],
    
    componentDidUpdate: function() {
        $(this.refs.items)
            .mCustomScrollbar("update")
            .mCustomScrollbar("scrollTo", "top");
    },
    
    componentDidMount: function() {
        $(this.refs.items).mCustomScrollbar({
            theme: "minimal",
            autoHideScrollbar: true,
            scrollInertia: 0,
            mouseWheel: {
                scrollAmount: 300
            }
        });
    },
    
    render: function () {
        return (
            <div id="channel-playlist">
                <div ref="items" id="channel-playlist-items">
                    <table>
                        <tbody>
                            {this.state.playlist.map(function(t, i) {
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
