'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var PlaylistActions = require('../../../actions/playlist');

var Component = React.createClass({
    getInitialState: function() {
        return {
            catalog_menu_visible: false
        }
    },
    
    componentDidMount: function() {
        $(document).on("click", function(e) {
            if (e.target == this.refs.catalog || e.target == this.refs.catalog_img) {
                return;
            }
            if (this.state.catalog_menu_visible) {
                this.setState({catalog_menu_visible: false});
            }
        }.bind(this));
    },
    
    render: function () {
        var style_catalog_menu = {
            display: (this.state.catalog_menu_visible ? "block" : "none")
        };
        
        return (
            <div id="channel-video-input-wrap">
                <input ref="msg" id="channel-video-input" type="text" placeholder="Play something... (Links from YouTube, SoundCloud)" onKeyUp={this.handleKeyUp} />
                <button id="channel-video-add" className="channel-video-button" onClick={this.handleAddClick}>Add</button>
                <button ref="catalog" id="channel-video-catalog" className="channel-video-button" onClick={this.handleCatalogClick}>
                    <img ref="catalog_img" src="https://twemoji.maxcdn.com/16x16/1f525.png" />
                </button>
                <div id="channel-video-catalog-menu" style={style_catalog_menu}>
                    <button id="channel-video-catalog-menu-favorites" className="channel-video-button" onClick={this.handleAddClick}>Favorites</button>
                </div>
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
    
    handleCatalogClick: function() {
        var visible = this.state.catalog_menu_visible;
        this.setState({catalog_menu_visible: !visible});
    }
});

module.exports = Component;
