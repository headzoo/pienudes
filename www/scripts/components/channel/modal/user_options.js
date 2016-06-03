'use strict';

var React              = require('react');
var Reflux             = require('reflux');
var Modal              = require('react-modal');
var UserOptionsStore   = require('../../../stores/user_options');
var UserOptionsActions = require('../../../actions/user_options');
var ClientStore        = require('../../../stores/client');
var PaneGeneral        = require('./user_options/general');
var PaneEmotes         = require('./user_options/emotes');
var PaneMod            = require('./user_options/mod');

var Component = React.createClass({
    mixins: [
        Reflux.connect(UserOptionsStore, "options"),
        Reflux.connect(ClientStore, "client")
    ],
    
    render: function () {
        var panes = [];
        var tabs  = [];
        panes.push(
            <PaneGeneral key="general" />
        );
        tabs.push(
            <li key="general" role="presentation" className="active">
                <a href="#modal-options-pane-general" aria-controls="modal-options-pane-general" role="tab" data-toggle="tab">General</a>
            </li>
        );
        if (this.state.client.logged_in) {
            panes.push(
                <PaneEmotes key="emotes" />
            );
            tabs.push(
                <li key="emotes" role="presentation">
                    <a href="#modal-options-pane-emotes" aria-controls="modal-options-pane-emotes" role="tab" data-toggle="tab">Emotes</a>
                </li>
            );
        }
        if (this.state.client.rank >= 2) {
            panes.push(
                <PaneMod key="mod" />
            );
            tabs.push(
                <li key="mod" role="presentation">
                    <a href="#modal-options-pane-mod" aria-controls="modal-options-pane-mod" role="tab" data-toggle="tab">Moderator</a>
                </li>
            );
        }
    
        return (
            <Modal className="Modal__Bootstrap modal-dialog modal-dialog-user-options" shouldCloseOnOverlayClick={true} onRequestClose={this.handleClose} isOpen={this.state.options.is_open}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <ul ref="tabs" className="nav nav-tabs">
                            {tabs}
                        </ul>
                    </div>
                    <div className="modal-body">
                        <div className="tab-content">
                            {panes}
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
    
    handleClose: function() {
        UserOptionsActions.hide();
    },
    
    handleSave: function() {
        UserOptionsActions.hide();
        UserOptionsActions.save();
    }
});

module.exports = Component;
