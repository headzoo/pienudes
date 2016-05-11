'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var PlaylistActions = require('../../../actions/playlist');

var Component = React.createClass({
    componentDidMount: function() {
        /*
        $(document).on("click", function(e) {
            if (e.target == this.refs.catalog || e.target == this.refs.catalog_img) {
                return;
            }
            if (this.state.catalog_menu_visible) {
                this.setState({catalog_menu_visible: false});
            }
        }.bind(this));
        */
    },
    
    render: function () {
        
        return (
            <div id="channel-video-input-wrap">
                <input ref="msg" id="channel-video-input" type="text" placeholder="Play something... (Links from YouTube, SoundCloud)" onKeyUp={this.handleKeyUp} />
                <button id="channel-video-add" className="channel-video-button" onClick={this.handleAddClick}>Add</button>
                <button ref="search" id="channel-video-search" className="channel-video-button" onClick={this.handleSearch}>Search</button>
            </div>
        )
    },
    
    handleKeyUp: function(e) {
        if (e.keyCode == 13) {
            PlaylistActions.queueUrl(e.target.value);
            e.target.value = "";
        }
    },
    
    handleAddClick: function() {
        PlaylistActions.queueUrl(this.refs.msg.value);
        this.refs.msg.value = "";
    },
    
    handleSearch: function() {
        
    }
});

module.exports = Component;
