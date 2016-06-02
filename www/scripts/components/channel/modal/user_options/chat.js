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
        return (
            <div role="tabpanel" className="tab-pane active" id="modal-options-pane-chat">
                <form className="form-horizontal">
                    <CheckBox name="show_colors" prefix="modal-options-option-" checked={this.state.options.show_colors} onChange={this.handleCheckboxChange}>
                        Show colors
                    </CheckBox>
                    <CheckBox name="show_timestamps" prefix="modal-options-option-" checked={this.state.options.show_timestamps} onChange={this.handleCheckboxChange}>
                        Show timestamps
                    </CheckBox>
                    <CheckBox name="show_joins" prefix="modal-options-option-" checked={this.state.options.show_joins} onChange={this.handleCheckboxChange}>
                        Show join messages
                    </CheckBox>
                    <CheckBox name="sort_rank" prefix="modal-options-option-" checked={this.state.options.sort_rank} onChange={this.handleCheckboxChange}>
                        Sort users by rank
                    </CheckBox>
                    <CheckBox name="sort_afk" prefix="modal-options-option-" checked={this.state.options.sort_afk} onChange={this.handleCheckboxChange}>
                        Sort AFKers to bottom
                    </CheckBox>
                    <CheckBox name="ignore_channelcss" prefix="modal-options-option-" checked={this.state.options.ignore_channelcss} onChange={this.handleCheckboxChange}>
                        Ignore channel CSS
                    </CheckBox>
                    <CheckBox name="ignore_channeljs" prefix="modal-options-option-" checked={this.state.options.ignore_channeljs} onChange={this.handleCheckboxChange}>
                        Ignore channel javascript
                    </CheckBox>
                    
                    <div className="col-sm-4"></div>
                    <div className="col-sm-8">
                        <p className="text-info">
                            The following 2 options apply to how and when you will be notified if a new chat
                            message is received while upnext.fm is not the active window.
                        </p>
                    </div>
                    
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="modal-options-option-blink_title">
                            Blink page title on new messages
                        </label>
                        <div className="col-sm-8">
                            <select id="modal-options-option-blink_title" name="blink_title" className="form-control" defaultValue={this.state.options.blink_title} onChange={this.handleChange}>
                                <option value="never">Never</option>
                                <option value="onlyping">Only when I am mentioned or PMed</option>
                                <option value="always">Always</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="modal-options-option-boop">
                            Notification sound on new messages
                        </label>
                        <div className="col-sm-8">
                            <select id="modal-options-option-boop" name="boop" className="form-control" defaultValue={this.state.options.boop} onChange={this.handleChange}>
                                <option value="never">Never</option>
                                <option value="onlyping">Only when I am mentioned or PMed</option>
                                <option value="always">Always</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
        )
    },
    
    handleCheckboxChange: function(name, checked) {
        UserOptionsActions.setValue(name, checked);
    },
    
    handleChange: function(e) {
        UserOptionsActions.setValue(e.target.name, e.target.value);
    }
});

module.exports = Component;
