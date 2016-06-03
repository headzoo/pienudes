'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var ChanSettingsStore   = require('../../../../stores/chan_settings');
var ChanSettingsActions = require('../../../../actions/chan_settings');
var CheckBox            = require('../../../forms/checkbox');
var Input               = require('../../../forms/input');

var Component = React.createClass({
    mixins: [
        Reflux.connect(ChanSettingsStore, "settings")
    ],
    
    render: function () {
        var common = {
            prefix: "modal-settings-setting-",
            onChange: this.handleChange
        };
        
        return (
            <div role="tabpanel" className="tab-pane active" id="modal-settings-pane-general">
                <form className="form-horizontal">
                    <CheckBox name="allow_voteskip" checked={this.state.settings.allow_voteskip} {...common}>
                        Allow vote skip
                    </CheckBox>
                    <CheckBox name="allow_dupes" checked={this.state.settings.allow_dupes} {...common}>
                        Allow duplicate videos on the playlist
                    </CheckBox>
                    <Input name="voteskip_ratio" value={this.state.settings.voteskip_ratio} {...common}>
                        Vote skip ratio
                    </Input>
                    <Input name="maxlength" value={this.state.settings.maxlength} {...common}>
                        Max video length
                    </Input>
                    <Input name="rngmod_count" value={this.state.settings.rngmod_count} {...common}>
                        RNGmod count (0 - 10)
                    </Input>
                    <Input name="afk_timeout" value={this.state.settings.afk_timeout} {...common}>
                        Auto-AFK Delay
                    </Input>
                    <Input name="join_msg" value={this.state.settings.join_msg} {...common}>
                        Join Message
                    </Input>
    
                    <CheckBox name="enable_link_regex" checked={this.state.settings.enable_link_regex} {...common}>
                        Convert URLs in chat to links
                    </CheckBox>
                    <CheckBox name="chat_antiflood" checked={this.state.settings.chat_antiflood} {...common}>
                        Throttle chat
                    </CheckBox>
                    <Input name="chat_antiflood_burst" value={this.state.settings.chat_antiflood_burst} {...common}>
                        # of messages allowed before throttling
                    </Input>
                    <Input name="chat_antiflood_sustained" value={this.state.settings.chat_antiflood_sustained} {...common}>
                        # of messages (after burst) allowed per second
                    </Input>
                    
                    <div className="form-group">
                        <div className="col-sm-offset-4"></div>
                    </div>
                </form>
            </div>
        )
    },
    
    handleChange: function(name, value) {
        ChanSettingsActions.setValue(name, value);
    }
});

module.exports = Component;
