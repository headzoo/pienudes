window.ChatAPI = {
    _callbacks: {
        receive: [],
        send: [],
        notice: [],
        user_join: [],
        user_leave: [],
        playlist: [],
        queue: [],
        media_change: [],
        media_update: [],
        favorites: [],
        favorite_add: [],
        tags: [],
        votes: [],
        emotes: []
    },
    
    "onReceive": function(callback) {
        this._callbacks.receive.push(callback);
        return this;
    },
    
    "onSend": function(callback) {
        this._callbacks.send.push(callback);
        return this;
    },
    
    "onNotice": function(callback) {
        this._callbacks.notice.push(callback);
        return this;
    },
    
    "onUserJoin": function(callback) {
        this._callbacks.user_join.push(callback);
        return this;
    },
    
    "onUserLeave": function(callback) {
        this._callbacks.user_leave.push(callback);
        return this;
    },
    
    "onPlaylist": function(callback) {
        this._callbacks.playlist.push(callback);
        return this;
    },
    
    "onQueue": function(callback) {
        this._callbacks.queue.push(callback);
        return this;
    },
    
    "onMediaChange": function(callback) {
        this._callbacks.media_change.push(callback);
        return this;
    },
    
    "onMediaUpdate": function(callback) {
        this._callbacks.media_update.push(callback);
        return this;
    },
    
    "onFavorites": function(callback) {
        this._callbacks.favorites.push(callback);
        return this;
    },
    
    "onFavoriteAdd": function(callback) {
        this._callbacks.favorite_add.push(callback);
        return this;
    },
    
    "onTags": function(callback) {
        this._callbacks.tags.push(callback);
        return this;
    },
    
    "onVotes": function(callback) {
        this._callbacks.votes.push(callback);
        return this;
    },
    
    "onEmotes": function(callback) {
        this._callbacks.emotes.push(callback);
        return this;
    },
    
    "send": function(msg, meta) {
        if (typeof msg != "string") {
            throw '$api.send#msg must be of type string.';
        }
        if (typeof meta == "undefined") {
            meta = {};
        } else if (typeof meta != "object") {
            throw '$api.send#meta must be of type object or undefined.';
        }
        
        if (!meta.color) {
            meta.color = CHAT_LINE_COLOR;
        }
        var data = this._send({
            msg: msg,
            meta: meta
        });
        if (typeof data == "object") {
            socket.emit("chatMsg", data);
        }
        
        return this;
    },
    
    "queue": function(url) {
        $("#mediaurl").val(url);
        queue("end", "src");
    },
    
    "voteSkip": function() {
        $("#voteskip").trigger("click");
    },
    
    "_applyCallback": function(index, data) {
        var callbacks = this._callbacks[index];
        for(var i = 0; i < callbacks.length; i++) {
            data = callbacks[i].call(this, data);
            if (typeof data != "object") {
                return null;
            }
        }
        
        return data;
    },
    
    "_receive": function(data) {
        return this._applyCallback("receive", data);
    },
    
    "_send": function(data) {
        return this._applyCallback("send", data);
    },
    
    "_notice": function(data) {
        return this._applyCallback("notice", data);
    },
    
    "_userJoin": function(data) {
        return this._applyCallback("user_join", data);
    },
    
    "_userLeave": function(data) {
        return this._applyCallback("user_leave", data);
    },
    
    "_playlist": function(data) {
        return this._applyCallback("playlist", data);
    },
    
    "_queue": function(data) {
        return this._applyCallback("queue", data);
    },
    
    "_mediaChange": function(data) {
        return this._applyCallback("media_change", data);
    },
    
    "_mediaUpdate": function(data) {
        return this._applyCallback("media_update", data);
    },
    
    "_favorites": function(data) {
        return this._applyCallback("favorites", data);
    },
    
    "_favoriteAdd": function(data) {
        return this._applyCallback("favorite_add", data);
    },
    
    "_tags": function(data) {
        return this._applyCallback("tags", data);
    },
    
    "_votes": function(data) {
        return this._applyCallback("votes", data);
    },
    
    "_emotes": function(data) {
        return this._applyCallback("emotes", data);
    },
    
    "_getScripts": function(scripts, callback) {
        var progress = 0;
        var internalCallback = function () {
            if (++progress == scripts.length) {
                callback();
            }
        };
    
        scripts.forEach(function(script) {
            $.getScript(script, internalCallback);
        });
    }
};