'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    getDefaultProps: function() {
        return {
            name: "",
            prefix: "",
            checked: false,
            onChange: function() {}
        }
    },
    
    render: function() {
        return (
            <div className="form-group">
                <div className="col-sm-8 col-sm-offset-4">
                    <div className="checkbox">
                        <label htmlFor={this.props.prefix + this.props.name}>
                            <input type="checkbox" id={this.props.prefix + this.props.name} defaultChecked={this.props.checked} onClick={this.handleClick} />
                            {this.props.children}
                        </label>
                    </div>
                </div>
            </div>
        )
    },
    
    handleClick: function(e) {
        this.props.onChange(this.props.name, e.target.checked);
    }
});

module.exports = Component;
