'use strict';

var React  = require('react');
var Reflux = require('reflux');

var Component = React.createClass({
    render: function () {
        return (
            <div id="channel-video-controls">
                <div id="videovotes" className="btn-group chatbuttons">
                    <button id="voteup" className="btn btn-sm btn-default active" title="Upvote">
                        <span className="glyphicon glyphicon-chevron-up"></span> <span id="voteupvalue">5</span>
                    </button>
                    <button id="showuservotes" className="btn btn-sm btn-default collapsed" title="Your upvoted videos" data-toggle="collapse" data-target="#uservotes" aria-expanded="false">
                        <span className="glyphicon glyphicon-fire"></span>
                    </button>
                    <button id="votedown" className="btn btn-sm btn-default" title="Downvote">
                        <span className="glyphicon glyphicon-chevron-down"></span> <span id="votedownvalue">0</span>
                    </button>
                </div>
            </div>
        )
    }
});

module.exports = Component;
