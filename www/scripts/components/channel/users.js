'use strict';

var React        = require('react');
var Reflux       = require('reflux');
var Constants    = require('../../constants');
var UsersStore = require('../../stores/users');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UsersStore, "users")
    ],
    
    componentDidUpdate: function() {
        $(this.refs.list)
            .mCustomScrollbar("update")
            .mCustomScrollbar("scrollTo", "bottom");
    },
    
    componentDidMount: function() {
        $(this.refs.list).mCustomScrollbar({
            theme: "minimal",
            autoHideScrollbar: true,
            scrollInertia: 0,
            mouseWheel: {
                scrollAmount: 300
            }
        });
    },
    
    render: function () {
        var users = this.state.users;
        var items = [];
        for(var username in users) {
            if (users.hasOwnProperty(username)) {
                var user   = users[username];
                var rclass = this.getRankClass(user.rank);
                var icon   = <span></span>;
                if (user.meta.afk) {
                    icon = <span className="glyphicon glyphicon-time"></span>;
                }
                
                items.push(<li key={username}>{icon} <span className={rclass}>{username}</span></li>);
            }
        }
        
        return (
            <section id="channel-user-list-wrap" className="hidden-xs hidden-sm col-md-1">
                <div ref="list" id="channel-user-list">
                    <ul>
                        {items}
                    </ul>
                </div>
                <div id="channel-user-list-footer">
                    <a href="/help">Help</a> &middot; <a href="/terms">Terms</a> &middot; <a href="/about">About</a><br />
                    &copy; 2016 Pienudes
                </div>
            </section>
        )
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
