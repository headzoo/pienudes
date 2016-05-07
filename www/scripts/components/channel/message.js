'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({

    getDefaultProps: function() {
        return {
            data: {}
        }
    },
    
    render: function () {
        var data = this.props.data;
        var style = {
            color: data.meta.color
        };
        
        return (
            <div>
                <strong className="username">{data.username}: </strong>
                <span style={style} dangerouslySetInnerHTML={{__html: data.msg}}></span>
            </div>
        )
    }
});

module.exports = Component;
