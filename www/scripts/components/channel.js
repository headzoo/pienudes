'use strict';

var React  = require('react');
var Reflux = require('reflux');
var Users  = require('./channel/users');
var Buffer = require('./channel/buffer');
var Video  = require('./channel/video');

var ConnectionStore = require('../stores/connection');
var ChannelStore    = require('../stores/channel');
var SocketActions   = require('../actions/socket');

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
            join: ""
        }
    },
    
    getInitialState: function() {
        return {
            channel: ChannelStore.getInitialState()
        }
    },
    
    componentWillMount: function() {
        SocketActions.connect(this.props.join);
    },
    
    render: function () {
        if (!this.state.channel.name) {
            return null;
        }
        
        return (
            <div id="channel-wrap" className="row">
                <Users />
                <Buffer />
                <Video />
            </div>
        )
    }
});

module.exports = Component;
