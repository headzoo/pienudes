'use strict';

var React      = require('react');
var Reflux     = require('reflux');
var UsersStore = require('../../stores/users');
var Item       = require('./users/item');

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
        var items = [];
        this.state.users.map(function(user) {
            items.push(<Item key={user.name} user={user} />);
        });
        
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
    }
});

module.exports = Component;
