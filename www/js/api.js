var ChatAPI = null;

(function() {
    'use strict';
    
    /**
     * @constructor
     */
    function ChatEvent(name) {
        this.name      = name;
        this.stopped   = false;
        this.cancelled = false;
    }
    
    ChatEvent.prototype.stop = function() {
        this.stopped = true;
    };
    
    ChatEvent.prototype.isStopped = function() {
        return this.stopped;
    };
    
    ChatEvent.prototype.cancel = function() {
        this.cancelled = true;
    };
    
    ChatEvent.prototype.isCancelled = function() {
        return this.cancelled;
    };
    
    ChatAPI = {
        _callbacks: {},
        _load_count: 0,
        
        on: function(event, callback) {
            if (this._callbacks[event] == undefined) {
                this._callbacks[event] = [];
            }
            this._callbacks[event].push(callback);
        },
        
        send: function(msg, meta) {
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
            var payload = {
                msg: msg,
                meta: meta
            };
            if (!this.trigger("send", payload).isCancelled()) {
                socket.emit("chatMsg", payload);
            }
            
            return this;
        },
        
        queue: function(url) {
            if (typeof url == "object" && url.uid != undefined) {
                socket.emit("queue", {
                    id: url.uid,
                    title: url.title,
                    pos: "end",
                    type: url.type,
                    temp: $(".add-temp").prop("checked")
                });
            } else {
                $("#mediaurl").val(url);
                queue("end", "src");
            }
        },
        
        skip: function() {
            $("#voteskip").trigger("click");
        },
        
        vote: function(value) {
            if (value != -1 && value != 1) {
                throw "Vote value invalid. Must -1, or 1.";
            }
            socket.emit("voteVideo", value);
        },
    
        playlistClear: function() {
            socket.emit("clearPlaylist");
        },
        
        playlistShuffle: function() {
            socket.emit("shufflePlaylist");
        },
        
        search: function(query, type) {
            if (type != undefined && type != "yt") {
                throw "Type must be value 'yt'.";
            }
            socket.emit("searchMedia", {
                source: type,
                query: query
            });
        },
        
        clear: function() {
            $("#messagebuffer").empty();
        },
        
        trigger: function(name, data) {
            var event = new ChatEvent(name);
            if (this._callbacks[name] == undefined || this._callbacks[name].length == 0) {
                return event;
            }
            
            var callbacks = this._callbacks[name];
            for(var i = 0; i < callbacks.length; i++) {
                callbacks[i].call(this, event, data);
                if (event.isStopped()) {
                    break;
                }
            }
            
            return event;
        },
        
        _getScripts: function(scripts, callback) {
            var progress = 0;
            var internalCallback = function () {
                if (++progress == scripts.length) {
                    callback();
                }
            };
        
            scripts.forEach(function(script) {
                $.getScript(script, internalCallback);
            });
        },
        
        _reset: function() {
            this._callbacks = {
                reloading: [],
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
                vote_value: [],
                emotes: [],
                afk: [],
                user_options_save: [],
                channel_option_save: [],
                search_results: []
            };
        },
    
        _pushLoaded: function() {
            this._load_count++;
            if (this._load_count == 3) {
                this.trigger("loaded", {});
            }
        }
    };
})();