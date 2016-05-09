'use strict';

var React  = require('react');
var Reflux = require('reflux');
var EmotesStore = require('../../stores/emotes');

var Component = React.createClass({
    mixins: [
        Reflux.connect(EmotesStore, "emotes")
    ],
    
    render: function () {
        var items = [];
        this.state.emotes.items.map(function(emote, i) {
            items.push(
                <div key={i}>
                    <img src={emote.image} />
                </div>
            );
        });
        
        var style = {
            "display": (this.state.emotes.visible ? "block" : "none")
        };
        
        return (
            <div ref="list" id="channel-emote-picker" style={style}>
                {items}
            </div>
        )
    }
});

module.exports = Component;
