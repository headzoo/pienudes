'use strict';

var React        = require('react');
var Reflux       = require('reflux');
var Constants    = require('../../constants');
var UsersStore = require('../../stores/users');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UsersStore, "users")
    ],
    
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
            <div id="channel-user-list" className="hidden-xs hidden-sm col-md-2">
                <ul>
                    {items}
                </ul>
            </div>
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
