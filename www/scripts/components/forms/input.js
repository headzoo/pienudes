'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            name: "",
            prefix: "",
            value: "",
            placeholder: "",
            onChange: function() {}
        }
    },
    
    render: function () {
        return (
            <div className="form-group">
                <label className="control-label col-sm-4" htmlFor="{{ id }}">{this.props.children}</label>
                <div className="col-sm-8">
                    <input className="form-control" id={this.props.prefix + this.props.name} type="text" defaultValue={this.props.value} placeholder={this.props.placeholder} onChange={this.handleChange} />
                </div>
            </div>
        )
    },
    
    handleChange: function(e) {
        this.props.onChange(this.props.name, e.target.value);
    }
});

module.exports = Component;
