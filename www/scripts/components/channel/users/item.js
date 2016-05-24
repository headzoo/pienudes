'use strict';

var React           = require('react');
var Reflux          = require('reflux');
var Constants       = require('../../../constants');
var MessageActions  = require('../../../actions/messages');
var MessageStore    = require('../../../stores/messages');
var classnames      = require('classnames');

var Component = React.createClass({
    mixins: [
        Reflux.listenTo(MessageStore, "onMessage")
    ],
    
    onMessage: function() {
        if (MessageStore.curr_buffer == "#channel" && typeof this.props.user == "string") {
            this.setState({active: true, unread: 0});
        } else if (MessageStore.curr_buffer == this.props.user.name) {
            this.setState({active: true, unread: 0});
        } else {
            var name = (typeof this.props.user == "string") ? "#channel" : this.props.user.name;
            this.setState({
                active: false,
                unread: MessageStore.getUnreadCount(name)
            });
        }
    },
    
    getDefaultProps: function() {
        return {
            user: {}
        }
    },
    
    getInitialState: function() {
        return {
            active: false,
            unread: 0
        }
    },
    
    componentDidMount: function() {
        if (MessageStore.curr_buffer == "#channel" && typeof this.props.user == "string") {
            this.setState({active: true, unread: 0});
        }
    },
    
    render: function () {
        var user = this.props.user;
        if (typeof user == "string") {
            var classes = classnames({
                "channel-user-list-channel-name": true,
                "active": this.state.active
            });
            
            return (
                <li className={classes} onClick={this.handleClick}>
                    <div className="channel-user-list-username">
                        <span>{user}</span>
                    </div>
                </li>
            );
        } else {
            var rclass  = this.getRankClass(user.rank);
            var icon    = null;
            var tagline = null;
            var unread  = null;
            if (user.meta.afk) {
                icon = <span className="glyphicon glyphicon-time"></span>;
            }
            if (user.profile == undefined) {
                user.profile = {text: ""};
            }
            if (user.profile.image == undefined) {
                user.profile.image = "/img/avatar.gif";
            }
    
            if (user.profile.text) {
                tagline = (
                    <div className="channel-user-list-tagline">
                        {user.profile.text}
                    </div>
                );
            } else if (user.rank == 0) {
                tagline = (
                    <div className="channel-user-list-tagline">
                        Guest
                    </div>
                );
            }
            
            if (this.state.unread != 0) {
                unread = (<span className="channel-user-list-unread">[{this.state.unread}]</span>);
            }
    
            var classes = classnames({
                "active": this.state.active
            });
    
            return (
                <li className={classes} onClick={this.handleClick}>
                    <div className="channel-user-list-avatar">
                        <img src={user.profile.image} />
                    </div>
                    <div className="channel-user-list-username">
                        {icon} <span className={rclass}>{user.name}</span>
                        {unread}
                    </div>
                    {tagline}
                </li>
            );
        }
    },
    
    handleClick: function() {
        if (typeof this.props.user !== "string" && MessageStore.username == this.props.user.name) {
            return;
        }
        
        if (typeof this.props.user == "string") {
            MessageActions.switchBuffer("#channel");
        } else {
            MessageActions.switchBuffer(this.props.user.name);
        }
    },
    
    getRankClass: function(rank) {
        if(rank >= Constants.Rank.Siteadmin) {
            return "channel-user-list-rank-admin";
        } else if(rank >= Constants.Rank.Admin) {
            return "channel-user-list-rank-owner";
        } else if(rank >= Constants.Rank.Moderator) {
            return "channel-user-list-rank-op";
        } else if(rank == Constants.Rank.Guest) {
            return "channel-user-list-rank-guest";
        } else {
            return "";
        }
    }
});

module.exports = Component;
