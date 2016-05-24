'use strict';

var React  = require('react');
var Reflux = require('reflux');
var SocketActions = require('../../../actions/socket');
var EmotesActions = require('../../../actions/emotes');
var EmotesStore   = require('../../../stores/emotes');
var MessageStore  = require('../../../stores/messages');
var Events        = require('../../../events');

var history = [];
var history_index = 0;
var color = window.localStorage.getItem("chat_line_color");
if (!color) {
    color = "#FFF";
}

var Component = React.createClass({
    mixins: [
        Reflux.listenTo(EmotesStore, "onEmotes")
    ],
    
    onEmotes: function(emotes, send) {
        if (!emotes.selected) {
            return;
        }
        
        var value = this.refs.msg.value;
        if (value.length == 0) {
            value = emotes.selected.name;
        } else {
            value = value + " " + emotes.selected.name;
        }
        this.refs.msg.value = value;
        
        if (send) {
            this.handleSendClick();
        }
        EmotesActions.selected(null);
    },
    
    componentDidMount: function() {
        
        var color_picker = this.refs.color;
        $(color_picker).spectrum({
            color: color,
            preferredFormat: "hex",
            showInput: true,
            clickoutFiresChange: true,
            show: function() {
                EmotesActions.hide();
            }
        }).on("change", function () {
            color = color_picker.value;
            window.localStorage.setItem("chat_line_color", color);
        });
    
        $(this.refs.msg).textcomplete([
            {
                id: 'emoji',
                match: /\B:([\-+\w]*)$/,
                search: function (term, callback) {
                    callback($.map(EmotesStore.data.items, function (emoji) {
                        return emoji.name.replace(':', '').indexOf(term) === 0 ? emoji : null;
                    }));
                },
                template: function (value) {
                    return '<img src="' + value.image + '" class="dropdown-emote"></img>' + value.name;
                },
                replace: function (value) {
                    return value.name + ' ';
                },
                index: 1
            }
        ], {
            maxCount: 5,
            position: "top"
        });
    },
    
    render: function () {
        
        return (
            <div id="channel-buffer-input-wrap">
                <input ref="msg" id="channel-buffer-input" type="text" placeholder="Say something..." onKeyUp={this.handleKeyUp} />
                <button id="channel-buffer-send" className="channel-buffer-button" onClick={this.handleSendClick}>
                    <span className="glyphicon glyphicon-send"></span>
                </button>
                <button id="channel-buffer-emote" className="channel-buffer-button" onClick={this.handleEmotes}>
                    <img src="https://twemoji.maxcdn.com/16x16/1f600.png" />
                </button>
                <input ref="color" id="channel-buffer-color" className="channel-buffer-button" type="color" />
            </div>
        )
    },
    
    handleKeyUp: function(e) {
        if (e.keyCode == 13) {
            this.sendChatMsg(e.target.value);
        } else if (e.keyCode == 38) { // up arrow (history)
            if(history_index == history.length && e.target.value.length > 0) {
                history.push(e.target.value);
            }
            if(history_index > 0) {
                history_index--;
                e.target.value = history[history_index];
            }
            e.preventDefault();
        } else if (e.keyCode == 40) { // down arrow (history)
            if(history_index < history.length - 1) {
                history_index++;
                e.target.value = history[history_index];
            }
            e.preventDefault();
        } else if (e.keyCode == 9) { // tab complete
        
        }
    },
    
    handleSendClick: function() {
        this.sendChatMsg(this.refs.msg.value);
    },
    
    handleEmotes: function() {
        EmotesActions.toggle();
    },
    
    sendChatMsg: function(msg) {
        history.push(msg);
        history_index = history.length;
        this.refs.msg.value = "";
        
        if (MessageStore.curr_buffer == "#channel") {
            SocketActions.emit(Events.CHAT_MSG, {
                msg: msg,
                meta: {
                    color: color
                }
            });
        } else {
            SocketActions.emit(Events.PM, {
                to: MessageStore.curr_buffer,
                msg: msg,
                meta: {
                    color: color
                }
            });
        }
    }
});

module.exports = Component;
