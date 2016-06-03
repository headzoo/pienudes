'use strict';

var React         = require('react');
var Reflux        = require('reflux');
var EmoteItem     = require('./emote_item');
var EmotesStore   = require('../../../../stores/emotes');
var EmotesActions = require('../../../../actions/emotes');

var Component = React.createClass({
    mixins: [
        Reflux.connect(EmotesStore, "emotes")
    ],
    
    render: function () {
        var items = [];
        this.state.emotes.user.map(function(emote, i) {
            items.push(<EmoteItem key={i} emote={emote} onDelete={this.handleDelete} />);
        }.bind(this));
        
        var upload_text = "Upload";
        if (this.state.emotes.is_uploading) {
            upload_text = (
                <img src="/img/spinner.gif" style={{width: "16px", height: "16px"}} />
            );
        }
        
        return (
            <div role="tabpanel" className="tab-pane" id="modal-options-pane-emotes">
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="cs-uploads-file">Emote text</label>
                        <div className="col-sm-8">
                            <input ref="text" type="text" className="form-control" maxLength="20" />
                            <p className="text-muted">
                                Text used to activate the emote. For example <code>:smile:</code> or <code>:face:</code>. 20 chars max.
                            </p>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="cs-uploads-file">Upload file</label>
                        <div className="col-sm-8">
                            <input ref="file" className="form-control" id="cs-uploads-file" type="file" accept="image/*" />
                            <p className="text-muted">
                                File types: jpg, gif, png. 500k max file size.
                            </p>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="cs-uploads-url">Or file URL</label>
                        <div className="col-sm-8">
                            <input ref="url" className="form-control" id="cs-uploads-url" type="text" maxLength="255" />
                            <p className="text-muted">
                                Instead of uploading a file, you can provide the URL of a image file on
                                the web. File types: jpg, gif, png. 500k max file size.
                            </p>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-8 col-sm-offset-4">
                            <button className="btn btn-primary" type="button" disabled={this.state.emotes.is_uploading} onClick={this.handleUpload}>{upload_text}</button>
                        </div>
                    </div>
                </form>
                <table className="table table-striped table-condensed">
                    <thead>
                        <tr>
                            <th>Delete</th>
                            <th>Text</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            </div>
        )
    },
    
    handleUpload: function() {
        var file = this.refs.file;
        var url  = this.refs.url.value.trim();
    
        if (url.length == 0 && (file.files == undefined || file.files.length == 0)) {
            alert("No file selected.");
            return;
        }
    
        var text = this.refs.text.value.trim();
        if (text.length == 0) {
            alert("Emote text cannot be empty.");
            return;
        }
        
        EmotesActions.uploadUser(text, file, url);
    },
    
    handleDelete: function(emote) {
        EmotesActions.deleteUser(emote);
    }
});

module.exports = Component;
