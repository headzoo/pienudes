var Logger = require("../logger");
var ChannelModule = require("./module");
var Server = require("../server");
var Flags = require("../flags");
var XSS = require("../xss");
var Account = require("../account");
var Config = require("../config");
var request = require('request');
var async = require('async');
var util = require("../utilities");
var urlParser  = require("url");
var fs = require("graceful-fs");
var path = require("path");
var sio = require("socket.io");
var io = require('socket.io-client');
var db = require("../database");
var db_users = require('../database/accounts');
var db_alts  = require('../database/alts');
var db_user_scripts = require('../database/user_scripts');
import * as ChannelStore from '../channel-storage/channelstore';
import { ChannelStateSizeError } from '../errors';
import Promise from 'bluebird';
import { EventEmitter } from 'events';
import Redis from '../redis';

var alt_ids = [];

class ReferenceCounter {
    constructor(channel) {
        this.channel = channel;
        this.channelName = channel.name;
        this.refCount = 0;
        this.references = {};
        this.alts = [];
    }

    ref(caller) {
        if (caller) {
            if (this.references.hasOwnProperty(caller)) {
                this.references[caller]++;
            } else {
                this.references[caller] = 1;
            }
        }

        this.refCount++;
    }

    unref(caller) {
        if (caller) {
            if (this.references.hasOwnProperty(caller)) {
                this.references[caller]--;
                if (this.references[caller] === 0) {
                    delete this.references[caller];
                }
            } else {
                Logger.errlog.log("ReferenceCounter::unref() called by caller [" +
                        caller + "] but this caller had no active references! " +
                        `(channel: ${this.channelName})`);
            }
        }

        this.refCount--;
        this.checkRefCount();
    }

    checkRefCount() {
        if (this.refCount === 0) {
            if (Object.keys(this.references).length > 0) {
                Logger.errlog.log("ReferenceCounter::refCount reached 0 but still had " +
                        "active references: " +
                        JSON.stringify(Object.keys(this.references)) +
                        ` (channel: ${this.channelName})`);
                for (var caller in this.references) {
                    this.refCount += this.references[caller];
                }
            } else if (this.channel.users.length > 0) {
                Logger.errlog.log("ReferenceCounter::refCount reached 0 but still had " +
                        this.channel.users.length + " active users" +
                        ` (channel: ${this.channelName})`);
                this.refCount = this.channel.users.length;
            } else {
                this.channel.emit("empty");
            }
        }
    }
}

function Channel(name) {
    this.name = name;
    this.uniqueName = name.toLowerCase();
    this.modules = {};
    this.logger = new Logger.Logger(path.join(__dirname, "..", "..", "chanlogs",
                                              this.uniqueName + ".log"));
    this.users = [];
    this.refCounter = new ReferenceCounter(this);
    this.flags = 0;
    this.redis = null;
    this.msg_id = 0;
    var self = this;
    db.channels.load(this, function (err) {
        if (err && err !== "Channel is not registered") {
            return;
        } else {
            Redis.createClient(Config.get("redis.databases").alts, function(err, client) {
                if (err) return;
                self.redis = client;
                self.initModules();
                self.loadState();
                self.loadAlts(); 
            });
        }
    });
}

Channel.prototype = Object.create(EventEmitter.prototype);

Channel.prototype.is = function (flag) {
    return Boolean(this.flags & flag);
};

Channel.prototype.setFlag = function (flag) {
    this.flags |= flag;
    this.emit("setFlag", flag);
};

Channel.prototype.clearFlag = function (flag) {
    this.flags &= ~flag;
    this.emit("clearFlag", flag);
};

Channel.prototype.waitFlag = function (flag, cb) {
    var self = this;
    if (self.is(flag)) {
        cb();
    } else {
        var wait = function (f) {
            if (f === flag) {
                self.removeListener("setFlag", wait);
                cb();
            }
        };
        self.on("setFlag", wait);
    }
};

Channel.prototype.getMsgID = function() {
    var id = this.msg_id;
    this.msg_id++;
    if (this.msg_id > Number.MAX_VALUE) {
        this.msg_id = 1;
    }
    
    return id;
};

Channel.prototype.moderators = function () {
    return this.users.filter(function (u) {
        return u.account.effectiveRank >= 2;
    });
};

Channel.prototype.initModules = function () {
    const modules = {
        "./permissions"   : "permissions",
        "./emotes"        : "emotes",
        "./uploads"       : "uploads",
        "./chat"          : "chat",
        "./filters"       : "filters",
        "./customization" : "customization",
        "./opts"          : "options",
        "./library"       : "library",
        "./playlist"      : "playlist",
        "./mediarefresher": "mediarefresher",
        "./voteskip"      : "voteskip",
        "./poll"          : "poll",
        "./kickban"       : "kickban",
        "./ranks"         : "rank",
        "./accesscontrol" : "password"
    };

    var self = this;
    var inited = [];
    Object.keys(modules).forEach(function (m) {
        var ctor = require(m);
        var module = new ctor(self);
        self.modules[modules[m]] = module;
        inited.push(modules[m]);
    });

    self.logger.log("[init] Loaded modules: " + inited.join(", "));
};

Channel.prototype.getDiskSize = function (cb) {
    if (this._getDiskSizeTimeout > Date.now()) {
        return cb(null, this._cachedDiskSize);
    }

    var self = this;
    var file = path.join(__dirname, "..", "..", "chandump", self.uniqueName);
    fs.stat(file, function (err, stats) {
        if (err) {
            return cb(err);
        }

        self._cachedDiskSize = stats.size;
        cb(null, self._cachedDiskSize);
    });
};

Channel.prototype.loadState = function () {
    /* Don't load from disk if not registered */
    if (!this.is(Flags.C_REGISTERED)) {
        this.modules.permissions.loadUnregistered();
        this.setFlag(Flags.C_READY);
        return;
    }

    const self = this;
    function errorLoad(msg) {
        if (self.modules.customization) {
            self.modules.customization.load({
                motd: msg
            });
        }

        self.setFlag(Flags.C_READY | Flags.C_ERROR);
    }

    ChannelStore.load(this.uniqueName).then(data => {
        Object.keys(this.modules).forEach(m => {
            try {
                this.modules[m].load(data);
            } catch (e) {
                Logger.errlog.log("Failed to load module " + m + " for channel " +
                        this.uniqueName);
            }
        });

        this.setFlag(Flags.C_READY);
    }).catch(ChannelStateSizeError, err => {
        const message = "This channel's state size has exceeded the memory limit " +
                "enforced by this server.  Please contact an administrator " +
                "for assistance.";

        Logger.errlog.log(err.stack);
        errorLoad(message);
    }).catch(err => {
        if (err.code === 'ENOENT') {
            Object.keys(this.modules).forEach(m => {
                this.modules[m].load({});
            });
            this.setFlag(Flags.C_READY);
            return;
        } else {
            const message = "An error occurred when loading this channel's data from " +
                    "disk.  Please contact an administrator for assistance.  " +
                    `The error was: ${err}`;

            Logger.errlog.log(err.stack);
            errorLoad(message);
        }
    });
};

Channel.prototype.sendUserScripts = function(user, cb) {
    cb = cb || function() {};
    if (!user.account.id || !this.modules.permissions.canUserScripting(user)) {
        return cb();
    }
    
    db_user_scripts.findByUser(user.account.id, function(err, rows) {
        if (!err && rows) {
            var scripts = [];
            rows.forEach(function(row) {
                scripts.push({
                    name: row.name,
                    script: row.script
                });
            });
            
            var sent_to = [user.channel.name];
            user.socket.emit("setUserScripts", scripts);
            Server.getServer().getUserAll(user.account.name).forEach(function(u) {
                if (sent_to.indexOf(u.channel.name) == -1) {
                    u.socket.emit("setUserScripts", scripts);
                    sent_to.push(u.channel.name);
                }
            });
        }
        cb();
    });
};

Channel.prototype.handleSaveUserScripts = function(user, data) {
    if (!user.account.id || !this.modules.permissions.canUserScripting(user)) {
        return;
    }
    
    async.map(data,
        function(d, c) {
            db_user_scripts.insertOrUpdate(user.account.id, d.name, d.script, c)
        },
        function() {
            var sent_to = [user.channel.name];
            user.socket.emit("setUserScripts", data);
            Server.getServer().getUserAll(user.account.name).forEach(function(u) {
                if (sent_to.indexOf(u.channel.name) == -1) {
                    u.socket.emit("setUserScripts", data);
                    sent_to.push(u.channel.name);
                }
            });
        }
    );
};

Channel.prototype.installUserScript = function(user, data) {
    if (!user.account.id || !this.modules.permissions.canUserScripting(user)) {
        return;
    }
    
    var parsed = urlParser.parse(data.url);
    if (!parsed) {
        return user.socket.emit("errorMsg", {
            msg: "Invalid script URL."
        });
    }
    if (parsed.protocol !== "https:" || parsed.hostname !== "scripts.upnext.fm") {
        return user.socket.emit("errorMsg", {
            msg: "Invalid script protocol or hostname."
        });
    }
    if (parsed.path.match(/^\/([^\s.\/]+).(js|css)$/i) === null) {
        return user.socket.emit("errorMsg", {
            msg: "Invalid script."
        });
    }
    
    request(data.url, function(err, res, body) {
        if (!err && res.statusCode == 200 && body.length > 0) {
            db_user_scripts.insertOrUpdate(user.account.id, data.name, body, function(err, res) {
                if (err) {
                    return user.socket.emit("errorMsg", {
                        msg: "Failed to install script. Try again in a minute."
                    });
                }
        
                user.socket.emit("installedUserScript", data);
                this.sendUserScripts(user);
            }.bind(this));
        } else {
            return user.socket.emit("errorMsg", {
                msg: "Unable to download and install script. Try again in a minute."
            });
        }
    }.bind(this));
};

Channel.prototype.handleDeleteUserScript = function(user, data) {
    if (!user.account.id || !this.modules.permissions.canUserScripting(user)) {
        return;
    }
    
    db_user_scripts.removeByUserAndName(user.account.id, data.name, function(err) {
        if (!err) {
            Server.getServer().getUserAll(user.account.name).forEach(function(u) {
                u.socket.emit("deleteUserScript", {
                    name: data.name
                });
            });
            setTimeout(function() {
                this.sendUserScripts(user);
            }.bind(this), 500);
        }
    }.bind(this));
};

Channel.prototype.loadAlts = function() {
    var self = this;
    
    self.waitFlag(Flags.C_READY, function () {
        db_alts.fetchByChannel(self.name, function (err, alts) {
            if (!err && alts) {
                alts.forEach(function(alt) {
                    if (alt.is_enabled) {
                        alt_ids.push(alt.id);
                        self.initAlt(alt);
                    }
                });
            }
        });
        
        // Check for alts recently added to the database.
        setInterval(function() {
            db_alts.fetchByChannel(self.name, function (err, fresh_alts) {
                if (!err && fresh_alts) {
                    fresh_alts.forEach(function(fresh_alt) {
                        if (fresh_alt.is_enabled) {
                            if (alt_ids.indexOf(fresh_alt.id) === -1) {
                                alt_ids.push(fresh_alt.id);
                                self.initAlt(fresh_alt);
                            }
                        }
                    });
                }
            });
        }, 10000);
    });
};

Channel.prototype.initAlt = function(alt) {
    var self       = this;
    var hostname   = Config.get("io.domain") + ":" + Config.get("io.default-port");
    var socket     = io.connect(hostname);
    var is_parting = false;
    var sc_int     = null;
    var pl_int     = null;
    var sp_int     = null;
    
    socket.on("connect", function() {
        socket.on("disconnect", function() {
            if (!is_parting) {
                setTimeout(function () {
                    socket = null;
                    clearInterval(sc_int);
                    clearInterval(pl_int);
                    clearInterval(sp_int);
                    self.initAlt(alt);
                }, 5000);
            }
        });
        
        socket.emit("joinChannel", {
            name: self.name
        });
        
        socket.emit("login", {
            name: alt.name,
            pw: alt.password
        });
        
        if (alt.responses) {
            setTimeout(function() {
                socket.on("chatMsg", function (data) {
                    if (data.msg.indexOf(alt.name) !== -1) {
                        setTimeout(function () {
                            var responses = alt.responses.split(/\r?\n/);
                            var response  = responses[Math.floor(Math.random() * responses.length)].trim();
                            socket.emit("chatMsg", {
                                msg: response,
                                meta: {}
                            });
                        }, 2000);
                    }
                });
            }, 5000);
        }
        
        if (alt.queue_interval != 0 && alt.playlist) {
            pl_int = setInterval(function() {
                var urls  = alt.playlist.split(/\r?\n/);
                var url   = urls[Math.floor(Math.random() * urls.length)].trim();
                var media = parseMediaLink(url);
                var queue = {
                    id: media.id,
                    type: media.type,
                    pos: "end",
                    duration: 0,
                    temp: true
                };
                socket.emit("queue", queue);
            }, alt.queue_interval * 1000);
        }
    });
    
    // Poll for "speak" commands. Admins can make the alts talk in channels.
    var key = "alts:speak:" + alt.id;
    sp_int = setInterval(function() {
        self.redis.hgetall(key, function(err, objs) {
            if (!err && objs) {
                for(var text in objs) {
                    if (objs.hasOwnProperty(text)) {
                        try {
                            var obj = JSON.parse(text);
                            if (obj.channel == self.name) {
                                self.redis.hdel(key, text);
                                
                                if (obj.text.indexOf("/q") === 0) {
                                    var parts = obj.text.split(" ");
                                    if (parts.length == 2) {
                                        var media = parseMediaLink(parts[1]);
                                        var queue = {
                                            id: media.id,
                                            type: media.type,
                                            pos: "end",
                                            duration: 0,
                                            temp: true
                                        };
                                        socket.emit("queue", queue);
                                    }
                                } else {
                                    socket.emit("chatMsg", {
                                        msg: obj.text,
                                        meta: {}
                                    });
                                }
                            }
                        } catch (e) {}
                    }
                }
            }
        });
    }, 1000);
    
    // Check if the alt settings have been changed.
    sc_int = setInterval(function() {
        db_alts.fetchById(alt.id, function(err, fresh_alt) {
            if (!err && fresh_alt) {
                if (!fresh_alt.is_enabled) {
                    clearInterval(sc_int);
                    clearInterval(pl_int);
                    clearInterval(sp_int);
                    is_parting = true;
                    var index = alt_ids.indexOf(alt.id);
                    if (index != -1) {
                        alt_ids.splice(index, 1);
                    }
                    socket.disconnect();
                } else if (JSON.stringify(alt) != JSON.stringify(fresh_alt)) {
                    clearInterval(sc_int);
                    clearInterval(pl_int);
                    clearInterval(sp_int);
                    alt = fresh_alt;
                    is_parting = true;
                    socket.disconnect();
                    self.initAlt(fresh_alt);
                }
            }
        });
    }, 10000);
};

Channel.prototype.saveState = function () {
    if (!this.is(Flags.C_REGISTERED)) {
        return Promise.resolve();
    } else if (!this.is(Flags.C_READY)) {
        return Promise.reject(new Error(`Attempted to save channel ${this.name} ` +
                `but it wasn't finished loading yet!`));
    }

    if (this.is(Flags.C_ERROR)) {
        return Promise.reject(new Error(`Channel is in error state`));
    }

    this.logger.log("[init] Saving channel state to disk");
    const data = {};
    Object.keys(this.modules).forEach(m => {
        this.modules[m].save(data);
    });

    return ChannelStore.save(this.uniqueName, data).catch(ChannelStateSizeError, err => {
        this.users.forEach(u => {
            if (u.account.effectiveRank >= 2) {
                u.socket.emit("warnLargeChandump", {
                    limit: err.limit,
                    actual: err.actual
                });
            }
        });

        throw err;
    });
};

Channel.prototype.checkModules = function (fn, args, cb) {
    const self = this;
    const refCaller = `Channel::checkModules/${fn}`;
    this.waitFlag(Flags.C_READY, function () {
        self.refCounter.ref(refCaller);
        var keys = Object.keys(self.modules);
        var next = function (err, result) {
            if (result !== ChannelModule.PASSTHROUGH) {
                /* Either an error occured, or the module denied the user access */
                cb(err, result);
                self.refCounter.unref(refCaller);
                return;
            }

            var m = keys.shift();
            if (m === undefined) {
                /* No more modules to check */
                cb(null, ChannelModule.PASSTHROUGH);
                self.refCounter.unref(refCaller);
                return;
            }

            var module = self.modules[m];
            module[fn].apply(module, args);
        };

        args.push(next);
        next(null, ChannelModule.PASSTHROUGH);
    });
};

Channel.prototype.notifyModules = function (fn, args) {
    var self = this;
    this.waitFlag(Flags.C_READY, function () {
        var keys = Object.keys(self.modules);
        keys.forEach(function (k) {
            self.modules[k][fn].apply(self.modules[k], args);
        });
    });
};

Channel.prototype.joinUser = function (user, data) {
    const self = this;

    self.refCounter.ref("Channel::user");
    self.waitFlag(Flags.C_READY, function () {
        /* User closed the connection before the channel finished loading */
        if (user.socket.disconnected) {
            self.refCounter.unref("Channel::user");
            return;
        }

        if (self.is(Flags.C_REGISTERED)) {
            user.refreshAccount({ channel: self.name }, function (err, account) {
                if (err) {
                    Logger.errlog.log("user.refreshAccount failed at Channel.joinUser");
                    Logger.errlog.log(err.stack);
                    self.refCounter.unref("Channel::user");
                    return;
                }

                afterAccount();
            });
        } else {
            afterAccount();
        }

        function afterAccount() {
            if (user.socket.disconnected) {
                self.refCounter.unref("Channel::user");
                return;
            } else if (self.dead) {
                return;
            }
            
            self.checkModules("onUserPreJoin", [user, data], function (err, result) {
                if (result === ChannelModule.PASSTHROUGH) {
                    if (user.account.channelRank !== user.account.globalRank) {
                        user.socket.emit("rank", user.account.effectiveRank);
                    }
                    self.acceptUser(user);
                } else {
                    user.account.channelRank = 0;
                    user.account.effectiveRank = user.account.globalRank;
                    self.refCounter.unref("Channel::user");
                }
            });
        }
    });
};

Channel.prototype.acceptUser = function (user) {
    user.channel = this;
    
    this.sendUserScripts(user, function() {
        user.setFlag(Flags.U_IN_CHANNEL);
        user.socket.join(this.name);
        user.autoAFK();
        user.socket.on("readChanLog", this.handleReadLog.bind(this, user));
        user.socket.on("saveUserScripts", this.handleSaveUserScripts.bind(this, user));
        user.socket.on("installUserScript", this.installUserScript.bind(this, user));
        user.socket.on("deleteUserScript", this.handleDeleteUserScript.bind(this, user));
    
        Logger.syslog.log(user.realip + " joined " + this.name);
        if (user.socket._isUsingTor) {
            if (this.modules.options && this.modules.options.get("torbanned")) {
                user.kick("This channel has banned connections from Tor.");
                this.logger.log("[login] Blocked connection from Tor exit at " +
                    user.displayip);
                return;
            }
        
            this.logger.log("[login] Accepted connection from Tor exit at " +
                user.displayip);
        } else {
            this.logger.log("[login] Accepted connection from " + user.displayip);
        }
    
        var self = this;
        user.waitFlag(Flags.U_LOGGED_IN, function () {
            for (var i = 0; i < self.users.length; i++) {
                if (self.users[i] !== user &&
                    self.users[i].getLowerName() === user.getLowerName()) {
                    self.users[i].kick("Duplicate login");
                }
            }
        
            var loginStr = "[login] " + user.displayip + " logged in as " + user.getName();
            if (user.account.globalRank === 0) loginStr += " (guest)";
            loginStr += " (aliases: " + user.account.aliases.join(",") + ")";
            self.logger.log(loginStr);
        
            self.sendUserJoin(self.users, user);
        });
    
        this.users.push(user);
        db_users.updateTimeLogin(user.account.name);
    
        user.socket.on("disconnect", this.partUser.bind(this, user));
        Object.keys(this.modules).forEach(function (m) {
            if (user.dead) return;
            self.modules[m].onUserPostJoin(user);
        });
    
        this.sendUserlist([user]);
        this.sendUsercount(this.users);
        if (!this.is(Flags.C_REGISTERED)) {
            user.socket.emit("channelNotRegistered");
        }
    
        var join_msg = self.modules.options.get("join_msg").trim();
        if (join_msg.length != 0) {
            user.socket.emit("chatMsg", {
                msg: XSS.sanitizeHTML(join_msg),
                time: Date.now(),
                username: "chmod"
            });
        }
    }.bind(this));
};

Channel.prototype.partUser = function (user) {
    if (!this.logger) {
        Logger.errlog.log("partUser called on dead channel");
        return;
    }

    this.logger.log("[login] " + user.displayip + " (" + user.getName() + ") " +
                    "disconnected.");
    user.channel = null;
    /* Should be unnecessary because partUser only occurs if the socket dies */
    user.clearFlag(Flags.U_IN_CHANNEL);

    if (user.is(Flags.U_LOGGED_IN)) {
        this.broadcastAll("userLeave", { name: user.getName() });
    }

    var idx = this.users.indexOf(user);
    if (idx >= 0) {
        this.users.splice(idx, 1);
    }

    var self = this;
    Object.keys(this.modules).forEach(function (m) {
        self.modules[m].onUserPart(user);
    });
    this.sendUsercount(this.users);

    this.refCounter.unref("Channel::user");
    user.die();
};

Channel.prototype.packUserData = function (user) {
    var is_bot = user.account.is_alt;
    if (user.account.name == "headzoo") {
        is_bot = false;
    }
    
    var base = {
        name: user.getName(),
        rank: user.account.effectiveRank,
        profile: user.account.profile,
        meta: {
            afk: user.is(Flags.U_AFK),
            is_bot: is_bot,
            muted: user.is(Flags.U_MUTED) && !user.is(Flags.U_SMUTED)
        }
    };
    
    var mod = {
        name: user.getName(),
        rank: user.account.effectiveRank,
        profile: user.account.profile,
        meta: {
            afk: user.is(Flags.U_AFK),
            is_bot: is_bot,
            muted: user.is(Flags.U_MUTED),
            smuted: user.is(Flags.U_SMUTED),
            aliases: user.account.aliases,
            ip: user.displayip
        }
    };

    var sadmin = {
        name: user.getName(),
        rank: user.account.effectiveRank,
        profile: user.account.profile,
        meta: {
            afk: user.is(Flags.U_AFK),
            is_bot: is_bot,
            muted: user.is(Flags.U_MUTED),
            smuted: user.is(Flags.U_SMUTED),
            aliases: user.account.aliases,
            ip: user.realip
        }
    };

    return {
        base: base,
        mod: mod,
        sadmin: sadmin
    };
};

Channel.prototype.sendUserMeta = function (users, user, minrank) {
    var self = this;
    var userdata = self.packUserData(user);
    users.filter(function (u) {
        return typeof minrank !== "number" || u.account.effectiveRank > minrank
    }).forEach(function (u) {
        if (u.account.globalRank >= 255)  {
            u.socket.emit("setUserMeta", {
                name: user.getName(),
                meta: userdata.sadmin.meta
            });
        } else if (u.account.effectiveRank >= 2) {
            u.socket.emit("setUserMeta", {
                name: user.getName(),
                meta: userdata.mod.meta
            });
        } else {
            u.socket.emit("setUserMeta", {
                name: user.getName(),
                meta: userdata.base.meta
            });
        }
    });
};

Channel.prototype.sendUserProfile = function (users, user) {
    var packet = {
        name: user.getName(),
        profile: user.account.profile
    };

    users.forEach(function (u) {
        u.socket.emit("setUserProfile", packet);
    });
};

Channel.prototype.sendUserlist = function (toUsers) {
    var self = this;
    var base = [];
    var mod = [];
    var sadmin = [];

    for (var i = 0; i < self.users.length; i++) {
        var u = self.users[i];
        if (u.getName() === "") {
            continue;
        }

        var data = self.packUserData(self.users[i]);
        base.push(data.base);
        mod.push(data.mod);
        sadmin.push(data.sadmin);
    }

    toUsers.forEach(function (u) {
        if (u.account.globalRank >= 255) {
            u.socket.emit("userlist", sadmin);
        } else if (u.account.effectiveRank >= 2) {
            u.socket.emit("userlist", mod);
        } else {
            u.socket.emit("userlist", base);
        }

        if (self.leader != null) {
            u.socket.emit("setLeader", self.leader.name);
        }
    });
};

Channel.prototype.sendUsercount = function (users) {
    var self = this;
    if (users === self.users) {
        self.broadcastAll("usercount", self.users.length);
    } else {
        users.forEach(function (u) {
            u.socket.emit("usercount", self.users.length);
        });
    }
};

Channel.prototype.sendUserJoin = function (users, user) {
    var self = this;
    if (user.account.aliases.length === 0) {
        user.account.aliases.push(user.getName());
    }

    var data = self.packUserData(user);

    users.forEach(function (u) {
        if (u.account.globalRank >= 255) {
            u.socket.emit("addUser", data.sadmin);
        } else if (u.account.effectiveRank >= 2) {
            u.socket.emit("addUser", data.mod);
        } else {
            u.socket.emit("addUser", data.base);
        }
    });

    self.modules.chat.sendModMessage(user.getName() + " joined (aliases: " +
                                     user.account.aliases.join(",") + ")", 2);
};

Channel.prototype.readLog = function (cb) {
    const maxLen = 102400;
    const file = this.logger.filename;
    this.refCounter.ref("Channel::readLog");
    const self = this;
    fs.stat(file, function (err, data) {
        if (err) {
            self.refCounter.unref("Channel::readLog");
            return cb(err, null);
        }

        const start = Math.max(data.size - maxLen, 0);
        const end = data.size - 1;

        const read = fs.createReadStream(file, {
            start: start,
            end: end
        });

        var buffer = "";
        read.on("data", function (data) {
            buffer += data;
        });
        read.on("end", function () {
            cb(null, buffer);
            self.refCounter.unref("Channel::readLog");
        });
    });
};

Channel.prototype.handleReadLog = function (user) {
    if (user.account.effectiveRank < 3) {
        user.kick("Attempted readChanLog with insufficient permission");
        return;
    }

    if (!this.is(Flags.C_REGISTERED)) {
        user.socket.emit("readChanLog", {
            success: false,
            data: "Channel log is only available to registered channels."
        });
        return;
    }

    var shouldMaskIP = user.account.globalRank < 255;
    this.readLog(function (err, data) {
        if (err) {
            user.socket.emit("readChanLog", {
                success: false,
                data: "Error reading channel log"
            });
        } else {
            user.socket.emit("readChanLog", {
                success: true,
                data: data
            });
        }
    });
};

Channel.prototype.broadcastToRoom = function (msg, data, ns) {
    sio.instance.in(ns).emit(msg, data);
};

Channel.prototype.broadcastAll = function (msg, data) {
    this.broadcastToRoom(msg, data, this.name);
};

Channel.prototype.packInfo = function (isAdmin) {
    var data = {
        name: this.name,
        usercount: this.users.length,
        users: [],
        registered: this.is(Flags.C_REGISTERED),
        thumbnail: this.modules.options.get("thumbnail"),
        background_url: this.modules.options.get("background_url"),
        background_repeat: this.modules.options.get("background_repeat")
    };
    
    for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].name !== "") {
            var name = this.users[i].getName();
            var rank = this.users[i].account.effectiveRank;
            if (rank >= 255) {
                name = "!" + name;
            } else if (rank >= 4) {
                name = "~" + name;
            } else if (rank >= 3) {
                name = "&" + name;
            } else if (rank >= 2) {
                name = "@" + name;
            }
            data.users.push(name);
        }
    }

    if (isAdmin) {
        data.activeLockCount = this.refCounter.refCount;
    }
    
    var self = this;
    var keys = Object.keys(this.modules);
    keys.forEach(function (k) {
        self.modules[k].packInfo(data, isAdmin);
    });

    return data;
};

function extractQueryParam(query, param) {
    var params = {};
    query.split("&").forEach(function (kv) {
        kv = kv.split("=");
        params[kv[0]] = kv[1];
    });
    
    return params[param];
}

function parseMediaLink(url) {
    if(typeof url != "string") {
        return {
            id: null,
            type: null
        };
    }
    url = url.trim();
    url = url.replace("feature=player_embedded&", "");
    
    if(url.indexOf("jw:") == 0) {
        return {
            id: url.substring(3),
            type: "fi"
        };
    }
    
    if(url.indexOf("rtmp://") == 0) {
        return {
            id: url,
            type: "rt"
        };
    }
    
    var m;
    if((m = url.match(/youtube\.com\/watch\?([^#]+)/))) {
        return {
            id: extractQueryParam(m[1], "v"),
            type: "yt"
        };
    }
    
    if((m = url.match(/youtu\.be\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "yt"
        };
    }
    
    if((m = url.match(/youtube\.com\/playlist\?([^#]+)/))) {
        return {
            id: extractQueryParam(m[1], "list"),
            type: "yp"
        };
    }
    
    if((m = url.match(/twitch\.tv\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "tw"
        };
    }
    
    if((m = url.match(/livestream\.com\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "li"
        };
    }
    
    if((m = url.match(/ustream\.tv\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "us"
        };
    }
    
    if ((m = url.match(/hitbox\.tv\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "hb"
        };
    }
    
    if((m = url.match(/vimeo\.com\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "vi"
        };
    }
    
    if((m = url.match(/dailymotion\.com\/video\/([^\?&#_]+)/))) {
        return {
            id: m[1],
            type: "dm"
        };
    }
    
    if((m = url.match(/imgur\.com\/a\/([^\?&#]+)/))) {
        return {
            id: m[1],
            type: "im"
        };
    }
    
    if((m = url.match(/soundcloud\.com\/([^\?&#]+)/))) {
        return {
            id: url,
            type: "sc"
        };
    }
    
    if ((m = url.match(/(?:docs|drive)\.google\.com\/file\/d\/([^\/]*)/)) ||
        (m = url.match(/drive\.google\.com\/open\?id=([^&]*)/))) {
        return {
            id: m[1],
            type: "gd"
        };
    }
    
    if ((m = url.match(/plus\.google\.com\/(?:u\/\d+\/)?photos\/(\d+)\/albums\/(\d+)\/(\d+)/))) {
        return {
            id: m[1] + "_" + m[2] + "_" + m[3],
            type: "gp"
        };
    }
    
    /*  Shorthand URIs  */
    // To catch Google Plus by ID alone
    if ((m = url.match(/^(?:gp:)?(\d{21}_\d{19}_\d{19})/))) {
        return {
            id: m[1],
            type: "gp"
        };
    }
    // So we still trim DailyMotion URLs
    if((m = url.match(/^dm:([^\?&#_]+)/))) {
        return {
            id: m[1],
            type: "dm"
        };
    }
    // Raw files need to keep the query string
    if ((m = url.match(/^fi:(.*)/))) {
        return {
            id: m[1],
            type: "fi"
        };
    }
    // Generic for the rest.
    if ((m = url.match(/^([a-z]{2}):([^\?&#]+)/))) {
        return {
            id: m[2],
            type: m[1]
        };
    }
    
    /* Raw file */
    var tmp = url.split("?")[0];
    if (tmp.match(/^https?:\/\//)) {
        if (tmp.match(/\.(mp4|flv|webm|og[gv]|mp3|mov)$/)) {
            return {
                id: url,
                type: "fi"
            };
        } else {
            Callbacks.queueFail({
                link: url,
                msg: "The file you are attempting to queue does not match the supported " +
                "file extensions mp4, flv, webm, ogg, ogv, mp3, mov."
            });
            throw new Error("ERROR_QUEUE_UNSUPPORTED_EXTENSION");
        }
    }
    
    return {
        id: null,
        type: null
    };
}

module.exports = Channel;
