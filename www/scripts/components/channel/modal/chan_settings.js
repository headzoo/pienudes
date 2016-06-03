'use strict';

var React               = require('react');
var Reflux              = require('reflux');
var Modal               = require('react-modal');
var ChanSettingsStore   = require('../../../stores/chan_settings');
var ChanSettingsActions = require('../../../actions/chan_settings');
var PaneGeneral         = require('./chan_settings/general');
var PaneAdmin           = require('./chan_settings/admin');
var PaneFilters         = require('./chan_settings/filters');
var PaneBans            = require('./chan_settings/bans');
var PaneBio             = require('./chan_settings/bio');
var PaneCSS             = require('./chan_settings/css');
var PaneJS              = require('./chan_settings/js');
var PaneEmotes          = require('./chan_settings/emotes');
var PaneLogs            = require('./chan_settings/logs');
var PaneMOTD            = require('./chan_settings/motd');
var PanePerms           = require('./chan_settings/perms');
var PaneRanks           = require('./chan_settings/ranks');
var PaneUploads         = require('./chan_settings/uploads');

var Component = React.createClass({
    mixins: [
        Reflux.connect(ChanSettingsStore, "options")
    ],
    
    render: function () {
        return (
            <Modal className="Modal__Bootstrap modal-dialog modal-dialog-chan-settings" shouldCloseOnOverlayClick={true} onAfterOpen={this.handleOpen} onRequestClose={this.handleClose} isOpen={this.state.options.is_open}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <ul ref="tabs" className="nav nav-tabs">
                            <li className="active">
                                <a href="#modal-settings-pane-general" aria-controls="modal-settings-pane-general" role="tab" data-toggle="tab">General</a>
                            </li>
                            <li>
                                <a href="#modal-settings-pane-admin" aria-controls="modal-settings-pane-admin" role="tab" data-toggle="tab">Admin</a>
                            </li>
                            <li>
                                <a href="#modal-settings-pane-uploads" aria-controls="modal-settings-pane-uploads" role="tab" data-toggle="tab">Uploads</a>
                            </li>
                            <li className="dropdown">
                                <a id="cs-edit-dd-toggle" href="#" data-toggle="dropdown">Edit <span className="caret"></span></a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a href="#modal-settings-pane-filters" aria-controls="modal-settings-pane-filters" role="tab" data-toggle="tab">Chat Filters</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-emotes" aria-controls="modal-settings-pane-emotes" role="tab" data-toggle="tab">Emotes</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-bio" aria-controls="modal-settings-pane-bio" role="tab" data-toggle="tab">Biography</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-motd" aria-controls="modal-settings-pane-motd" role="tab" data-toggle="tab">MOTD</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-css" aria-controls="modal-settings-pane-css" role="tab" data-toggle="tab">CSS</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-js" aria-controls="modal-settings-pane-js" role="tab" data-toggle="tab">Javascript</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-perms" aria-controls="modal-settings-pane-perms" role="tab" data-toggle="tab">Permissions</a>
                                    </li>
                                    <li>
                                        <a href="#modal-settings-pane-ranks" aria-controls="modal-settings-pane-ranks" role="tab" data-toggle="tab">Moderators</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href="#modal-settings-pane-bans" aria-controls="modal-settings-pane-bans" role="tab" data-toggle="tab">Ban List</a>
                            </li>
                            <li>
                                <a href="#modal-settings-pane-logs" aria-controls="modal-settings-pane-logs" role="tab" data-toggle="tab">Log</a>
                            </li>
                        </ul>
                    </div>
                    <div className="modal-body">
                        <div className="tab-content">
                            <PaneGeneral />
                            <PaneAdmin />
                            <PaneBans />
                            <PaneBio />
                            <PaneCSS />
                            <PaneJS />
                            <PaneFilters />
                            <PaneEmotes />
                            <PaneLogs />
                            <PaneMOTD />
                            <PanePerms />
                            <PaneRanks />
                            <PaneUploads />
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
        ChanSettingsActions.tabShow("general");
        ChanSettingsActions.tabShown("general");
        
        var links = $(this.refs.tabs).find('a[data-toggle="tab"]');
        links.on("show.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-settings-pane-", "");
            ChanSettingsActions.tabShow(pane);
        });
        links.on("shown.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-settings-pane-", "");
            ChanSettingsActions.tabShown(pane);
        });
        links.on("hide.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-settings-pane-", "");
            ChanSettingsActions.tabHide(pane);
        });
        links.on("hidden.bs.tab", function(e) {
            var pane = e.target.getAttribute("href").replace("#modal-settings-pane-", "");
            ChanSettingsActions.tabHidden(pane);
        });
    },
    
    handleClose: function() {
        ChanSettingsActions.hide();
        
        var links = $(this.refs.tabs).find('a[data-toggle="tab"]');
        links.off("show.bs.tab");
        links.off("shown.bs.tab");
        links.off("hide.bs.tab");
        links.off("hidden.bs.tab");
    },
    
    handleSave: function() {
        ChanSettingsActions.save();
    }
});

module.exports = Component;
