'use strict';

var Reflux = require('reflux');

var ChannelActions = Reflux.createActions({
    setCSS: {},
    setJS: {}
});

ChannelActions.setCSS.listen(function(css) {
    $("#channel-css").remove();
    if (css != undefined && css.length > 0) {
        $("<style/>").attr("type", "text/css")
            .attr("id", "channel-css")
            .text(css)
            .appendTo($("head"));
    }
});

ChannelActions.setJS.listen(function(js) {
    $("#channel-js").remove();
    if (js != undefined && js.length > 0) {
        $("<script/>").attr("type", "text/javascript")
            .attr("id", "channel-js")
            .text(js)
            .appendTo($("body"));
    }
});

module.exports = ChannelActions;