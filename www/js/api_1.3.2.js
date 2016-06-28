var ChatAPI         = null;
var ChatOptions     = null;
var ChatProxy       = null;
var ChatStore       = null;
var ChatTimer       = null;
var ChatStylesheet  = null;
var UserScript      = null;

/**
 * Iterates over an object or array
 *
 * @param obj
 * @param cb
 */
var $each = function(obj, cb) {
    if (Array.isArray(obj) || typeof obj == "string") {
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
        throw "Value must be object, array, or string.";
    }
};

(function() {
    'use strict';
    
    var API_VERSION        = "1.3.2";
    var USER_SCRIPTS_INIT  = false;
    var DATABASE_MAX_KEY   = 150;
    var DATABASE_MAX_VALUE = 5000;
    
    var noop = function() {};
    
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
    
    UserScript = function(name, reader) {
        this.name   = name;
        this.reader = reader;
    };
    
    UserScript.prototype.getName = function() {
        return this.name;
    };
    
    UserScript.prototype.setReader = function(reader) {
        this.reader = reader;
    };
    
    UserScript.prototype.getCode = function() {
        return this.reader();
    };
    
    ChatTimer = function() {
        this.timers = {};
    };
    
    ChatTimer.prototype.interval = function(name, time, callback) {
        this.clear(name);
        this.timers[name] = setInterval(callback, time);
        return this;
    };
    
    ChatTimer.prototype.once = function(name, time, callback) {
        this.clear(name);
        this.timers[name] = setTimeout(callback, time);
        return this;
    };
    
    ChatTimer.prototype.clear = function(name) {
        if (this.has(name)) {
            clearInterval(this.timers[name]);
            clearTimeout(this.timers[name]);
            delete this.timers[name];
        }
        return this;
    };
    
    ChatTimer.prototype.clearAll = function() {
        $each(this.timers, function(timer, name) {
            this.clear(name);
        }.bind(this));
        return this;
    };
    
    ChatTimer.prototype.has = function(name) {
        return this.timers[name] !== undefined;
    };
    
    ChatStylesheet = function(id) {
        this.id    = id;
        this.props = {};
        this.head  = $("head");
    };
    
    ChatStylesheet.prototype.add = function(selector, props) {
        if (this.props[selector] === undefined) {
            this.props[selector] = {};
        }
        this.props[selector] = $.extend({}, this.props[selector], props);
        return this;
    };
    
    ChatStylesheet.prototype.append = function() {
        this.remove();
        $(this.toString()).appendTo(this.head);
        return this;
    };
    
    ChatStylesheet.prototype.remove = function() {
        $("#" + this.id).remove();
        return this;
    };
    
    ChatStylesheet.prototype.toString = function() {
        var style = '<style id="' + this.id + '" type="text/css">' + "\n";
        $each(this.props, function(props, selector) {
            style += selector + " {\n";
            $each(props, function(value, key) {
                style += "\t" + key + ": " + value + ";\n";
            });
            style += "}\n";
        });
        style += '</style>';
        
        return style;
    };
    
    ChatStore = {
        cookies: {
            "get": function(name, default_value) {
                var eq = name + "=";
                var ca = document.cookie.split(";");
                
                for(var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == " ") {
                            c = c.substring(1,c.length);
                    }
                    if (c.indexOf(eq) == 0) {
                        return JSON.parse(c.substring(eq.length, c.length));
                    }
                }
                
                return default_value || null;
            },
            
            "set": function(name, value, days) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toUTCString();
                }
                
                value = JSON.stringify(value);
                document.cookie = name + "=" + value + expires + "; path=/";
            },
            
            "remove": function(name) {
                this.set(name, "", -1);
            }
        },
        
        /**
         * Provides access to local storage
         */
        local: {
            /**
             * Gets an item from local storage
             *
             * @param key
             * @param default_value
             */
            "get": function(key, default_value) {
                default_value = (default_value === undefined) ? null : default_value;
                
                var value = localStorage.getItem(key);
                if (value === null) {
                    value = default_value;
                } else {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        value = default_value;
                    }
                }
                
                return value;
            },
    
            /**
             * Stores an item in local storage
             *
             * @param key
             * @param value
             */
            "set": function(key, value) {
                localStorage.setItem(key, JSON.stringify(value));
            },
    
            /**
             * Removes an item from local storage
             *
             * @param key
             */
            "remove": function(key) {
                localStorage.removeItem(key);
            }
        },
    
        /**
         * Provides access to the site permanent key/value store.
         */
        database: {
            /**
             * Gets a value from the site database
             *
             * @param key
             * @param default_value
             * @param callback
             * @returns {*}
             */
            "get": function(key, default_value, callback) {
                callback = callback || noop;
                if (typeof default_value == "function") {
                    callback = default_value;
                    default_value = null;
                }
                
                return this._send("/api/database", "get", callback, {
                    key: key
                }, default_value);
            },
    
            /**
             * Stores a value in the site database
             *
             * @param key
             * @param value
             * @param callback
             * @returns {*}
             */
            "set": function(key, value, callback) {
                callback = callback || noop;
                
                return this._send("/api/database", "post", callback, {
                    key: key,
                    value: value
                });
            },
    
            /**
             * Removes a value from the site database
             *
             * @param key
             * @param callback
             * @returns {*}
             */
            "remove": function(key, callback) {
                callback = callback || noop;
                
                return this._send("/api/database", "delete", callback, {
                    key: key
                });
            },
    
            /**
             * Gets a list of stored keys
             *
             * @param prefix
             * @param callback
             */
            "keys": function(prefix, callback) {
                callback = callback || noop;
                if (typeof prefix == "function") {
                    callback = prefix;
                    prefix   = "";
                }
                
                return this._send("/api/database/keys", "get", callback, {
                    prefix: prefix
                });
            },
            
            "_send": function(url, type, callback, data, default_value) {
                var self = this;
    
                if (data.key !== undefined && data.key.length > DATABASE_MAX_KEY) {
                    return callback("Key exceeds max character length of " + DATABASE_MAX_KEY);
                }
                if (data.value !== undefined) {
                    data.value = JSON.stringify(data.value);
                    if (data.value.length > DATABASE_MAX_VALUE) {
                        return callback("JSON encoded value exceeds max character length of " + DATABASE_MAX_VALUE);
                    }
                }
                
                return $.ajax({
                    url: url,
                    type: type,
                    data: data
                }).done(function(res) {
                    callback(null, self._transformDone(res, default_value));
                }).fail(function() {
                    callback(self._transformError(xhr));
                });
            },
            
            "_transformDone": function(res, default_value) {
                default_value = default_value || null;
    
                try {
                    var value = JSON.parse(res);
                } catch (e) {
                    value = null;
                }
                if (value === null) {
                    value = default_value;
                }
                
                return value;
            },
            
            "_transformError": function(xhr) {
                try {
                    return JSON.parse(xhr.responseText);
                } catch (e) {}
                return xhr.responseText;
            }
        }
    };
    
    ChatAPI = {
        version: API_VERSION,
        _scripts: {},
        _scripts_changed: false,
        _callbacks: {},
        _ready_expected: 0,
        _ready_count: 0,
        _page_ready_expected: 3,
        _page_ready_count: 0,
        _imported: [],
    
        /**
         * Gets an item from local storage
         * 
         * @param key
         * @param d
         * @deprecated
         */
        getStorage: function(key, d) {
            return ChatStore.local.get(key, d);
        },
    
        /**
         * Stores an item in local storage
         * 
         * @param key
         * @param value
         * @deprecated
         */
        setStorage: function(key, value) {
            return ChatStore.local.set(key, value);
        },
    
        /**
         * Removes an item from local storage
         * 
         * @param key
         * @deprecated
         */
        removeStorage: function(key) {
            return ChatStore.local.remove(key);
        },
    
        /**
         * Gets a value from the site database
         * 
         * @param key
         * @param d
         * @param callback
         * @returns {*}
         * @deprecated
         */
        getDatabase: function(key, d, callback) {
            return ChatStore.database.get(key, d, callback);
        },
    
        /**
         * Stores a value in the site database
         * 
         * @param key
         * @param value
         * @param callback
         * @returns {*}
         * @deprecated
         */
        setDatabase: function(key, value, callback) {
            return ChatStore.database.set(key, value, callback);
        },
    
        /**
         * Removes a value from the site database
         * 
         * @param key
         * @param callback
         * @returns {*}
         * @deprecated
         */
        removeDatabase: function(key, callback) {
            ChatStore.database.remove(key, callback);
        },
    
        /**
         * Gets a list of stored keys
         * 
         * @param prefix
         * @param callback
         * @deprecated
         */
        keysDatabase: function(prefix, callback) {
            return ChatStore.keys(prefix, callback);
        },
    
        /**
         * Iterates over an object or array
         * 
         * @param obj
         * @param cb
         * @deprecated
         */
        each: function(obj, cb) {
            return $each(obj, cb);
        },
    
        /**
         * Registers a callback with the named event
         * 
         * @param event
         * @param callback
         */
        on: function(event, callback) {
            var events = event.split(' ');
            events = events.filter(function(e){return e});
            $each(events, function(e) {
                if (this._callbacks[e] == undefined) {
                    this._callbacks[e] = [];
                }
                this._callbacks[e].push(callback);
                if (e == "loaded" && this._isLoaded()) {
                    callback();
                }
            }.bind(this));
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
         * Sends a command to other bots
         * 
         * @param to
         * @param data
         */
        command: function(to, data) {
            socket.emit("chatCommand", {
                to: to,
                data: data
            });
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
    
            msg = jQuery(msg).text();
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
         * 
         * @returns {Array}
         */
        users: function() {
            var names = [];
            $(".userlist_item").each(function(i, item) {
                names.push($(item).data("name"));
            });
            return names;
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
            
            try {
                var callbacks = this._callbacks[name];
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].call(this, event, data);
                    if (event.isStopped()) {
                        break;
                    }
                }
            } catch (e) {
                console.log(e);
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
            if (scripts == -1) {
                $("#us-scripting")
                    .empty()
                    .append(
                        $('<div class="alert alert-warning" id="user-scripting-disabled" style="margin: 20px;">' +
                        'User scripting has been disabled on this account.' +
                        '</div>')
                    );
                return;
            }
            
            if (USER_SCRIPTS_INIT) {
                this.trigger("reloading");
            }
            
            if (scripts.length == 0) {
                this._initDefaultTab();
            } else {
                this._removeAttached();
                this._reset();
                this._ready_expected = scripts.length;
                for(var i = 0; i < scripts.length; i++) {
                    this._addUserScript(scripts[i]);
                }
            }
            
            USER_SCRIPTS_INIT = true;
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
            var name_low = data.name.replace(" ", "-").replace(".", "-").toLowerCase();
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
            textarea.on("change.chat_api", function() {
                this._scripts_changed = true;
            }.bind(this));
            this._scripts[name] = new UserScript(name, function() {
                return textarea.val();
            });
            if (name_low == "css" || name.substr(name.length - 4, 4) == ".css") {
                return this._attachStylesheet(name, name_low, script);
            }
            
            var imports = this._findImports(script);
            if (imports.length > 0) {
                this._importExternalScripts(imports, function() {
                    this._attachScript(name, name_low, script);
                }.bind(this));
            } else {
                this._attachScript(name, name_low, script);
            }
        },
    
        /**
         * Removes a user script
         * 
         * @param data
         * @private
         */
        _deleteUserScript: function(data) {
            this.trigger("delete_script", data.name);
            
            var name_low = data.name.replace(" ", "-").replace(".", "-").toLowerCase();
            $("#user-scripting-tab-" + name_low).remove();
            $("#user-script-pane-" + name_low).remove();
            $("#user-script-exec-" + name_low).remove();
            $("#user-scripting-tab-default").find("a:first").click();
            delete this._scripts[data.name];
            this._scripts_changed = true;
            ChatStore.local.remove("user_scripting_first_run_" + name_low);
        },
    
        /**
         * Appends the given script to the page
         * 
         * @param name
         * @param name_low
         * @param script
         * @private
         */
        _attachScript: function(name, name_low, script) {
            if (!SAFE_MODE) {
                var info = this._findAnnotations(script);
                info.filename = name;
                info.is_first_run = ChatStore.local.get("user_scripting_first_run_" + name_low, true);
                
                script = "" +
                    "" +
                        "(function($api, $options, $user, $channel, $proxy, $store, $timer, $stylesheet, $script) { \n" +
                            script +
                        "\nChatAPI._pushReady();" +
                        "\n})(ChatAPI, ChatOptions, CLIENT, CHANNEL, ChatProxy, ChatStore, new ChatTimer(), ChatStylesheet, " + JSON.stringify(info) + "); " +
                    "";
    
                $("<script/>").attr("type", "text/javascript")
                    .attr("id", "user-script-exec-" + name_low)
                    .text(script)
                    .appendTo($("body"));
                    
                if (info.is_first_run) {
                    ChatStore.local.set("user_scripting_first_run_" + name_low, false);
                }
            }
        },
    
        /**
         * Appends the given css to the page
         * 
         * @param name
         * @param name_low
         * @param css
         * @private
         */
        _attachStylesheet: function(name, name_low, css) {
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
            var name_low = name.replace(" ", "-").replace(".", "-").toLowerCase();
            
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
            textarea.on("change.chat_api", function() {
                this._scripts_changed = true;
            }.bind(this));
            tabOverride.set(textarea[0]);
            pane.append(textarea);
            
            anchor.find("span:first").on("click", function() {
                if (confirm("Are you sure you want to delete this script?")) {
                    socket.emit("deleteUserScript", {
                        name: name
                    });
                }
            });
            
            this._scripts[name] = new UserScript(name, function() {
                return textarea.val();
            });
            
            return {
                name: name,
                tab: tab,
                anchor: anchor,
                pane: pane,
                textarea: textarea
            };
        },
    
        /**
         * Initialize the default tab, which is already embedded in the page
         * 
         * @private
         */
        _initDefaultTab: function() {
            var textarea = $('.user-scripting-textarea[data-name="Default"]');
            textarea.data("name", "Default");
            textarea.on("change.chat_api", function() {
                this._scripts_changed = true;
            }.bind(this));
            tabOverride.set(textarea[0]);
            this._scripts[name] = new UserScript("Default", function() {
                return textarea.val();
            });
        },
    
        /**
         * Sends the user scripts to the server to be saved
         * 
         * @param toast
         * @private
         */
        _saveUserScripts: function(toast) {
            if (this._scripts_changed) {
                var obj = {
                    scripts: []
                };
                $each(this._scripts, function(script) {
                    obj.scripts.push({
                        name: script.getName(),
                        script: script.getCode()
                    });
                });
                if (this.trigger("save_scripts", obj).isCancelled()) {
                    return;
                }
                if (obj.scripts.length > 0) {
                    socket.emit("saveUserScripts", obj.scripts);
                }
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
         * Finds the annotations in the script header
         * 
         * @param script
         * @returns {{}}
         * @private
         */
        _findAnnotations: function(script) {
            var annotations = {};
            var pattern     = /\*\s+([\w]+):\s*(.*)/g;
            var matches     = pattern.exec(script);
            while(matches !== null) {
                annotations[matches[1]] = matches[2].trim();
                matches = pattern.exec(script);
            }
            
            return annotations;
        },
    
        /**
         * Loads external scripts
         * 
         * @param scripts
         * @param callback
         * @private
         */
        _importExternalScripts: function(scripts, callback) {
            var queue = scripts.map(function(script) {
                return $.getScript(script);
            });
            $.when.apply(null, queue).done(callback);
        },
    
        /**
         * Resets the api state
         * 
         * @private
         */
        _reset: function() {
            this._ready_expected = 0;
            this._ready_count = 0;
            this._scripts_changed = false;
            this._callbacks = {
                reloading: [],
                loaded: [],
                receive: [],
                attachment: [],
                send: [],
                notice: [],
                whisper: [],
                command: [],
                user_join: [],
                user_leave: [],
                user_count: [],
                blink: [],
                unblink: [],
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
                save_scripts: [],
                search_results: [],
                color_change: []
            };
        },
    
        /**
         * Returns whether all the scripts have been loaded
         *
         * @returns {boolean}
         */
        _isLoaded: function() {
            return (this._ready_count >= this._ready_expected)
                && (this._page_ready_count >= this._page_ready_expected);
        },
        
        _pushReady: function() {
            this._ready_count++;
            if (this._isLoaded()) {
                this.trigger("color_change", CHAT_LINE_COLOR);
                this.trigger("loaded", {});
            }
        },
        
        _pushPageReady: function() {
            this._page_ready_count++;
            if (this._isLoaded()) {
                this.trigger("color_change", CHAT_LINE_COLOR);
                this.trigger("loaded", {});
            }
        }
    };
    
    ChatOptions = {
        _root: null,
        _tabs: null,
        _panes: null,
    
        /**
         * 
         * @returns {null}
         */
        root: function() {
            if (!this._root) {
                this._root = $("#useroptions");
            }
            return this._root;
        },
    
        /**
         * 
         * @param [to_append]
         * @returns {null}
         */
        tabs: function(to_append) {
            if (!this._tabs) {
                this._tabs = $("#user-options-tabs");
            }
            if (to_append !== undefined) {
                this._tabs.append(to_append);
            }
            
            return this._tabs;
        },
    
        /**
         * 
         * @param [to_append]
         * @returns {null}
         */
        panes: function(to_append) {
            if (!this._panes) {
                this._panes = $("#user-options-panes");
            }
            if (to_append !== undefined) {
                this._panes.append(to_append);
            }
            
            return this._panes;
        },
    
        /**
         * 
         * @param tab_label
         * @param id_prefix
         * @param icon
         * @returns {ChatOptionsForm}
         */
        create: function(tab_label, id_prefix, icon) {
            return new ChatOptionsForm(tab_label, id_prefix, icon);
        },
    
        /**
         * 
         * @param label
         * @param tab_id
         * @param icon
         * @returns {*|jQuery|HTMLElement}
         */
        makeTab: function(label, tab_id, icon) {
            $("#" + tab_id).remove();

            var tab = $('<li/>', {
                "id": tab_id
            });
            this.tabs(tab);
            
            var html = label;
            if (icon) {
                html = '<span class="glyphicon glyphicon-' + icon + '"></span> ' + label;
            }
            
            tab.anchor = $('<a/>', {
                "data-toggle": "tab",
                "html": html
            });
            tab.append(tab.anchor);
            
            return tab;
        },
    
        /**
         * 
         * @param pane_id
         * @param tab
         * @returns {*|jQuery|HTMLElement}
         */
        makePane: function(pane_id, tab) {
            $("#" + pane_id).remove();
    
            tab.anchor.attr("href", "#" + pane_id);
            var pane = $('<div/>', {
                "id": pane_id,
                "class": "tab-pane"
            });
            this.panes(pane);
            
            pane.form = $('<form/>', {
                "class": "form-horizontal"
            });
            pane.append(pane.form);
            pane.appendToForm = function(element, value) {
                pane.form.append(element);
                if (value !== undefined && element.form_element !== undefined) {
                    if (element.form_element.is(":checkbox")) {
                        element.form_element.prop("checked", value);
                    } else {
                        element.form_element.val(value);
                    }
                }
                return element.form_element;
            };
            
            return pane;
        },
    
        /**
         * 
         * @param id
         * @param label
         * @param [help]
         * @returns {*|jQuery|HTMLElement}
         */
        makeCheckbox: function(id, label, help) {
            var group = $('<div/>', {
                "class": "form-group"
            });
            
            var column = $('<div/>', {
                "class": "col-sm-8 col-sm-offset-4"
            }).appendTo(group);
            
            var checkbox = $('<div/>', {
                "class": "checkbox"
            }).appendTo(column);
            
            var input_label = $('<label/>', {
                "for": id
            }).appendTo(checkbox);
            
            var input = $('<input/>', {
                "id": id,
                "type": "checkbox"
            }).appendTo(input_label);
            
            input_label.append(label);
            if (help) {
                this.makeHelp(help)
                    .appendTo(checkbox);
            }
            
            group.form_element = input;
            group.input = function() {
                return input;
            };
            
            return group;
        },
    
        /**
         * 
         * @param id
         * @param label
         * @param type
         * @param [help]
         * @returns {*|jQuery|HTMLElement}
         */
        makeInput: function(id, label, type, help) {
            type = type || "text";
    
            var group = $('<div/>', {
                "class": "form-group"
            });
            
            $('<label/>', {
                "class": "control-label col-sm-4",
                "for": id,
                "text": label
            }).appendTo(group);
            
            var column = $('<div/>', {
                "class": "col-sm-8"
            }).appendTo(group);
            
            var input = $('<input/>', {
                "id": id,
                "class": "form-control",
                "type": type
            }).appendTo(column);
    
            if (help) {
                this.makeHelp(help)
                    .appendTo(column);
            }
    
            group.form_element = input;
            group.input = function() {
                return input;
            };
            
            return group;
        },
    
        /**
         * 
         * @param id
         * @param label
         * @param help
         * @returns {*|jQuery|HTMLElement}
         */
        makeTextarea: function(id, label, help) {
            var group = $('<div/>', {
                "class": "form-group"
            });
    
            if (label) {
                $('<label/>', {
                    "class": "control-label col-sm-4",
                    "for": id,
                    "text": label
                }).appendTo(group);
            }
    
            var column = $('<div/>', {
                "class": (label ? "col-sm-8" : "col-sm-12")
            }).appendTo(group);
    
            var textarea = $('<textarea/>', {
                "id": id,
                "class": "form-control"
            }).appendTo(column);
    
            if (help) {
                this.makeHelp(help)
                    .appendTo(column);
            }
    
            group.form_element = textarea;
            group.input = function() {
                return textarea;
            };
    
            return group;
        },
    
        /**
         * 
         * @param id
         * @param label
         * @param options
         * @param help
         * @returns {*|jQuery|HTMLElement}
         */
        makeSelect: function(id, label, options, help) {
            help = help || "";
    
            var group = $('<div/>', {
                "class": "form-group"
            });
            
            $('<label/>', {
                "class": "control-label col-sm-4",
                "for": id,
                "text": label
            }).appendTo(group);
            
            var column = $('<div/>', {
                "class": "col-sm-8"
            }).appendTo(group);
            
            var select = $('<select/>', {
                "id": id,
                "class": "form-control"
            }).appendTo(column);
            
            $each(options, function(l, v) {
                var opt = $('<option/>', {
                    "value": v,
                    "text": l
                });
                select.append(opt);
            });
    
            if (help) {
                this.makeHelp(help)
                    .appendTo(column);
            }
            
            group.form_element = select;
            group.input = function() {
                return input;
            };
            
            return group;
        },
    
        /**
         * 
         * @param buttons
         * @param full_width
         * @returns {*|jQuery|HTMLElement}
         */
        makeButtonGroup: function(buttons, full_width) {
            var group = $('<div/>', {
                "class": "form-group"
            });
            
            var column = $('<div/>', {
                "class": (full_width ? "col-sm-12" : "col-sm-8 col-sm-offset-4")
            }).appendTo(group);
            
            var btns = [];
            $each(buttons, function(button) {
                var b = $('<button/>', {
                    "id": button.id,
                    "class": "btn btn-primary",
                    "type": "button",
                    "text": button.label
                }).appendTo(column);
                if (button.on !== undefined) {
                    $each(button.on, function (cb, event) {
                        b.on(event, cb);
                    });
                }
                btns.push(b);
            });
            
            group.input = function() {
                return btns;
            };
            return group;
        },
    
        /**
         * 
         * @param id
         * @param label
         * @returns {*|jQuery|HTMLElement}
         */
        makeButton: function(id, label) {
            var button = $('<button/>', {
                "id": id,
                "class": "btn btn-primary pull-right",
                "type": "button",
                "text": label
            });
            button.input = function() {
                return this;
            };
            
            return button;
        },
    
        /**
         * 
         * @param text
         * @returns {*|jQuery|HTMLElement}
         */
        makeHelp: function(text) {
            return $('<p/>', {
                "class": "text-muted text-help",
                "text": text
            });
        }
    };
    
    function ChatOptionsForm(tab_label, id_prefix, icon) {
        $("#" + id_prefix + "-tab").remove();
        $("#" + id_prefix + "-pane").remove();
        
        this.tab    = ChatOptions.makeTab(tab_label, id_prefix + "-tab", icon);
        this.pane   = ChatOptions.makePane(id_prefix + "-pane", this.tab);
        this.form   = this.pane.form;
        this.inputs = {};
        this.icon   = icon;
    }
    
    ChatOptionsForm.prototype.on = function() {
        this.form.on.apply(this.form, arguments);
        return this;
    };
    
    ChatOptionsForm.prototype.title = function(text, icon) {
        if (icon === undefined) {
            icon = this.icon;
        }
        if (icon !== undefined && icon !== null) {
            this.append('<h4><span class="glyphicon glyphicon-' + icon + '"></span> ' + text + '</h4>');
        } else {
            this.append('<h4>' + text + '</h4>');
        }
        
        return this;
    };
    
    ChatOptionsForm.prototype.add = function(type, id, opts) {
        if (opts === undefined) {
            opts = {};
        }
        if (opts.label === undefined) {
            opts.label = "";
        }
        if (opts.help === undefined) {
            opts.help = "";
        }
        
        var group;
        switch(type) {
            case "text":
                group = ChatOptions.makeInput(id, opts.label, "text", opts.help);
                break;
            case "checkbox":
                group = ChatOptions.makeCheckbox(id, opts.label, opts.help);
                break;
            case "textarea":
                group = ChatOptions.makeTextarea(id, opts.label, opts.help);
                break;
            case "select":
                group = ChatOptions.makeSelect(id, opts.label, opts.options, opts.help);
                break;
            case "button":
                group = ChatOptions.makeButton(id, opts.label);
                break;
            case "button-group":
                if (opts.full_width === undefined) {
                    opts.full_width = false;
                }
                group = ChatOptions.makeButtonGroup(id, opts.full_width);
                break;
        }
    
        this.inputs[id] = group.input();
        if (opts.attr !== undefined) {
            this.inputs[id].attr(opts.attr);
        }
        if (opts.val !== undefined) {
            this.inputs[id].val(opts.val);
        }
        if (opts.on !== undefined) {
            $each(opts.on, function(cb, event) {
                this.inputs[id].on(event, cb);
            }.bind(this));
        }
        
        this.append(group);
        return this.inputs[id];
    };
    
    ChatOptionsForm.prototype.append = function(element) {
        this.form.append(element);
    };
    
    ChatOptionsForm.prototype.remove = function() {
        this.pane.remove();
        this.tab.remove();
        return this;
    };
    
    ChatOptionsForm.prototype.input = function(id) {
        return this.inputs[id];
    };
    
    ChatOptionsForm.prototype.val = function(id, val) {
        if (val === undefined) {
            return this.input(id).val();
        } else {
            return this.input(id).val(val);
        }
    };
    
    ChatOptionsForm.prototype.clear = function(id) {
        return this.input(id).val("");
    };
    
    /**
     * Wrapper for jQuery ajax shorthand methods, which sends every request through
     * the site proxy.
     */
    ChatProxy = {
        "getJSON": function(url, data, success) {
            return $.getJSON(this._getProxyUrl(url), data, success);
        },
        
        "getScript": function(url, success) {
            return $.getScript(this._getProxyUrl(url), data, success);
        },
        
        "get": function(url, data, success, data_type) {
            return $.get(this._getProxyUrl(url), data, success, data_type);
        },
        
        "post": function(url, data, success, data_type) {
            return $.post(this._getProxyUrl(url), data, success, data_type);
        },
        
        _getProxyUrl: function(url) {
            return "/proxy?u=" + encodeURIComponent(url);
        }
    }
})();