'use strict';

var React        = require('react');
var Reflux       = require('reflux');
var Modal        = require('react-modal');
var ModalError   = require('./channel/modal/error');
var ModalOptions = require('./channel/modal/user_options');
var ModalSettings = require('./channel/modal/chan_settings');
var Users        = require('./channel/users');
var Buffer       = require('./channel/buffer');
var Video        = require('./channel/video');

var ConnectionStore     = require('../stores/connection');
var ChannelActions      = require('../actions/channel');
var ChannelStore        = require('../stores/channel');
var SocketActions       = require('../actions/socket');
var UsersActions        = require('../actions/users');
var MessagesActions     = require('../actions/messages');
var PlaylistActions     = require('../actions/playlist');
var EmotesActions       = require('../actions/emotes');
var UserOptionsActions  = require('../actions/user_options');
var ChanSettingsActions = require('../actions/chan_settings');

var Component = React.createClass({
    mixins: [
        Reflux.connect(ConnectionStore, "connection"),
        Reflux.listenTo(ChannelStore, "onChannel")
    ],
    
    onChannel: function(data) {
        this.setState({channel: data});
        if (data.name) {
            document.title = data.name;
        }
    },
    
    getDefaultProps: function() {
        return {
            join: "",
            data: {}
        }
    },
    
    getInitialState: function() {
        return {
            channel: ChannelStore.getInitialState()
        }
    },
    
    componentWillMount: function() {
        Modal.defaultStyles.overlay.backgroundColor = "rgba(0, 0, 0, 0.5)";
    
        SocketActions.connect(this.props.join);
        UsersActions.load(this.props.data.users);
        EmotesActions.load(this.props.data.emotes);
        MessagesActions.load(this.props.data.buffer);
        PlaylistActions.load(this.props.data.playlist);
        ChannelActions.setCSS(this.props.data.css);
        ChannelActions.setJS(this.props.data.js);
        
        $("#channel-nav-link-options").on("click", function() {
            UserOptionsActions.show();
        });
        $("#channel-nav-link-settings").on("click", function() {
            ChanSettingsActions.show();
        });
    },
    
    render: function () {
        if (!this.state.channel.name) {
            return null;
        }
        
        return (
            <div id="channel-wrap" className="row">
                <Users channel={this.props.join} />
                <Buffer />
                <Video />
                <ModalError />
                <ModalOptions />
                <ModalSettings />
            </div>
        )
    }
});

module.exports = Component;
