var React    = require('react');
var ReactDOM = require('react-dom');

window.waitUntilDefined = function(obj, key, fn) {
    if(typeof obj[key] === "undefined") {
        setTimeout(function () {
            waitUntilDefined(obj, key, fn);
        }, 100);
        return;
    }
    fn();
};

var channel_wrap = document.getElementById("channel-mount");
if (channel_wrap !== null) {
    ReactDOM.render(
        React.createElement(
            require('./components/channel'),
            {
                join: channel_wrap.getAttribute("data-join")
            }
        ),
        channel_wrap
    );
}