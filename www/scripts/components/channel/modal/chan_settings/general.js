'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    render: function () {
        return (
            <div role="tabpanel" className="tab-pane active" id="modal-settings-pane-general">
                General
            </div>
        )
    }
});

module.exports = Component;
