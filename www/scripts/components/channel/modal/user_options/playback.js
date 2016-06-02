'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var UserOptionsStore   = require('../../../../stores/user_options');
var UserOptionsActions = require('../../../../actions/user_options');
var CheckBox           = require('../../../forms/checkbox');
var Input              = require('../../../forms/input');
var Select             = require('../../../forms/select');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UserOptionsStore, "options")
    ],
    
    render: function () {
        return (
            <div role="tabpanel" className="tab-pane" id="modal-options-pane-playback">
                <form className="form-horizontal">
                    <Select name="default_quality" prefix="model-options-option-" options={UserOptionsStore.qualities} value={this.state.options.default_quality} onChange={this.handleChange}>
                        Default video quality
                    </Select>
                    <Input name="sync_accuracy" prefix="model-options-option-" value={this.state.options.sync_accuracy} onChange={this.handleChange}>
                        Synchronization threshold (seconds)
                    </Input>
                    <CheckBox name="wmode_transparent" prefix="modal-options-option-" checked={this.state.options.wmode_transparent} onChange={this.handleCheckboxChange}>
                        Set wmode=transparent
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
