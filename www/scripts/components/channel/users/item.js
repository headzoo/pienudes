'use strict';

var React     = require('react');
var Reflux    = require('reflux');
var Constants = require('../../../constants');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            user: {}
        }
    },
    
    render: function () {
        var user   = this.props.user;
        var rclass = this.getRankClass(user.rank);
        var icon   = <span></span>;
        if (user.meta.afk) {
            icon = <span className="glyphicon glyphicon-time"></span>;
        }
        if (user.profile == undefined) {
            user.profile = {text: ""};
        }
        
        return (
            <li key={user.name}>
                <div>
                    {icon} <span className={rclass}>{user.name}</span>
                </div>
                <div className="channel-user-list-tagline">
                    {user.profile.text}
                </div>
            </li>
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
