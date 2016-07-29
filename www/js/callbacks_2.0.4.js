Callbacks = {
    
    error: function (reason) {
        window.SOCKET_ERROR_REASON = reason;
    },
    
    /* fired when socket connection completes */
    connect: function () {
        socket.emit("initChannelCallbacks");
        socket.emit("joinChannel", {
            name: CHANNEL.name
        });
        
        if (CHANNEL.opts.password) {
            socket.emit("channelPassword", CHANNEL.opts.password);
        }
        
        if (CLIENT.name && CLIENT.guest) {
            socket.emit("login", {
                name: CLIENT.name
            });
        }
        
        //$("<div/>").addClass("server-msg-reconnect")
        //    .text("Connected")
        //    .appendTo($("#messagebuffer"));
        //scrollChat();
    },
    
    disconnect: function () {
        //if(KICKED) {
        //    return;
        //}
        
        //$("<div/>")
        //    .addClass("server-msg-disconnect")
        //    .text("Disconnected from server.  Attempting reconnection...")
        //    .appendTo($("#messagebuffer"));
        //scrollChat();
    },
    
    errorMsg: function (data) {
        if (data.alert) {
            alert(data.msg);
        } else {
            errDialog(data.msg);
        }
    },
    
    costanza: function (data) {
        hidePlayer();
        $("#costanza-modal").modal("hide");
        var modal = makeModal();
        modal.attr("id", "costanza-modal")
            .appendTo($("body"));
        
        var body = $("<div/>").addClass("modal-body")
            .appendTo(modal.find(".modal-content"));
        $("<img/>").attr("src", "http://i0.kym-cdn.com/entries/icons/original/000/005/498/1300044776986.jpg")
            .appendTo(body);
        
        $("<strong/>").text(data.msg).appendTo(body);
        hidePlayer();
        modal.modal();
    },
    
    kick: function (data) {
        KICKED = true;
        $("<div/>").addClass("server-msg-disconnect")
            .text("Kicked: " + data.reason)
            .appendTo($("#messagebuffer"));
        scrollChat();
    },
    
    noflood: function (data) {
        $("<div/>")
            .addClass("server-msg-disconnect")
            .text(data.action + ": " + data.msg)
            .appendTo($("#messagebuffer"));
        scrollChat();
    },
    
    needPassword: function (wrongpw) {
        var div = $("<div/>");
        $("<strong/>").text("Channel Password")
            .appendTo(div);
        if (wrongpw) {
            $("<br/>").appendTo(div);
            $("<span/>").addClass("text-error")
                .text("Wrong Password")
                .appendTo(div);
        }
        
        var pwbox  = $("<input/>").addClass("form-control")
            .attr("type", "password")
            .appendTo(div);
        var submit = $("<button/>").addClass("btn btn-xs btn-default btn-block")
            .css("margin-top", "5px")
            .text("Submit")
            .appendTo(div);
        var parent = chatDialog(div);
        parent.attr("id", "needpw");
        var sendpw = function () {
            socket.emit("channelPassword", pwbox.val());
            parent.remove();
        };
        submit.click(sendpw);
        pwbox.keydown(function (ev) {
            if (ev.keyCode == 13) {
                sendpw();
            }
        });
        pwbox.focus();
    },
    
    cancelNeedPassword: function () {
        $("#needpw").remove();
    },
    
    cooldown: function (time) {
        time = time + 200;
        $(".pm-input").css("color", "#ff0000");
        if (CHATTHROTTLE && $("#chatline").data("throttle_timer")) {
            clearTimeout($("#chatline").data("throttle_timer"));
        }
        CHATTHROTTLE = true;
        $("#chatline").data("throttle_timer", setTimeout(function () {
            CHATTHROTTLE = false;
            $(".pm-input").css("color", "");
        }, time));
    },
    
    channelNotRegistered: function () {
        var div = $("<div/>").addClass("alert alert-info")
            .appendTo($("<div/>").addClass("col-md-12").appendTo($("#announcements")));
        
        $("<button/>").addClass("close pull-right")
            .appendTo(div)
            .click(function () {
                div.parent().remove();
            })
            .html("&times;");
        $("<h4/>").appendTo(div).text("Unregistered channel");
        $("<p/>").appendTo(div)
            .html("This channel is not registered to a upnext.fm account.  You can still " +
            "use it, but some features will not be available.  To register a " +
            "channel to your account, visit your <a href='/account/channels'>" +
            "channels</a> page.");
    },
    
    registerChannel: function (data) {
        if ($("#chanregisterbtn").length > 0) {
            $("#chanregisterbtn").text("Register it")
                .attr("disabled", false);
        }
        if (data.success) {
            $("#chregnotice").remove();
        }
        else {
            makeAlert("Error", data.error, "alert-danger")
                .insertAfter($("#chregnotice"));
        }
    },
    
    unregisterChannel: function (data) {
        if (data.success) {
            alert("Channel unregistered");
        }
        else {
            alert(data.error);
        }
    },
    
    setMotd: function (motd) {
        CHANNEL.motd = motd;
        $("#motd").html(motd);
        $("#cs-motdtext").val(motd);
        if (motd != "") {
            $("#motdwrap").show();
            $("#motd").show();
            $("#togglemotd").find(".glyphicon-plus")
                .removeClass("glyphicon-plus")
                .addClass("glyphicon-minus");
        } else {
            $("#motdwrap").hide();
        }
    },
    
    setBio: function (bio) {
        CHANNEL.bio = bio;
        $("#cs-biotext").html(bio);
        $("#bio").html(bio);
        if (bio.length == 0) {
            $("#biobtn").hide();
        } else {
            $("#biobtn").show();
        }
    },
    
    chatFilters: function (entries) {
        var tbl = $("#cs-chatfilters table");
        tbl.data("entries", entries);
        formatCSChatFilterList();
    },
    
    updateChatFilter: function (f) {
        var entries = $("#cs-chatfilters table").data("entries") || [];
        var found   = false;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].name === f.name) {
                entries[i] = f;
                found      = true;
                break;
            }
        }
        
        if (!found) {
            entries.push(f);
        }
        
        $("#cs-chatfilters table").data("entries", entries);
        formatCSChatFilterList();
    },
    
    deleteChatFilter: function (f) {
        var entries = $("#cs-chatfilters table").data("entries") || [];
        var found   = false;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].name === f.name) {
                entries[i] = f;
                found      = i;
                break;
            }
        }
        
        if (found !== false) {
            entries.splice(found, 1);
        }
        
        $("#cs-chatfilters table").data("entries", entries);
        formatCSChatFilterList();
    },
    
    channelOpts: function (opts) {
        document.title = opts.pagetitle;
        PAGETITLE      = opts.pagetitle;
        
        if (!USEROPTS.ignore_channelcss &&
            opts.externalcss !== CHANNEL.opts.externalcss) {
            $("#chanexternalcss").remove();
            
            if (opts.externalcss.trim() !== "") {
                $("#chanexternalcss").remove();
                $("<link/>")
                    .attr("rel", "stylesheet")
                    .attr("href", opts.externalcss)
                    .attr("id", "chanexternalcss")
                    .appendTo($("head"));
            }
        }
        
        if (opts.externaljs.trim() != "" && !USEROPTS.ignore_channeljs &&
            opts.externaljs !== CHANNEL.opts.externaljs) {
            checkScriptAccess(opts.externaljs, "external", function (pref) {
                if (pref === "ALLOW") {
                    $.getScript(opts.externaljs);
                }
            });
        }
        
        CHANNEL.opts = opts;
        
        if (opts.allow_voteskip) {
            $("#voteskip").attr("disabled", false);
        } else {
            $("#voteskip").attr("disabled", true);
        }
        if (opts.background_url && !USEROPTS.hide_channelbg) {
            var background_url_wrap = $("#wrap");
            background_url_wrap
                .css("background-image", "url(" + opts.background_url + ")")
                .css("background-repeat", opts.background_repeat);
            if (opts.background_repeat == "no-repeat") {
                background_url_wrap.css("background-size", "100% auto");
            }
        }
        handlePermissionChange();
    },
    
    setPermissions: function (perms) {
        CHANNEL.perms = perms;
        genPermissionsEditor();
        handlePermissionChange();
    },
    
    channelCSSJS: function (data) {
        $("#chancss").remove();
        CHANNEL.css = data.css;
        $("#cs-csstext").val(data.css);
        if (data.css && !USEROPTS.ignore_channelcss) {
            $("<style/>").attr("type", "text/css")
                .attr("id", "chancss")
                .text(data.css)
                .appendTo($("head"));
        }
        
        $("#chanjs").remove();
        CHANNEL.js  = data.js;
        $("#cs-jstext").val(data.js);
        
        if (data.js && !USEROPTS.ignore_channeljs) {
            $("<script/>").attr("type", "text/javascript")
                .attr("id", "chanjs")
                .text(data.js)
                .appendTo($("body"));
        }
    },
    
    setUserScripts: function (scripts) {
        ChatAPI._setUserScripts(scripts);
    },
    
    deleteUserScript: function (data) {
        ChatAPI._deleteUserScript(data);
    },
    
    installedUserScript: function () {
        $("#install-script-modal").modal("hide");
        toastr.options.preventDuplicates = true;
        toastr.options.closeButton       = true;
        toastr.options.timeOut           = 5000;
        toastr.success('Script installed! You may have to refresh the page.');
    },
    
    banlist: function (entries) {
        var tbl = $("#cs-banlist table");
        tbl.data("entries", entries);
        formatCSBanlist();
    },
    
    banlistRemove: function (data) {
        var entries = $("#cs-banlist table").data("entries") || [];
        var found   = false;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].id === data.id) {
                found = i;
                break;
            }
        }
        
        if (found !== false) {
            entries.splice(i, 1);
            $("#cs-banlist table").data("entries", entries);
        }
        
        formatCSBanlist();
    },
    
    recentLogins: function (entries) {
        var tbl = $("#loginhistory table");
        // I originally added this check because of a race condition
        // Now it seems to work without but I don't trust it
        if (!tbl.hasClass("table")) {
            setTimeout(function () {
                Callbacks.recentLogins(entries);
            }, 100);
            return;
        }
        if (tbl.children().length > 1) {
            $(tbl.children()[1]).remove();
        }
        for (var i = 0; i < entries.length; i++) {
            var tr      = document.createElement("tr");
            var name    = $("<td/>").text(entries[i].name).appendTo(tr);
            var aliases = $("<td/>").text(entries[i].aliases.join(", ")).appendTo(tr);
            var time    = new Date(entries[i].time).toTimeString();
            $("<td/>").text(time).appendTo(tr);
            
            $(tr).appendTo(tbl);
        }
    },
    
    channelRanks: function (entries) {
        var tbl = $("#cs-chanranks table");
        tbl.data("entries", entries);
        formatCSModList();
    },
    
    channelRankFail: function (data) {
        if ($("#cs-chanranks").is(":visible")) {
            makeAlert("Error", data.msg, "alert-danger")
                .removeClass().addClass("vertical-spacer")
                .insertAfter($("#cs-chanranks form"));
        } else {
            Callbacks.noflood({action: "/rank", msg: data.msg});
        }
    },
    
    readChanLog: function (data) {
        var log = $("#cs-chanlog-text");
        if (log.length == 0)
            return;
        
        if (data.success) {
            setupChanlogFilter(data.data);
            filterChannelLog();
        } else {
            $("#cs-chanlog-text").text("Error reading channel log");
        }
    },
    
    voteskip: function (data) {
        var icon = $("#voteskip").find(".glyphicon").remove();
        if (data.count > 0) {
            $("#voteskip").text(" (" + data.count + "/" + data.need + ")");
        } else {
            $("#voteskip").text("Vote Skip");
        }
        
        icon.prependTo($("#voteskip"));
    },
    
    /* REGION Rank Stuff */
    
    rank: function (r) {
        if (r >= 255)
            SUPERADMIN = true;
        CLIENT.rank = r;
        handlePermissionChange();
        if (SUPERADMIN && $("#setrank").length == 0) {
            var li   = $("<li/>").addClass("dropdown")
                .attr("id", "setrank");
            //.appendTo($(".nav")[0]);
            
            $("<a/>").addClass("dropdown-toggle")
                .attr("data-toggle", "dropdown")
                .attr("href", "javascript:void(0)")
                .html("Set Rank <b class='caret'></b>")
                .appendTo(li);
            var menu = $("<ul/>").addClass("dropdown-menu")
                .appendTo(li);
            
            function addRank(r, disp) {
                var li = $("<li/>").appendTo(menu);
                $("<a/>").attr("href", "javascript:void(0)")
                    .html(disp)
                    .click(function () {
                        socket.emit("borrow-rank", r);
                    })
                    .appendTo(li);
            }
            
            addRank(0, "<span class='userlist_guest'>Guest</span>");
            addRank(1, "<span>Registered</span>");
            addRank(2, "<span class='userlist_op'>Moderator</span>");
            addRank(3, "<span class='userlist_owner'>Admin</span>");
            addRank(255, "<span class='userlist_siteadmin'>Superadmin</span>");
        }
    },
    
    login: function (data) {
        if (!data.success) {
            if (data.error != "Session expired") {
                errDialog(data.error);
            }
        } else {
            CLIENT.name      = data.name;
            CLIENT.guest     = data.guest;
            CLIENT.logged_in = true;
            
            if (!CLIENT.guest) {
                socket.emit("initUserPLCallbacks");
                if ($("#loginform").length === 0) {
                    return;
                }
                var logoutform = $("<p/>").attr("id", "logoutform")
                    .addClass("navbar-text pull-right")
                    .insertAfter($("#loginform"));
                
                $("<span/>").attr("id", "welcome").text("Welcome, " + CLIENT.name)
                    .appendTo(logoutform);
                $("<span/>").html("&nbsp;&middot;&nbsp;").appendTo(logoutform);
                var domain     = $("#loginform").attr("action").replace("/login", "");
                $("<a/>").attr("id", "logout")
                    .attr("href", domain + "/logout?redirect=/r/" + CHANNEL.name)
                    .text("Logout")
                    .appendTo(logoutform);
                
                $("#loginform").remove();
            }
        }
    },
    
    /* REGION Chat */
    usercount: function (count) {
        CHANNEL.usercount = count;
        updateUserDetails();
    },
    
    chatMsg: function (data) {
        data.msg_clean    = removeBBCodes(data.msg);
        data.is_mentioned = false;
        if (CLIENT.name && data.username != CLIENT.name) {
            if (data.msg_clean.toLowerCase().indexOf(CLIENT.name.toLowerCase()) != -1
                || (USEROPTS.highlight_regex !== null && data.msg_clean.match(USEROPTS.highlight_regex) !== null)) {
                
                data.is_mentioned = true;
            }
        }
        
        if (!ChatAPI.trigger("receive", data).isCancelled()) {
            addChatMessage(data);
        }
    },
    
    delMsg: function (msg_id) {
        $("#chat-msg-" + msg_id).remove();
    },
    
    chatBuffer: function (data) {
        for (var i = 0; i < data.length; i++) {
            Callbacks.chatMsg(data[i]);
        }
        ChatAPI._pushPageReady();
    },
    
    pm: function (data) {
        var name = data.username;
        if (IGNORED.indexOf(name) !== -1) {
            return;
        }
        
        data.pm = true;
        if (data.username === CLIENT.name) {
            name = data.to;
        } else {
            pingMessage(true);
        }
        
        var is_first  = false;
        var prev_msgs = ChatStore.local.get("pm_with_" + name);
        if (!prev_msgs) {
            prev_msgs = [];
        }
        if ($("#pm-" + name).length == 0) {
            is_first = true;
        }
        
        var pm      = initPm(name);
        var body    = pm.find(".panel-body:first");
        var heading = pm.find(".panel-heading:first");
        var msg = formatChatMessage(data, pm.data("last"));
        msg.css("display", "none");
        var buffer = pm.find(".pm-buffer");
        
        if (is_first) {
            for(var i = 0; i < prev_msgs.length; i++) {
                var prev_msg = formatChatMessage(prev_msgs[i], pm.data("last"));
                prev_msg.appendTo(buffer);
            }
            buffer.scrollTop(buffer.prop("scrollHeight"));
        }
        
        msg.appendTo(buffer);
        prev_msgs.push(data);
        if (prev_msgs.length > 10) {
            prev_msgs.shift();
        }
        ChatStore.local.set("pm_with_" + name, prev_msgs);
        
        var p = $('<div class="chat-msg chat-msg-hidden">&nbsp;</div>');
        buffer.append(p);
        buffer.scrollTop(buffer.prop("scrollHeight"));
        msg.slideDown('fast', function() {
            p.remove();
            buffer.scrollTop(buffer.prop("scrollHeight"));
        });
        
        if (pm.find(".panel-body").is(":hidden")) {
            pm.removeClass("panel-default").addClass("panel-primary");
        }
        
        var unread_msg_count = pm.data("unread_msg_count");
        if (body.is(":hidden")) {
            unread_msg_count++;
            pm.data("unread_msg_count", unread_msg_count);
            heading.find("span:first").text(heading.data("username") + " (" + unread_msg_count + ")");
            heading.addClass("flash unread_messages");
            setTimeout(function () {
                heading.removeClass("flash");
            }, 120000);
        } else {
            pm.data("unread_msg_count", 0);
            unread_msg_count = 0;
            heading.removeClass("unread_messages").find("span:first").text(heading.data("username"));
        }
    },
    
    userJoin: function (data) {
        addUserJoinMessage(data);
        updateUserDetails();
    },
    
    notice: function (data) {
        if (!ChatAPI.trigger("notice", data).isCancelled()) {
            addNotice(data);
        }
    },
    
    whisper: function (data) {
        if (!ChatAPI.trigger("whisper", data).isCancelled()) {
            addWhisper(data);
        }
    },
    
    announcement: function (data) {
        addAnnouncement(data);
    },
    
    joinMessage: function (data) {
        if (USEROPTS.joinmessage)
            addChatMessage(data);
    },
    
    chatCommand: function (data) {
        if (IGNORED.indexOf(data.from) !== -1) {
            return;
        }
        ChatAPI.trigger("command", data)
    },

    clearchat: function() {
        $("#messagebuffer").html("");
        LASTCHAT.name = "";
    },
    
    chatPong: function() {
        handlePong();
    },

    userlist: function(data) {
        $(".userlist_item").remove();
        for(var i = 0; i < data.length; i++) {
            Callbacks.addUser(data[i]);
        }
        ChatAPI._pushPageReady();
    },

    addUser: function(data) {
        if (ChatAPI.trigger("user_join", data).isCancelled()) {
            return;
        }
        
        var user = findUserlistItem(data.name);
        // Remove previous instance of user, if there was one
        if(user !== null)
            user.remove();
        var div = $("<div/>")
            .addClass("userlist_item userlist_item_" + data.name)
            .data("name", data.name);
        if (data.meta.is_bot) {
            div.addClass("userlist_item_is_bot");
        }
        var icon = $("<span/>").appendTo(div);
        var nametag = $("<span/>").text(data.name).appendTo(div);
        div.data("name", data.name);
        div.data("rank", data.rank);
        div.data("leader", Boolean(data.leader));
        div.data("profile", data.profile);
        div.data("meta", data.meta);
        div.data("afk", data.meta.afk);
        if (data.meta.muted || data.meta.smuted) {
            div.data("icon", "glyphicon-volume-off");
        } else {
            div.data("icon", false);
        }
        formatUserlistItem(div, data);
        addUserDropdown(div, data);
        div.appendTo($("#userlist"));
        sortUserlist();
    },

    setUserMeta: function (data) {
        var user = findUserlistItem(data.name);
        if (user == null) {
            return;
        }

        user.data("meta", data.meta);
        if (data.meta.muted || data.meta.smuted) {
            user.data("icon", "glyphicon-volume-off");
        } else {
            user.data("icon", false);
        }

        formatUserlistItem(user, data);
        addUserDropdown(user, data);
        sortUserlist();
    },

    setUserProfile: function (data) {
        var user = findUserlistItem(data.name);
        if (user === null)
            return;
        user.data("profile", data.profile);
        formatUserlistItem(user);
    },

    setLeader: function (name) {
        $(".userlist_item").each(function () {
            $(this).find(".glyphicon-star-empty").remove();
            if ($(this).data("leader")) {
                $(this).data("leader", false);
                addUserDropdown($(this));
            }
        });
        if (name === "") {
            CLIENT.leader = false;
            if(LEADTMR)
                clearInterval(LEADTMR);
            LEADTMR = false;
            return;
        }
        var user = findUserlistItem(name);
        if (user) {
            user.data("leader", true);
            formatUserlistItem(user);
            addUserDropdown(user);
        }
        if (name === CLIENT.name) {
            CLIENT.leader = true;
            // I'm a leader!  Set up sync function
            if(LEADTMR)
                clearInterval(LEADTMR);
            LEADTMR = setInterval(sendVideoUpdate, 5000);
            handlePermissionChange();
        } else if (CLIENT.leader) {
            CLIENT.leader = false;
            handlePermissionChange();
            if(LEADTMR)
                clearInterval(LEADTMR);
            LEADTMR = false;
        }
    },

    setUserRank: function (data) {
        data.name = data.name.toLowerCase();
        var entries = $("#cs-chanranks table").data("entries") || [];
        var found = false;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].name.toLowerCase() === data.name) {
                entries[i].rank = data.rank;
                found = i;
                break;
            }
        }
        if (found === false) {
            entries.push(data);
        } else if (entries[found].rank < 2) {
            entries.splice(found, 1);
        }
        formatCSModList();

        var user = findUserlistItem(data.name);
        if (user === null) {
            return;
        }

        user.data("rank", data.rank);
        if (data.name === CLIENT.name) {
            CLIENT.rank = data.rank;
            handlePermissionChange();
        }
        formatUserlistItem(user);
        addUserDropdown(user);
        if (USEROPTS.sort_rank) {
            sortUserlist();
        }
    
        updateUserDetails();
    },

    setUserIcon: function (data) {
        var user = findUserlistItem(data.name);
        if (user === null) {
            return;
        }

        user.data("icon", data.icon);
        formatUserlistItem(user);
    },

    setAFK: function (data) {
        if (ChatAPI.trigger("afk", data).isCancelled()) {
            return;
        }
        
        var user = findUserlistItem(data.name);
        if(user === null)
            return;
        user.data("afk", data.afk);
        formatUserlistItem(user);
        if(USEROPTS.sort_afk)
            sortUserlist();
    },

    userLeave: function(data) {
        if (ChatAPI.trigger("user_leave", data).isCancelled()) {
            return;
        }
        var user = findUserlistItem(data.name);
        if(user !== null) {
            user.remove();
        }
        updateUserDetails();
    },

    drinkCount: function(count) {
        if(count != 0) {
            var text = count + " drink";
            if(count != 1) {
                text += "s";
            }
            $("#drinkcount").text(text);
            $("#drinkbar").show();
        }
        else {
            $("#drinkbar").hide();
        }
    },

    /* REGION Playlist Stuff */
    playlist: function(data) {
        socket.emit("favoritesGet");
        socket.emit("userTagsGet");
        
        for(var i = 0; i < data.length; i++) {
            data[i].media.uid = data[i].media.id;
        }
        
        // @deprecated
        if (ChatAPI.trigger("playlist", data).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("loaded", data).isCancelled()) {
            return;
        }
        
        PL_QUEUED_ACTIONS = [];
        var q = $("#video-playlist")
            .empty();
        for(var i = 0; i < data.length; i++) {
            makePlaylistRow(data[i])
                .appendTo(q);
        }

        rebuildPlaylist();
    },
    
    setPlaylistMeta: function(data) {
        $("#pllength").text(data.time);
    },

    queue: function(data) {
        data.item.media.uid = data.item.media.id;
        
        // @deprecated
        if (ChatAPI.trigger("queue", data).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("queue", data).isCancelled()) {
            return;
        }
        if (data.item.uid === PL_CURRENT) {
            return;
        }
        
        var q = $("#video-playlist");
        PL_ACTION_QUEUE.queue(function (plq) {
            var row = makePlaylistRow(data.item);
            row.hide();
            
            if (data.after === "prepend") {
                row.prependTo(q);
                row.show("fade", function () {
                    plq.release();
                });
            } else if (data.after === "append") {
                row.appendTo(q);
                row.show("fade", function () {
                    plq.release();
                });
            } else {
                var row_after = playlistFind(data.after);
                if (!row_after) {
                    plq.release();
                    return;
                }
                row.insertAfter(row_after);
                row.show("fade", function () {
                    plq.release();
                });
            }
            
            plq.release();
        });
    },

    queueWarn: function (data) {
        queueMessage(data, "alert-warning");
    },

    queueFail: function (data) {
        queueMessage(data, "alert-danger");
    },

    setTemp: function(data) {
        var li = $(".pluid-" + data.uid);
        if(li.length == 0)
            return false;

        if(data.temp)
            li.addClass("queue_temp");
        else
            li.removeClass("queue_temp");

        li.data("temp", data.temp);
        var btn = li.find(".qbtn-tmp");
        if(btn.length > 0) {
            if(data.temp) {
                btn.html(btn.html().replace("Make Temporary",
                                            "Make Permanent"));
            }
            else {
                btn.html(btn.html().replace("Make Permanent",
                                            "Make Temporary"));
            }
        }
    },

    "delete": function(data) {
        PL_ACTION_QUEUE.queue(function (plq) {
            PL_WAIT_SCROLL = true;
            var li = $(".pluid-" + data.uid);
            li.hide("fade", function() {
                li.remove();
                plq.release();
                PL_WAIT_SCROLL = false;
            });
        });
    },

    moveVideo: function(data) {
        PL_ACTION_QUEUE.queue(function (plq) {
            playlistMove(data.from, data.after, function () {
                plq.release();
            });
        });
    },

    setCurrent: function(uid) {
        PL_CURRENT = uid;
        setTimeout(function() {
            $(".playlist-row").removeClass("playing");
            var li = $(".pluid-" + uid);
            if (li.length !== 0) {
                li.addClass("playing");
            }
        }, 2000);
    },

    changeMedia: function(data) {
        socket.emit("userTags");
        if (!data) {
            if (!MEDIA_INIT) ChatAPI._pushPageReady();
            MEDIA_INIT = true;
            return;
        }
        
        data.uid = data.id;
        CHAT_WRAP_MEDIA = data;
        if ($("body").hasClass("chatOnly")) {
            if (!MEDIA_INIT) ChatAPI._pushPageReady();
            MEDIA_INIT = true;
            return;
        }
        
        // @deprecated
        if (ChatAPI.trigger("media_change", data).isCancelled()) {
            if (!MEDIA_INIT) ChatAPI._pushPageReady();
            MEDIA_INIT = true;
            return;
        }
        if (ChatPlaylist.trigger("media_change", data).isCancelled()) {
            if (!MEDIA_INIT) ChatAPI._pushPageReady();
            MEDIA_INIT = true;
            return;
        }
        
        // Failsafe
        if (isNaN(VOLUME) || VOLUME > 1 || VOLUME < 0) {
            VOLUME = 1;
        }

        function loadNext() {
            if (!PLAYER || data.type !== PLAYER.mediaType) {
                loadMediaPlayer(data);
            }

            handleMediaUpdate(data);
        }

        // Persist the user's volume preference from the the player, if possible
        if (PLAYER && typeof PLAYER.getVolume === "function") {
            PLAYER.getVolume(function (v) {
                if (typeof v === "number") {
                    if (v < 0 || v > 1) {
                        // Dailymotion's API was wrong once and caused a huge
                        // headache.  This alert is here to make debugging easier.
                        alert("Something went wrong with retrieving the volume.  " +
                            "Please tell calzoneman the following: " +
                            JSON.stringify({
                                v: v,
                                t: PLAYER.mediaType,
                                i: PLAYER.mediaId
                            }));
                    } else {
                        VOLUME = v;
                        setOpt("volume", VOLUME);
                    }
                }

                loadNext();
            });
        } else {
            loadNext();
        }

        // Reset voteskip since the video changed
        if (CHANNEL.opts.allow_voteskip) {
            $("#voteskip").attr("disabled", false);
        }
        
        if (data.first_queueby) {
            $("#video-header-first-play")
                .html('First played by <a href="/user/' + data.first_queueby + '" target="_blank">' + data.first_queueby + '</a>');
        } else {
            $("#video-header-first-play")
                .html('First played by <a href="/user/' + data.queueby + '" target="_blank">' + data.queueby + '</a>');
        }
        
        var title = $('<a/>', {
            "href": formatURL(data),
            "target": "_blank",
            "text": data.title
        });
        $("#video-header-title").html(title);
        $("#video-header-queueby").html(getQueuedByHTML(data));
        $("#video-header-play-count").text(data.play_count + ((data.play_count == 1) ? " play" : " plays"));
        $("#video-header-avatar").attr("src", data.queueby_avatar);
         
        if (!MEDIA_INIT) ChatAPI._pushPageReady();
        MEDIA_INIT = true;
    },

    mediaUpdate: function(data) {
        if ($("body").hasClass("chatOnly")) {
            return;
        }

        if (PLAYER) {
            if (!ChatPlaylist.trigger("media_update", data).isCancelled()) {
                handleMediaUpdate(data);
            }
        }
    },

    setPlaylistLocked: function (locked) {
        CHANNEL.openqueue = !locked;
        handlePermissionChange();
        if(CHANNEL.openqueue) {
            $("#qlockbtn").removeClass("btn-danger")
                .addClass("btn-success")
                .attr("title", "Playlist Unlocked");
            $("#qlockbtn").find("span")
                .removeClass("glyphicon-lock")
                .addClass("glyphicon-ok");
        }
        else {
            $("#qlockbtn").removeClass("btn-success")
                .addClass("btn-danger")
                .attr("title", "Playlist Locked");
            $("#qlockbtn").find("span")
                .removeClass("glyphicon-ok")
                .addClass("glyphicon-lock");
        }
    },

    searchResults: function(data) {
        for(var i = 0; i < data.results.length; i++) {
            data.results[i].uid = data.results[i].id;
        }
        
        // @deprecated
        if (ChatAPI.trigger("search_results", data).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("search_results", data).isCancelled()) {
            return;
        }
        
        var library = $("#library");
        library.data("entities", data.results);
        formatSearchResults();
        var lib_container = $("#library-container");
        lib_container.show();
    },
    
    changeVotes: function(data) {
        // @deprecated
        if (!ChatAPI.trigger("votes", data).isCancelled()) {
            if (!ChatPlaylist.trigger("votes", data).isCancelled()) {
                $("#voteupvalue").text(data.up);
                $("#votedownvalue").text(data.down);
            }
        }
    },
    
    changeUserVideoVote: function(data) {
        // @deprecated
        if (ChatAPI.trigger("vote_value", data).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("vote_value", data).isCancelled()) {
            return;
        }
        
        if (data == 1) {
            $("#votedown").removeClass("active");
            $("#voteup").addClass("active");
        } else if (data == -1) {
            $("#voteup").removeClass("active");
            $("#votedown").addClass("active");
        } else {
            $("#voteup").removeClass("active");
            $("#votedown").removeClass("active");
        }
    },
    
    favoriteAdded: function(data) {
        // @deprecated
        if (ChatAPI.trigger("favorite_add", data).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("favorite_add", data).isCancelled()) {
            return;
        }
    
        var list     = $("#favorites-thumbs");
        var entities = list.data("entities");
        if (!entities) {
            entities = [];
        }
        entities.unshift(data.media);
        list.data("entities", entities);
        
        formatFavorites();
        formatTags(data.tags);
        
        toastr.options.preventDuplicates = true;
        toastr.options.closeButton = true;
        toastr.options.timeOut = 1500;
        toastr.success('Favorite completed!');
        $("#favorites-add").html('<span class="glyphicon glyphicon-heart"></span> Update');
    },
    
    favoritesGet: function(favorites) {
        // @deprecated
        if (ChatAPI.trigger("favorites", favorites).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("favorites", favorites).isCancelled()) {
            return;
        }
        var list = $("#favorites-thumbs");
        list.empty();
        list.data("entities", favorites);
        formatFavorites();
    },
    
    userTags: function(data) {
        var input = $("#favorites-tags");
        input.tagsinput('removeAll');
        if (data.tags.length == 0) {
            input.tagsinput('add', input.data('default-value'));
        } else {
            for (var i = 0; i < data.tags.length; i++) {
                input.tagsinput('add', data.tags[i]);
            }
        }
        
        if (data.favorited) {
            $("#favorites-add").html('<span class="glyphicon glyphicon-heart"></span> Update');
        } else {
            $("#favorites-add").html('<span class="glyphicon glyphicon-heart"></span> Favorite');
        }
    },
    
    userTagsGet: function(tags) {
        // @deprecated
        if (ChatAPI.trigger("tags", tags).isCancelled()) {
            return;
        }
        if (ChatPlaylist.trigger("tags", tags).isCancelled()) {
            return;
        }
        var list = $("#favorites-tag-list");
        list.empty();
        formatTags(tags);
    },

    /* REGION Polls */
    newPoll: function(data) {
        Callbacks.closePoll();
        var pollMsg = $("<div/>").addClass("poll-notify")
            .html(data.initiator + " opened a poll: \"" + data.title + "\"")
            .appendTo($("#messagebuffer"));
        scrollChat();

        var poll = $("<div/>").addClass("card active").prependTo($("#pollwrap"));
        $("<button/>").addClass("close pull-right").html("&times;")
            .appendTo(poll)
            .click(function() { poll.remove(); });
        if(hasPermission("pollctl")) {
            $("<button/>").addClass("btn btn-danger btn-sm pull-right").text("End Poll")
                .appendTo(poll)
                .click(function() {
                    socket.emit("closePoll")
                });
        }

        $("<h3/>").html(data.title).appendTo(poll);
        for(var i = 0; i < data.options.length; i++) {
            (function(i) {
            var callback = function () {
                socket.emit("vote", {
                    option: i
                });
                poll.find(".option button").each(function() {
                    $(this).attr("disabled", "disabled");
                });
                $(this).parent().addClass("option-selected");
            }
            $("<button/>").addClass("btn btn-default btn-sm").text(data.counts[i])
                .prependTo($("<div/>").addClass("option").html(data.options[i])
                        .appendTo(poll))
                .click(callback);
            })(i);

        }

        poll.find(".btn").attr("disabled", !hasPermission("pollvote"));
    },

    updatePoll: function(data) {
        var poll = $("#pollwrap .active");
        var i = 0;
        poll.find(".option button").each(function() {
            $(this).html(data.counts[i]);
            i++;
        });
    },

    closePoll: function() {
        if($("#pollwrap .active").length != 0) {
            var poll = $("#pollwrap .active");
            poll.removeClass("active").addClass("muted");
            poll.find(".option button").each(function() {
                $(this).attr("disabled", true);
            });
            poll.find(".btn-danger").each(function() {
                $(this).remove()
            });
        }
    },

    listPlaylists: function(data) {
        $("#userpl_list").data("entries", data);
        formatUserPlaylistList();
    },

    emoteList: function (data) {
        if (ChatAPI.trigger("emotes_channel", data).isCancelled()) {
            return;
        }
        
        loadEmotes(data);
        var tbl = $("#cs-emotes table");
        tbl.data("entries", data);
        formatCSEmoteList();
        EMOTELIST.handleChange();
    },

    updateEmote: function (data) {
        data.regex = new RegExp(data.source, "gi");
        var found = false;
        for (var i = 0; i < CHANNEL.emotes.length; i++) {
            if (CHANNEL.emotes[i].name === data.name) {
                found = true;
                CHANNEL.emotes[i] = data;
                formatCSEmoteList();
                break;
            }
        }

        if (!found) {
            CHANNEL.emotes.push(data);
            formatCSEmoteList();
        }
    },

    removeEmote: function (data) {
        var found = -1;
        for (var i = 0; i < CHANNEL.emotes.length; i++) {
            if (CHANNEL.emotes[i].name === data.name) {
                found = i;
                break;
            }
        }

        if (found !== -1) {
            var row = $("code:contains('" + data.name + "')").parent().parent();
            row.hide("fade", row.remove.bind(row));
            CHANNEL.emotes.splice(i, 1);
        }
    },
    
    uploadList: function(data) {
        var tbl = $("#cs-uploadoptions table");
        tbl.data("entries", data);
        formatUploadsList(true);
    },
    
    uploadComplete: function(data) {
        var el = $("#cs-uploadoptions input[type=file]");
        el.replaceWith(el.clone(true));
        var tbl = $("#cs-uploadoptions table");
        var entries = tbl.data("entries") || [];
        var found   = false;
        entries.forEach(function(entry) {
            if (entry.url == data.url) {
                found = true;
                return;
            }
        });
        if (!found) {
            entries.unshift(data);
        }
        
        tbl.data("entries", entries);
        formatUploadsList(false);
        $("#cs-uploadoptions label:first").text("Select file");
        
        
    },
    
    removeUpload: function(data) {
        var tbl     = $("#cs-uploadoptions table");
        var entries = tbl.data("entries") || [];
        var cleaned = [];
        entries.forEach(function(entry) {
            if (entry.url != data.url) {
                cleaned.push(entry);
            }
        });
        tbl.data("entries", cleaned);
        formatUploadsList(false);
    },
    
    userEmoteList: function(data) {
        if (ChatAPI.trigger("emotes_personal", data).isCancelled()) {
            return;
        }

        var tbl = $("#us-user-emotes table");
        tbl.data("entries", data);
        formatUserEmotesList(tbl);
    
        loadUserEmotes(data);
        tbl = $("#cs-emotes table");
        tbl.data("entries", data);
        formatCSEmoteList();
        EMOTELIST.handleChange();
    },
    
    userEmoteComplete: function(data) {
        var ue = $("#us-user-emotes");
        ue.find("input[type=text]:first").val("");
        ue.find("#cs-uploads-url").val("");
        var el = ue.find("input[type=file]:first");
        el.replaceWith(el.clone(true));
    
        var tbl = ue.find("table:first");
        var entries = tbl.data("entries") || [];
        var found   = false;
        entries.forEach(function(entry) {
            if (entry.url == data.url) {
                found = true;
                return;
            }
        });
        if (!found) {
            entries.unshift(data);
        }
        
        tbl.data("entries", entries);
        formatUserEmotesList(tbl);
        ue.find("button:first").prop("disabled", false).html("Upload");
    
        data.source = '(^|\s)' + data.text + '(?!\S)';
        data.name   = data.text;
        data.image  = data.url;
        data.regex = new RegExp(data.source, "gi");
        
        found = false;
        for (var i = 0; i < CLIENT.emotes.length; i++) {
            if (CLIENT.emotes[i].name === data.name) {
                found = true;
                CLIENT.emotes[i] = data;
                formatCSEmoteList();
                break;
            }
        }
    
        if (!found) {
            CLIENT.emotes.push(data);
            formatCSEmoteList();
        }
    },
    
    userEmoteRemove: function(data) {
        var ue      = $("#us-user-emotes");
        var tbl     = ue.find("table:first");
        var entries = tbl.data("entries") || [];
        var cleaned = [];
        entries.forEach(function(entry) {
            if (entry.text != data.text) {
                cleaned.push(entry);
            }
        });
        
        tbl.data("entries", cleaned);
        formatUserEmotesList(tbl);
    },
    
    errorEmote: function(data) {
        var ue = $("#us-user-emotes");
        ue.find("button:first").prop("disabled", false).html("Upload");
        errDialog(data.msg);
    },
    
    chatAttachment: function(data) {
        console.log(data);
        $("#chat-attachment-btn")
            .empty()
            .append('<span class="glyphicon glyphicon-paperclip"></span>');
        if (!ChatAPI.trigger("attachment", data).isCancelled()) {
            addCard(data);
        }
    },
    
    reload: function() {
        location.reload(true);
    },

    warnLargeChandump: function (data) {
        function toHumanReadable(size) {
            if (size > 1048576) {
                return Math.floor((size / 1048576) * 100) / 100 + "MiB";
            } else if (size > 1024) {
                return Math.floor((size / 1024) * 100) / 100 + "KiB";
            } else {
                return size + "B";
            }
        }

        if ($("#chandumptoobig").length > 0) {
            $("#chandumptoobig").remove();
        }

        errDialog("This channel currently exceeds the maximum size of " +
            toHumanReadable(data.limit) + " (channel size is " +
            toHumanReadable(data.actual) + ").  Please reduce the size by removing " +
            "unneeded playlist items, filters, and/or emotes.  Changes to the channel " +
            "will not be saved until the size is reduced to under the limit.")
            .attr("id", "chandumptoobig");
    }
};

var SOCKET_DEBUG = localStorage.getItem('cytube_socket_debug') === 'true';
setupCallbacks = function() {
    for(var key in Callbacks) {
        (function(key) {
            socket.on(key, function(data) {
                if (SOCKET_DEBUG) {
                    console.log(key, data);
                }
                try {
                    Callbacks[key](data);
                } catch (e) {
                    if (SOCKET_DEBUG) {
                        console.log("EXCEPTION: " + e + "\n" + e.stack);
                    }
                }
            });
        })(key);
    }
};

(function () {
    if (typeof io === "undefined") {
        makeAlert("Uh oh!", "It appears the socket.io connection " +
                            "has failed.  If this error persists, a firewall or " +
                            "antivirus is likely blocking the connection, or the " +
                            "server is down.", "alert-danger")
            .appendTo($("#announcements"));
        Callbacks.disconnect();
        return;
    }

    $.getJSON("/socketconfig/" + CHANNEL.name + ".json")
        .done(function (socketConfig) {
            if (socketConfig.error) {
                makeAlert("Error", "Socket.io configuration returned error: " +
                        socketConfig.error, "alert-danger")
                    .appendTo($("#announcements"));
                return;
            }

            var chosenServer = null;
            socketConfig.servers.forEach(function (server) {
                if (chosenServer === null) {
                    chosenServer = server;
                } else if (server.secure && !chosenServer.secure) {
                    chosenServer = server;
                } else if (!server.ipv6Only && chosenServer.ipv6Only) {
                    chosenServer = server;
                }
            });

            if (chosenServer === null) {
                makeAlert("Error",
                        "Socket.io configuration was unable to find a suitable server",
                        "alert-danger")
                    .appendTo($("#announcements"));
            }

            var opts = {
                secure: chosenServer.secure
            };

            socket = io(chosenServer.url, opts);
            setupCallbacks();
        }).fail(function () {
            makeAlert("Error", "Failed to retrieve socket.io configuration",
                    "alert-danger")
                .appendTo($("#announcements"));
            Callbacks.disconnect();
        });
})();