'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var Modal              = require('react-modal');
var UserOptionsStore   = require('../../../stores/user_options');
var UserOptionsActions = require('../../../actions/user_options');
var PaneChat           = require('./user_options/chat');
var PanePlayback       = require('./user_options/playback');
var PaneEmotes         = require('./user_options/emotes');
var PaneMod            = require('./user_options/mod');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UserOptionsStore, "options")
    ],
    
    render: function () {
        return (
            <Modal className="Modal__Bootstrap modal-dialog" onRequestClose={this.handleClose} isOpen={this.state.options.is_open} shouldCloseOnOverlayClick={true}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <ul className="nav nav-tabs">
                            <li role="presentation" className="active">
                                <a href="#modal-options-pane-chat" aria-controls="modal-options-pane-chat" role="tab" data-toggle="tab">Chat</a>
                            </li>
                            <li role="presentation">
                                <a href="#modal-options-pane-playback" aria-controls="modal-options-pane-playback" role="tab" data-toggle="tab">Playback</a>
                            </li>
                            <li role="presentation">
                                <a href="#modal-options-pane-user-emotes" aria-controls="modal-options-pane-emotes" role="tab" data-toggle="tab">Emotes</a>
                            </li>
                            <li role="presentation">
                                <a href="#modal-options-pane-mod" aria-controls="modal-options-pane-mod" role="tab" data-toggle="tab">Moderator</a>
                            </li>
                        </ul>
                    </div>
                    <div className="modal-body">
                        <div className="tab-content">
                            <PaneChat />
                            <PanePlayback />
                            <PaneEmotes />
                            <PaneMod />
                        </div>
                    </div>
                </div>
            </Modal>
        )
    },
    
    handleClose: function() {
        UserOptionsActions.hide();
    }
});

module.exports = Component;
