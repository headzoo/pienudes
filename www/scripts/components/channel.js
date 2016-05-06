'use strict';

var React  = require('react');
var Reflux = require('reflux');
var Users  = require('./channel/users');
var Buffer = require('./channel/buffer');
var Video  = require('./channel/video');

var Component = React.createClass({
    render: function () {
        var users = [
            {username: "headzoo", rank: 255, afk: true},
            {username: "nyc_redhead", rank: 2, afk: true},
            {username: "boogers-in-your-soup", rank: 1, afk: true},
            {username: "MajesticPANGOLIN", rank: 1, afk: false}
        ];
        
        return (
            <div id="channel-wrap" className="row">
                <Users users={users} />
                <Buffer />
                <Video />
            </div>
        )
    }
});

module.exports = Component;
