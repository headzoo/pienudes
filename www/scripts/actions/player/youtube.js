'use strict';

var Reflux = require('reflux');

var YouTubePlayerActions = Reflux.createActions({
    load: {children: ["done", "fail"]},
    play: {}
});

YouTubePlayerActions.load.listen(function() {
    if (window.YT !== undefined) {
        return this.done(window.YT);
    }
    
    $.getScript("https://www.youtube.com/iframe_api")
        .fail(this.fail)
        .done(function() {
            this.done(window.YT);
        }.bind(this));
});

module.exports = YouTubePlayerActions;