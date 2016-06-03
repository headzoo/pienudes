'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            emote: {},
            onDelete: function() {}
        }
    },
    
    render: function () {
        var emote = this.props.emote;
        
        return (
            <tr>
                <td>
                    <div className="btn-group">
                        <button className="btn btn-xs btn-danger" title="Delete" onClick={this.handleDeleteClick}>
                            <span className="glyphicon glyphicon-trash"></span>
                        </button>
                    </div>
                </td>
                <td>{emote.text}</td>
                <td>{emote.url}</td>
            </tr>
        )
    },
    
    handleDeleteClick: function() {
        this.props.onDelete(this.props.emote);
    }
});

module.exports = Component;
