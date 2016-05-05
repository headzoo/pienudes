"use strict";

var util = require("./utilities");

function Media(id, title, seconds, type, meta) {
    if (!meta) {
        meta = {};
    }

    this.id = id;
    this.setTitle(title);

    this.seconds = seconds === "--:--" ? 0 : parseInt(seconds);
    this.duration = util.formatTime(seconds);
    this.type = type;
    this.meta = meta;
    this.currentTime = 0;
    this.paused = false;
}

Media.prototype = {
    setTitle: function setTitle(title) {
        this.title = title;
        if (this.title.length > 100) {
            this.title = this.title.substring(0, 97) + "...";
        }
    },

    pack: function pack() {
        return {
            id: this.id,
            title: this.title,
            seconds: this.seconds,
            duration: this.duration,
            type: this.type,
            meta: {
                direct: this.meta.direct,
                restricted: this.meta.restricted,
                codec: this.meta.codec,
                bitrate: this.meta.bitrate,
                scuri: this.meta.scuri,
                embed: this.meta.embed,
                gdrive_subtitles: this.meta.gdrive_subtitles
            }
        };
    },

    getTimeUpdate: function getTimeUpdate() {
        return {
            currentTime: this.currentTime,
            paused: this.paused
        };
    },

    getFullUpdate: function getFullUpdate() {
        var packed = this.pack();
        packed.currentTime = this.currentTime;
        packed.paused = this.paused;
        return packed;
    },

    reset: function reset() {
        this.currentTime = 0;
        this.paused = false;
    }
};

module.exports = Media;
//# sourceMappingURL=media.js.map
