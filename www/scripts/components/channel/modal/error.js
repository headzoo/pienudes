'use strict';

var React      = require('react');
var Reflux     = require('reflux');
var Modal      = require('react-modal');
var ErrorStore = require('../../../stores/error');

var Component = React.createClass({
    mixins: [
        Reflux.listenTo(ErrorStore, "onError")
    ],
    
    onError: function(msg) {
        this.setState({
            isOpen: true,
            message: msg
        });
    },
    
    getInitialState: function() {
        return {
            isOpen: false,
            message: ""
        };
    },
    
    render: function () {
    
        return (
            <Modal className="Modal__Bootstrap modal-dialog modal-dialog-error" onRequestClose={this.handleClose} isOpen={this.state.isOpen} shouldCloseOnOverlayClick={true}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={this.handleClose}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h4 className="modal-title">Error</h4>
                    </div>
                    <div className="modal-body">
                        {this.state.message}
                    </div>
                </div>
            </Modal>
        )
    },
    
    handleClose: function() {
        this.setState({isOpen: false});
    }
});

module.exports = Component;
