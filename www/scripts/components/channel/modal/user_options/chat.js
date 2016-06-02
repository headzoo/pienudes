'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var UserOptionsStore   = require('../../../../stores/user_options');
var UserOptionsActions = require('../../../../actions/user_options');
var CheckBox           = require('../../../forms/checkbox');
var Select             = require('../../../forms/select');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UserOptionsStore, "options")
    ],
    
    render: function () {
        return (
            <div role="tabpanel" className="tab-pane active" id="modal-options-pane-chat">
                <form className="form-horizontal">
                    <CheckBox name="show_colors" prefix="modal-options-option-" checked={this.state.options.show_colors} onChange={this.handleChange}>
                        Show colors
                    </CheckBox>
                    <CheckBox name="show_timestamps" prefix="modal-options-option-" checked={this.state.options.show_timestamps} onChange={this.handleChange}>
                        Show timestamps
                    </CheckBox>
                    <CheckBox name="show_joins" prefix="modal-options-option-" checked={this.state.options.show_joins} onChange={this.handleChange}>
                        Show join messages
                    </CheckBox>
                    <CheckBox name="sort_rank" prefix="modal-options-option-" checked={this.state.options.sort_rank} onChange={this.handleChange}>
                        Sort users by rank
                    </CheckBox>
                    <CheckBox name="sort_afk" prefix="modal-options-option-" checked={this.state.options.sort_afk} onChange={this.handleChange}>
                        Sort AFKers to bottom
                    </CheckBox>
                    <CheckBox name="ignore_channelcss" prefix="modal-options-option-" checked={this.state.options.ignore_channelcss} onChange={this.handleChange}>
                        Ignore channel CSS
                    </CheckBox>
                    <CheckBox name="ignore_channeljs" prefix="modal-options-option-" checked={this.state.options.ignore_channeljs} onChange={this.handleChange}>
                        Ignore channel javascript
                    </CheckBox>
                    <Select name="blink_title" prefix="model-options-option-" options={UserOptionsStore.notifications} value={this.state.options.blink_title} onChange={this.handleChange}>
                        Blink page title on new messages
                    </Select>
                    <Select name="boop" prefix="model-options-option-" options={UserOptionsStore.notifications} value={this.state.options.boop} onChange={this.handleChange}>
                        Notification sound on new messages
                    </Select>
                </form>
            </div>
        )
    },
    
    handleChange: function(name, value) {
        UserOptionsActions.setValue(name, value);
    }
});

module.exports = Component;
