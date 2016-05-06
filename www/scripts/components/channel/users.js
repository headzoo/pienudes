'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    propTypes: {
        users: React.PropTypes.array
    },
    
    getDefaultProps: function() {
        return {
            users: []
        }
    },
    
    render: function () {
        var items = [];
        this.props.users.map(function(u, i) {
            var icon = null;
            if (u.afk) {
                icon = <span className="glyphicon glyphicon-time"></span>;
            }
            items.push(<li key={i}>{icon} {u.username}</li>);
        });
        
        return (
            <div id="channel-user-list" className="hidden-xs hidden-sm col-md-2">
                <ul>
                    {items}
                </ul>
            </div>
        )
    }
});

module.exports = Component;
