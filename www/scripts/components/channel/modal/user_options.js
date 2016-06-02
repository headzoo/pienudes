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
            <Modal className="Modal__Bootstrap modal-dialog modal-dialog-user-options" shouldCloseOnOverlayClick={true} onAfterOpen={this.handleOpen} onRequestClose={this.handleClose} isOpen={this.state.options.is_open}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <ul ref="tabs" className="nav nav-tabs">
                            <li role="presentation" className="active">
                                <a href="#modal-options-pane-chat" aria-controls="modal-options-pane-chat" role="tab" data-toggle="tab">Chat</a>
                            </li>
                            <li role="presentation">
                                <a href="#modal-options-pane-playback" aria-controls="modal-options-pane-playback" role="tab" data-toggle="tab">Playback</a>
                            </li>
                            <li role="presentation">
                                <a href="#modal-options-pane-emotes" aria-controls="modal-options-pane-emotes" role="tab" data-toggle="tab">Emotes</a>
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
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.handleClose}>Close</button>
                        <button type="button" className="btn btn-primary" onClick={this.handleSave}>Save</button>
                    </div>
                </div>
            </Modal>
        )
    },
    
    handleOpen: function() {
        UserOptionsActions.tabShow("chat");
        UserOptionsActions.tabShown("chat");
        
        var links = $(this.refs.tabs).find('a[data-toggle="tab"]');
        links.on("show.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-options-pane-", "");
            UserOptionsActions.tabShow(pane);
        });
        links.on("shown.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-options-pane-", "");
            UserOptionsActions.tabShown(pane);
        });
        links.on("hide.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-options-pane-", "");
            UserOptionsActions.tabHide(pane);
        });
        links.on("hidden.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-options-pane-", "");
            UserOptionsActions.tabHidden(pane);
        });
    },
    
    handleClose: function() {
        UserOptionsActions.hide();
    
        var links = $(this.refs.tabs).find('a[data-toggle="tab"]');
        links.off("show.bs.tab");
        links.off("shown.bs.tab");
        links.off("hide.bs.tab");
        links.off("hidden.bs.tab");
    },
    
    handleSave: function() {
        this.handleClose();
        UserOptionsActions.save();
    }
});

module.exports = Component;
