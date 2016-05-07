'use strict';

var React   = require('react');
var Reflux  = require('reflux');
var Input   = require('./input');
var Message = require('./message');

var MessagesStore = require('../../stores/messages');

var Component = React.createClass({
    mixins: [
        Reflux.connect(MessagesStore, "messages")
    ],
    
    render: function () {
        
        return (
            <div id="channel-buffer-wrap" className="col-xs-12 col-sm-7 col-md-5">
                <div id="channel-buffer">
                    {this.state.messages.map(function(m, i) {
                        return <Message key={i} data={m} />
                    })}
                </div>
                <Input />
            </div>
        )
    }
});

module.exports = Component;
