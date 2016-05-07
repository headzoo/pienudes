'use strict';

var Reflux = require('reflux');

var PlayerActions = Reflux.createActions({
    load: {children: ["done", "fail"]}
});

PlayerActions.load.listen(function() {
    $.getScript("/js/player.js")
        .done(this.done)
        .fail(this.fail);
});


module.exports = PlayerActions;