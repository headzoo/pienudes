'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var Input         = require('./input_message');
var Message       = require('./message');
var MessagesStore = require('../../stores/messages');

var Component = React.createClass({
    mixins: [
        Reflux.connect(MessagesStore, "messages")
    ],
    
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
    
    componentDidUpdate: function() {
        $(this.refs.buffer)
            .mCustomScrollbar("update")
            .mCustomScrollbar("scrollTo", "bottom");
    },
    
    render: function () {
        return (
            <div id="channel-buffer-wrap" className="col-xs-12 col-sm-7 col-md-5">
                <div ref="buffer" id="channel-buffer">
                    <div id="mCSB_1" className="mCustomScrollBox mCS-minimal mCSB_vertical mCSB_outside" style={{maxHeight: "none"}} tabIndex="0">
                        <div id="mCSB_1_container" className="mCSB_container mCS_y_hidden mCS_no_scrollbar_y" style={{position:"relative", top:0, left:0}} dir="ltr">
                            {this.state.messages.map(function(m, i) {
                                return <Message key={i} data={m} />
                            })}
                        </div>
                    </div>
                </div>
                <Input />
            </div>
        )
    }
});

module.exports = Component;
