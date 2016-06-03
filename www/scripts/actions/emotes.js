'use strict';

var Reflux        = require('reflux');
var SocketActions = require('./socket');
var Events        = require('../events');

var EmotesActions = Reflux.createActions({
    load: {},
    show: {},
    hide: {},
    toggle: {},
    selected: {},
    uploadUser: {children: ["start"]},
    deleteUser: {children: ["done"]}
});

EmotesActions.uploadUser.listen(function(text, file, url) {
    this.start();
    if (url.length > 0) {
        SocketActions.emit(Events.USER_EMOTE_UPLOAD, {
            url: url,
            text: text
        });
    } else {
        file = file.files[0];
        var fr = new FileReader();
        fr.addEventListener("loadend", function () {
            SocketActions.emit(Events.USER_EMOTE_UPLOAD, {
                name: file.name,
                type: file.type,
                data: fr.result,
                text: text
            });
        });
        fr.readAsArrayBuffer(file);
    }
});

EmotesActions.deleteUser.listen(function(emote) {
    SocketActions.emit(Events.USER_EMOTE_REMOVE, emote);
    this.done(emote);
});

module.exports = EmotesActions;