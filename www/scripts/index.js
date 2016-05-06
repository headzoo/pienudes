var React    = require('react');
var ReactDOM = require('react-dom');

var channel_wrap = document.getElementById("channel-mount");
if (channel_wrap !== null) {
    ReactDOM.render(
        React.createElement(require('./components/channel')),
        channel_wrap
    );
}