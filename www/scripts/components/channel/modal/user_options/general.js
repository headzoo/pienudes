'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var UserOptionsStore   = require('../../../../stores/user_options');
var UserOptionsActions = require('../../../../actions/user_options');
var CheckBox           = require('../../../forms/checkbox');
var Select             = require('../../../forms/select');
var Input              = require('../../../forms/input');

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
            <div role="tabpanel" className="tab-pane active" id="modal-options-pane-general">
                <form className="form-horizontal">
                    <CheckBox name="show_colors" checked={this.state.options.show_colors} {...common}>
                        Show text colors
                    </CheckBox>
                    <CheckBox name="show_timestamps" checked={this.state.options.show_timestamps} {...common}>
                        Show timestamps
                    </CheckBox>
                    <CheckBox name="show_joins" checked={this.state.options.show_joins} {...common}>
                        Show join messages
                    </CheckBox>
                    <CheckBox name="sort_rank" checked={this.state.options.sort_rank} {...common}>
                        Sort users by rank
                    </CheckBox>
                    <CheckBox name="sort_afk" checked={this.state.options.sort_afk} {...common}>
                        Sort AFKers to bottom
                    </CheckBox>
                    <CheckBox name="ignore_channelcss" checked={this.state.options.ignore_channelcss} {...common}>
                        Ignore channel CSS
                    </CheckBox>
                    <CheckBox name="ignore_channeljs" checked={this.state.options.ignore_channeljs} {...common}>
                        Ignore channel javascript
                    </CheckBox>
                    <Select name="blink_title" value={this.state.options.blink_title} options={UserOptionsStore.notifications} {...common}>
                        Blink page title on new messages
                    </Select>
                    <Select name="boop" value={this.state.options.boop} options={UserOptionsStore.notifications} {...common}>
                        Notification sound on new messages
                    </Select>
                    <Select name="default_quality" options={UserOptionsStore.qualities} value={this.state.options.default_quality} {...common}>
                        Default video quality
                    </Select>
                    <Input name="sync_accuracy" value={this.state.options.sync_accuracy} {...common}>
                        Synchronization threshold (seconds)
                    </Input>
                    <CheckBox name="wmode_transparent" checked={this.state.options.wmode_transparent} {...common}>
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
