'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var Input         = require('./buffer/input');
var Message       = require('./message');
var Emotes        = require('./emotes');
var GuestLogin    = require('./buffer/guest');
var MessagesStore = require('../../stores/messages');
var EmotesStore   = require('../../stores/emotes');
var ScrollStore   = require('../../stores/scroll');
var ClientStore   = require('../../stores/client');

var Component = React.createClass({
    mixins: [
        Reflux.connect(MessagesStore, "messages"),
        Reflux.connect(EmotesStore, "emotes"),
        Reflux.connect(ClientStore, "client"),
        Reflux.listenTo(ScrollStore, "onScroll")
    ],
    
    onScroll: function() {
        $(this.refs.buffer)
            .mCustomScrollbar("update")
            .mCustomScrollbar("scrollTo", "bottom");
    },
    
    componentDidUpdate: function() {
        $(this.refs.buffer)
            .mCustomScrollbar("update")
            .mCustomScrollbar("scrollTo", "bottom");
    },
    
    componentDidMount: function() {
        $(this.refs.buffer).mCustomScrollbar({
            theme: "minimal",
            autoHideScrollbar: true,
            scrollInertia: 0,
            mouseWheel: {
                scrollAmount: 300
            }
        });
    },
    
    render: function () {
        var style_buffer = {
            bottom: (this.state.emotes.visible ? "120px" : "56px")
        };
        
        var input = null;
        if (this.state.client.logged_in) {
            input = <Input />;
        } else {
            input = <GuestLogin />;
        }
        
        return (
            <section id="channel-buffer-wrap" className="col-xs-12 col-sm-7 col-md-6">
                <div ref="buffer" id="channel-buffer" style={style_buffer}>
                    <div id="mCSB_1" className="mCustomScrollBox mCS-minimal mCSB_vertical mCSB_outside" style={{maxHeight: "none"}} tabIndex="0">
                        <div id="mCSB_1_container" className="mCSB_container mCS_y_hidden mCS_no_scrollbar_y" style={{position:"relative", top:0, left:0}} dir="ltr">
                            {this.state.messages.map(function(m, i) {
                                return <Message key={i} data={m} />
                            })}
                        </div>
                    </div>
                </div>
                <Emotes />
                {input}
            </section>
        )
    }
});

module.exports = Component;
