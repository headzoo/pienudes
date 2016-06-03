'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var UserOptionsStore   = require('../../../../stores/user_options');
var UserOptionsActions = require('../../../../actions/user_options');
var CheckBox           = require('../../../forms/checkbox');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UserOptionsStore, "options")
    ],
    
    render: function () {
        var common = {
            prefix: "modal-options-option-",
            onChange: this.handleChange
        };
        
        return (
            <div role="tabpanel" className="tab-pane" id="modal-options-pane-mod">
                <form className="form-horizontal">
                    <CheckBox name="modhat" checked={this.state.options.modhat} {...common}>
                        Show name color
                    </CheckBox>
                    <CheckBox name="joinmessage" checked={this.state.options.joinmessage} {...common}>
                        Show join notifications
                    </CheckBox>
                    <CheckBox name="show_shadowchat" checked={this.state.options.show_shadowchat} {...common}>
                        Show shadow muted notifications
                    </CheckBox>
                </form>
            </div>
        )
    },
    
    handleChange: function(name, value) {
        UserOptionsActions.setValue(name, value);
    }
});

module.exports = Component;
