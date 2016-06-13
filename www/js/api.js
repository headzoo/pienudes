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
        
        storage: {
            getItem: function(key, d) {
                d = d || null;
                var value = localStorage.getItem(key);
                if (value === null) {
                    value = d;
                } else {
                    value = JSON.parse(value);
                }
                
                return value;
            },
            
            setItem: function(key, value) {
                value = JSON.stringify(value);
                localStorage.setItem(key, value);
            }
        },
    
        /**
         * Registers a callback with the named event
         * 
         * @param event
         * @param callback
         */
        on: function(event, callback) {
            if (this._callbacks[event] == undefined) {
                this._callbacks[event] = [];
            }
            this._callbacks[event].push(callback);
        },
    
        /**
         * Sends a message to everyone else in the chat room
         * 
         * @param msg
         * @param meta
         * @returns {ChatAPI}
         */
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
    
        /**
         * Writes the given notice message to your chat buffer
         * 
         * @param msg
         * @param is_error
         */
        notice: function(msg, is_error) {
            is_error = is_error || false;
            
            var data = {
                msg: msg,
                time: Date.now(),
                is_error: is_error
            };
            
            addNotice(data);
        },
    
        /**
         * Displays a popup message in the corner of the page
         * 
         * @param msg
         * @param type
         * @param time_out
         */
        toast: function(msg, type, time_out) {
            toastr.options.preventDuplicates = true;
            toastr.options.closeButton = true;
            toastr.options.timeOut = (time_out || 1500);
            
            switch(type) {
                case "warning":
                    toastr.warning(msg);
                    break;
                case "error":
                    toastr.error(msg);
                    break;
                default:
                    toastr.success(msg);
                    break;
            }
        },
    
        /**
         * Adds a video to the playlist
         * 
         * @param url
         */
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
    
        /**
         * Removes videos from the playlist that have been queued by the given user
         * 
         * @param name
         */
        dequeueByName: function(name) {
            $(".queue_entry_by_" + name).each(function(i, item) {
                socket.emit("delete", $(item).data("pluid"));
            });
        },
    
        /**
         * Vote skips the currently playing video
         */
        skip: function() {
            $("#voteskip").trigger("click");
        },
    
        /**
         * Votes for the currently playing video
         * 
         * @param value
         */
        vote: function(value) {
            if (value != -1 && value != 1) {
                throw "Vote value invalid. Must -1, or 1.";
            }
            socket.emit("voteVideo", value);
        },
    
        /**
         * Clears the playlist
         */
        playlistClear: function() {
            socket.emit("clearPlaylist");
        },
    
        /**
         * Shuffles the playlist
         */
        playlistShuffle: function() {
            socket.emit("shufflePlaylist");
        },
    
        /**
         * Toggles the playlist lock
         */
        playlistLock: function() {
            socket.emit("togglePlaylistLock");
        },
    
        /**
         * Searches YouTube for videos matching the given query argument
         * 
         * @param query
         * @param type
         */
        search: function(query, type) {
            if (type != undefined && type != "yt") {
                throw "Type must be value 'yt'.";
            }
            socket.emit("searchMedia", {
                source: type,
                query: query
            });
        },
    
        /**
         * Clears the chat buffer
         */
        clear: function() {
            $("#messagebuffer").empty();
        },
    
        /**
         * Sets the chat text color
         * 
         * @param color
         */
        color: function(color) {
            $("#chatcolor").spectrum("set", color);
        },
    
        /**
         * Puts the named user on ignore
         * 
         * @param name
         */
        ignore: function(name) {
            if(IGNORED.indexOf(name) === -1) {
                IGNORED.push(name);
            }
        },
    
        /**
         * Takes the named user off ignore
         * 
         * @param name
         */
        unignore: function(name) {
            var index = IGNORED.indexOf(name);
            if (index !== -1) {
                IGNORED.splice(index, 1);
            }
        },
    
        /**
         * Kicks the named user from the chat room with the optional reason
         * 
         * @param name
         * @param reason
         */
        kick: function(name, reason) {
            socket.emit("chatMsg", {
                msg: "/kick " + name + " " + reason,
                meta: {}
            });
        },
    
        /**
         * Mutes the named user
         * 
         * @param name
         */
        mute: function(name) {
            socket.emit("chatMsg", {
                msg: "/mute " + name,
                meta: {}
            });
        },
    
        /**
         * Shadow mutes the named user
         * 
         * @param name
         */
        smute: function(name) {
            socket.emit("chatMsg", {
                msg: "/smute " + name,
                meta: {}
            });
        },
    
        /**
         * Unmutes the named user
         * 
         * @param name
         */
        unmute: function(name) {
            socket.emit("chatMsg", {
                msg: "/unmute " + name,
                meta: {}
            });
        },
    
        /**
         * Bans the named user by their username with an optional reason
         * 
         * @param name
         * @param reason
         */
        banByName: function(name, reason) {
            socket.emit("chatMsg", {
                msg: "/ban " + name + " " + reason,
                meta: {}
            });
        },
    
        /**
         * Bans the named user by their IP address with an optional reason
         * 
         * @param name
         * @param reason
         */
        banByIP: function(name, reason) {
            socket.emit("chatMsg", {
                msg: "/ipban " + name + " " + reason,
                meta: {}
            });
        },
    
        /**
         * Triggers the named event
         * 
         * @param name
         * @param data
         * @returns {ChatEvent}
         */
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
    
        /**
         * Loads external scripts
         * 
         * @param scripts
         * @param callback
         * @private
         */
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
    
        /**
         * Resets the api state
         * 
         * @private
         */
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
                emotes_personal: [],
                emotes_channel: [],
                afk: [],
                user_options_save: [],
                channel_option_save: [],
                search_results: [],
                color_change: []
            };
        },
    
        /**
         * 
         * @private
         */
        _pushLoaded: function() {
            this._load_count++;
            if (this._load_count == 4) {
                this.trigger("color_change", CHAT_LINE_COLOR);
                this.trigger("loaded", {});
            }
        }
    };
})();