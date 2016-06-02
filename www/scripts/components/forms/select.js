'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            name: "",
            prefix: "",
            value: "",
            options: {},
            onChange: function() {}
        }
    },
    
    render: function () {
        var opts = [];
        for(var val in this.props.options) {
            if (this.props.options.hasOwnProperty(val)) {
                var label = this.props.options[val];
                opts.push(
                    <option key={val} value={val}>{label}</option>
                );
            }
        }
        
        return (
            <div className="form-group">
                <label className="control-label col-sm-4" htmlFor={this.props.prefix + this.props.name}>
                    {this.props.children}
                </label>
                <div className="col-sm-8">
                    <select id={this.props.prefix + this.props.name} className="form-control" defaultValue={this.props.value} onChange={this.handleChange}>
                        {opts}
                    </select>
                </div>
            </div>
        )
    },
    
    handleChange: function(e) {
        this.props.onChange(this.props.name, e.target.value);
    }
});

module.exports = Component;
