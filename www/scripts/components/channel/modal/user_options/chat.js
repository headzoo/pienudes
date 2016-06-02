'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    render: function () {
        return (
            <div role="tabpanel" className="tab-pane active" id="modal-options-pane-chat">
                Chat
            </div>
        )
    }
});

module.exports = Component;
