var ChatAPI = null;
var ChatOptions = null;

(function() {
    'use strict';
    
    var USER_SCRIPTS_INIT = false;
    
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
        _load_min: 4,
        _imported: [],
    
        /**
         * Gets an item from local storage
         * 
         * @param key
         * @param d
         */
        getStorage: function(key, d) {
            d = d || null;
            var value = localStorage.getItem(key);
            if (value === null) {
                value = d;
            } else {
                value = JSON.parse(value);
            }
        
            return value;
        },
    
        /**
         * Stores an item in local storage
         * 
         * @param key
         * @param value
         */
        setStorage: function(key, value) {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);
        },
    
        /**
         * Removes an item from local storage
         * 
         * @param key
         */
        removeStorage: function(key) {
            localStorage.removeItem(key);
        },
    
        /**
         * Iterates over an object or array
         * 
         * @param obj
         * @param cb
         */
        each: function(obj, cb) {
            if (Array.isArray(obj)) {
                for(var i = 0; i < obj.length; i++) {
                    if (cb(obj[i], i) === null) {
                        break;
                    }
                }
            } else if (typeof obj == "object") {
                for(var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (cb(obj[key], key) === null) {
                            break;
                        }
                    }
                }
            } else {
                throw "Value must be object or array.";
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
            if (event == "loaded" && this._load_count >= this._load_min) {
                this.trigger("loaded");
            }
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
         * Sets the user scripts to be appended to the page
         * 
         * @param scripts
         * @private
         */
        _setUserScripts: function(scripts) {
            if (USER_SCRIPTS_INIT) {
                this.trigger("reloading");
            }
    
            this._removeAttached();
            this._reset();
            for(var i = 0; i < scripts.length; i++) {
                this._addUserScript(scripts[i]);
            }
    
            USER_SCRIPTS_INIT = true;
            this._pushLoaded();
        },
    
        /**
         * Adds a script to be appended to the page
         * 
         * @param data
         * @private
         */
        _addUserScript: function(data) {
            var script   = data.script;
            var name     = data.name;
            var name_low = data.name.replace(" ", "-").toLowerCase();
            var tab      = $("#user-scripting-tab-" + name_low);
            var pane     = $("#user-script-pane-" + name_low);
            var textarea = pane.find("textarea:first");
            
            if (tab.length == 0) {
                var obj = this._createScriptingTab(data);
                tab      = obj.tab;
                pane     = obj.pane;
                textarea = obj.textarea;
            }
            
            textarea.val(script);
            textarea.data("name", name);
            
            if (script.length != 0) {
        
                if (name_low == "css") {
                    return this._attachStylesheet(name_low, script);
                }
                
                var imports = this._findImports(script);
                if (imports.length > 0) {
                    this._importExternalScripts(imports, function() {
                        this._attachScript(name_low, script);
                    }.bind(this));
                } else {
                    this._attachScript(name_low, script);
                }
            }
        },
    
        /**
         * Removes a user script
         * 
         * @param data
         * @private
         */
        _deleteUserScript: function(data) {
            var name_low = data.name.toLowerCase();
            $("#user-scripting-tab-" + name_low).remove();
            $("#user-script-pane-" + name_low).remove();
            $("#user-script-exec-" + name_low).remove();
            $("#user-scripting-tab-default").find("a:first").click();
        },
    
        /**
         * Appends the given script to the page
         * 
         * @param name_low
         * @param script
         * @private
         */
        _attachScript: function(name_low, script) {
            if (!SAFE_MODE) {
                script = "try { " +
                    "(function($api, $options, $user, $channel, $socket) { \n" + script + "\n})(ChatAPI, ChatOptions, CLIENT, CHANNEL, socket); " +
                    "} catch (e) { console.error(e); }";
    
                $("<script/>").attr("type", "text/javascript")
                    .attr("id", "user-script-exec-" + name_low)
                    .text(script)
                    .appendTo($("body"));
            }
        },
    
        /**
         * Appends the given css to the page
         * 
         * @param name_low
         * @param css
         * @private
         */
        _attachStylesheet: function(name_low, css) {
            if (!SAFE_MODE) {
                $("<style/>").attr("type", "text/css")
                    .attr("id", "user-script-exec-" + name_low)
                    .text(css)
                    .appendTo($("head"));
            }
        },
    
        /**
         * Removes all user scripts from the page
         * 
         * @private
         */
        _removeAttached: function() {
            $("script").each(function(i, el) {
                el = $(el);
                var id = el.attr("id");
                if (id != undefined && id.indexOf("user-script-exec") == 0) {
                    el.remove();
                }
            });
        },
    
        /**
         * Creates a new tab pane in the Options->Scripting dialog
         * 
         * @param data
         * @returns {{tab: (*|jQuery|HTMLElement), anchor: (*|jQuery|HTMLElement), pane: (*|jQuery|HTMLElement), textarea: (*|jQuery|HTMLElement)}}
         * @private
         */
        _createScriptingTab: function(data) {
            var name     = data.name;
            var name_low = name.replace(" ", "-").toLowerCase();
            
            var tabs = $("#user-scripting-tabs");
            var tab  = $('<li role="presentation"/>');
            tab.attr("id", "user-scripting-tab-" + name_low);
            tabs.append(tab);
            
            var anchor = $('<a role="tab" data-toggle="tab" class="user-script-tab-anchor"/>');
            anchor.attr("href", "#user-script-pane-" + name_low);
            anchor.attr("aria-controls", "user-script-pane-" + name_low);
            anchor.html(name + '<span aria-hidden="true" title="Delete Script">&times;</span>');
            tab.append(anchor);
            
            var pane = $('<div role="tabpanel" class="tab-pane"/>');
            pane.attr("id", "user-script-pane-" + name_low);
            $("#user-scripting-panes").append(pane);
            
            var textarea = $('<textarea class="form-control user-scripting-textarea" rows="20"/>');
            textarea.data("name", name);
            textarea.val(data.script);
            tabOverride.tabSize(4);
            tabOverride.autoIndent(true);
            tabOverride.set(textarea[0]);
            pane.append(textarea);
            
            anchor.find("span:first").on("click", function() {
                if (confirm("Are you sure you want to delete this script?")) {
                    socket.emit("deleteUserScript", {
                        name: name
                    });
                }
            });
            
            return {
                tab: tab,
                anchor: anchor,
                pane: pane,
                textarea: textarea
            };
        },
    
        /**
         * Sends the user scripts to the server to be saved
         * 
         * @param toast
         * @private
         */
        _saveUserScripts: function(toast) {
            var scripts = [];
            $(".user-scripting-textarea").each(function(i, textarea) {
                var target = $(textarea);
                scripts.push({
                    name: target.data("name"),
                    script: target.val()
                });
            });
            if (scripts.length > 0) {
                socket.emit("saveUserScripts", scripts);
            }
            if (toast) {
                toastr.options.preventDuplicates = true;
                toastr.options.closeButton = true;
                toastr.options.timeOut = 1500;
                toastr.success('Scripts saved!');
            }
        },
    
        /**
         * Finds import statements and returns an array of urls
         * 
         * @param script
         * @returns {Array}
         * @private
         */
        _findImports: function(script) {
            var imports = [];
            var pattern = /\*\s+Import:\s+(https?:\/\/(.*?)\.js)\b/gi;
            var match   = pattern.exec(script);
            while (match !== null) {
                var url = match[1].trim();
                if (url.length > 0 && this._imported.indexOf(url) == -1) {
                    imports.push(url);
                }
                match = pattern.exec(script);
            }
            
            return imports;
        },
    
        /**
         * Loads external scripts
         * 
         * @param scripts
         * @param callback
         * @private
         */
        _importExternalScripts: function(scripts, callback) {
            var progress = 0;
            var internalCallback = function () {
                if (++progress == scripts.length) {
                    callback();
                }
            };
        
            scripts.forEach(function(script) {
                this._imported.push(script);
                $.getScript(script, internalCallback);
            }.bind(this));
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
                whisper: [],
                user_join: [],
                user_leave: [],
                user_count: [],
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
            if (this._load_count >= this._load_min) {
                this.trigger("color_change", CHAT_LINE_COLOR);
                this.trigger("loaded", {});
            }
        }
    };
    
    ChatOptions = {
        _root: null,
        _tabs: null,
        _panes: null,
    
        root: function() {
            if (!this._root) {
                this._root = $("#useroptions");
            }
            return this._root;
        },
        
        tabs: function() {
            if (!this._tabs) {
                this._tabs = $("#user-options-tabs");
            }
            return this._tabs;
        },
        
        panes: function() {
            if (!this._panes) {
                this._panes = $("#user-options-panes");
            }
            return this._panes;
        },
        
        makeTab: function(label, tab_id) {
            $("#" + tab_id).remove();
            
            var tab = $('<li/>');
            tab.attr("id", tab_id);
            
            tab.anchor = $('<a/>');
            tab.anchor.attr("data-toggle", "tab");
            tab.anchor.text(label);
            tab.append(tab.anchor);
            
            return tab;
        },
        
        makePane: function(pane_id, tab) {
            $("#" + pane_id).remove();
            
            var pane = $('<div/>');
            pane.addClass("tab-pane");
            pane.attr("id", pane_id);
            tab.anchor.attr("href", "#" + pane_id);
    
            pane.form = $('<form/>');
            pane.form.addClass("form-horizontal");
            pane.append(pane.form);
            
            return pane;
        },
        
        makeCheckbox: function(id, label) {
            return $(
                '<div class="form-group">' +
                    '<div class="col-sm-8 col-sm-offset-4">' +
                        '<div class="checkbox">' +
                            '<label for="' + id + '">' +
                                '<input type="checkbox" id="' + id + '" />' +
                                label +
                            '</label>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        },
        
        makeInput: function(id, label, type) {
            type = type || "text";
            
            return $(
                '<div class="form-group">' +
                    '<label class="control-label col-sm-4 for="' + id + '">' +
                        label +
                    '</label>' +
                    '<div class="col-sm-8">' +
                        '<input type="' + type + '" class="form-control" id="' + id + '"/>' +
                    '</div>' +
                '</div>'
            );
        }
    };
})();