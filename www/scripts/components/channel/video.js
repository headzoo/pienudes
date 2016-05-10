'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var Playlist      = require('./playlist');
var Controls      = require('./video/controls');
var Input         = require('./video/input');
var PlayerStore   = require('../../stores/player');
var PlayerActions = require('../../actions/player');

var Component = React.createClass({
    mixins: [
        Reflux.connect(PlayerStore, "player")
    ],
    
    componentWillMount: function() {
        PlayerActions.load();
    },
    
    render: function () {
        var frame = null;
        if (this.state.player.loaded) {
            frame = <iframe width="560" height="315" src="https://www.youtube.com/embed/YqeW9_5kURI" frameBorder="0" allowFullScreen></iframe>;
        }
        
        return (
            <section id="channel-video-wrap" className="col-xs-12 col-sm-5 col-md-6">
                <div id="channel-video-frame">
                    {frame}
                </div>
                <Controls />
                <Playlist />
                <Input />
            </section>
        )
    }
});


module.exports = Component;
