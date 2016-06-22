function makeAlert(title, text, klass) {
    if(!klass) {
        klass = "alert-info";
    }

    var wrap = $("<div/>").addClass("col-md-12");

    var al = $("<div/>").addClass("alert")
        .addClass(klass)
        .html(text)
        .appendTo(wrap);
    $("<br/>").prependTo(al);
    $("<strong/>").text(title).prependTo(al);
    $("<button/>").addClass("close pull-right").html("&times;")
        .click(function() {
            al.hide("fade", function() {
                wrap.remove();
            });
        })
        .prependTo(al);
    return wrap;
}

function formatURL(data) {
    switch(data.type) {
        case "yt":
            return "http://youtube.com/watch?v=" + data.id;
        case "vi":
            return "http://vimeo.com/" + data.id;
        case "dm":
            return "http://dailymotion.com/video/" + data.id;
        case "sc":
            return data.id;
        case "li":
            return "http://livestream.com/" + data.id;
        case "tw":
            return "http://twitch.tv/" + data.id;
        case "rt":
            return data.id;
        case "jw":
            return data.id;
        case "im":
            return "http://imgur.com/a/" + data.id;
        case "us":
            return "http://ustream.tv/" + data.id;
        case "gd":
            return "https://docs.google.com/file/d/" + data.id;
        case "fi":
            return data.id;
        case "hb":
            return "http://hitbox.tv/" + data.id;
        default:
            return "#";
    }
}

function findUserlistItem(name) {
    var children = $("#userlist .userlist_item");
    if(children.length == 0)
        return null;
    name = name.toLowerCase();
    // WARNING: Incoming hax because of jQuery and bootstrap bullshit
    var keys = Object.keys(children);
    for(var k in keys) {
        var i = keys[k];
        if(isNaN(parseInt(i))) {
            continue;
        }
        var child = children[i];
        if($(child.children[1]).text().toLowerCase() == name)
            return $(child);
    }
    return null;
}

function formatUserlistItem(div) {
    var data = {
        name: div.data("name") || "",
        rank: div.data("rank"),
        profile: div.data("profile") || { image: "", text: ""},
        leader: div.data("leader") || false,
        icon: div.data("icon") || false,
        afk: div.data("afk") || false
    };
    var name = $(div.children()[1]);
    name.removeClass();
    name.css("font-style", "");
    name.addClass(getNameColor(data.rank));
    div.find(".profile-box").remove();

    if (data.afk) {
        div.addClass("userlist_afk");
    } else {
        div.removeClass("userlist_afk");
    }

    if (div.data("meta") && div.data("meta").muted) {
        div.addClass("userlist_muted");
    } else {
        div.removeClass("userlist_muted");
    }

    if (div.data("meta") && div.data("meta").smuted) {
        div.addClass("userlist_smuted");
    } else {
        div.removeClass("userlist_smuted");
    }

    var profile = null;
    /*
     * 2015-10-19
     * Prevent rendering unnecessary duplicates of the profile box when
     * a user's status changes.
     */
    name.unbind("mouseenter");
    name.unbind("mousemove");
    name.unbind("mouseleave");

    name.mouseenter(function(ev) {
        if (profile)
            profile.remove();

        var top = ev.clientY + 5;
        var horiz = ev.clientX;
        profile = $("<div/>")
            .addClass("profile-box linewrap")
            .css("top", top + "px")
            .appendTo(div);

        if(data.profile.image) {
            $("<img/>").addClass("profile-image")
                .attr("src", data.profile.image)
                .appendTo(profile);
        }
        $("<strong/>").text(data.name).appendTo(profile);

        var meta = div.data("meta") || {};
        if (meta.ip) {
            $("<br/>").appendTo(profile);
            $("<em/>").text(meta.ip).appendTo(profile);
        }
        if (meta.aliases) {
            $("<br/>").appendTo(profile);
            $("<em/>").text("aliases: " + meta.aliases.join(", ")).appendTo(profile);
        }
        $("<hr/>").css("margin-top", "5px").css("margin-bottom", "5px").appendTo(profile);
        $("<p/>").text(data.profile.text).appendTo(profile);

        if ($("body").hasClass("synchtube")) horiz -= profile.outerWidth();
        profile.css("left", horiz + "px");
        
        
    });
    name.mousemove(function(ev) {
        var top = ev.clientY + 5;
        var horiz = ev.clientX;

        if ($("body").hasClass("synchtube")) horiz -= profile.outerWidth();
        profile.css("left", horiz + "px")
            .css("top", top + "px");
    });
    name.mouseleave(function() {
        profile.remove();
    });
    var icon = div.children()[0];
    icon.innerHTML = "";
    // denote current leader with a star
    if(data.leader) {
        $("<span/>").addClass("glyphicon glyphicon-star-empty").appendTo(icon);
    }
    if(data.afk) {
        name.css("font-style", "italic");
        $("<span/>").addClass("glyphicon glyphicon-time").appendTo(icon);
    }
    if (data.icon) {
        $("<span/>").addClass("glyphicon " + data.icon).prependTo(icon);
    }
}

function getNameColor(rank) {
    if(rank >= Rank.Siteadmin)
        return "userlist_siteadmin";
    else if(rank >= Rank.Admin)
        return "userlist_owner";
    else if(rank >= Rank.Moderator)
        return "userlist_op";
    else if(rank == Rank.Guest)
        return "userlist_guest";
    else
        return "";
}

function addUserDropdown(entry) {
    var name = entry.data("name"),
        rank = entry.data("rank"),
        leader = entry.data("leader"),
        meta = entry.data("meta") || {};
    entry.find(".user-dropdown").remove();
    var menu = $("<div/>")
        .addClass("user-dropdown")
        .data("name", name)
        .appendTo(entry)
        .hide();

    $("<strong/>").text(name).appendTo(menu);
    $("<br/>").appendTo(menu);

    var btngroup = $("<div/>").addClass("btn-group-vertical").appendTo(menu);
    
    /* profile button */
    if (rank > 0) {
        var profile = $("<button/>")
            .addClass("btn btn-xs btn-default")
            .text("Profile")
            .appendTo(btngroup);
        profile.click(function () {
            window.open("/user/" + name);
        });
    }

    /* ignore button */
    var ignore = $("<button/>").addClass("btn btn-xs btn-default")
        .appendTo(btngroup)
        .click(function () {
            if(IGNORED.indexOf(name) == -1) {
                ignore.text("Unignore User");
                IGNORED.push(name);
            } else {
                ignore.text("Ignore User");
                IGNORED.splice(IGNORED.indexOf(name), 1);
            }
        });
    if(IGNORED.indexOf(name) == -1) {
        ignore.text("Ignore User");
    } else {
        ignore.text("Unignore User");
    }

    /* pm button */
    if (name !== CLIENT.name) {
        var pm = $("<button/>").addClass("btn btn-xs btn-default")
            .text("Private Message")
            .appendTo(btngroup)
            .click(function () {
                var pm = initPm(name);
                var prev_msgs = ChatStore.local.get("pm_with_" + name);
                
                var buffer = pm.find(".pm-buffer");
                if (!prev_msgs) {
                    prev_msgs = [];
                }
                if (prev_msgs.length > 0) {
                    for(var i = 0; i < prev_msgs.length; i++) {
                        var prev_msg = formatChatMessage(prev_msgs[i], pm.data("last"));
                        prev_msg.appendTo(buffer);
                    }
                }
                
                pm.find(".panel-heading").click();
                menu.hide();
                buffer.scrollTop(buffer.prop("scrollHeight"));
            });
    }

    /* give/remove leader (moderator+ only) */
    if (hasPermission("leaderctl")) {
        var ldr = $("<button/>").addClass("btn btn-xs btn-default")
            .appendTo(btngroup);
        if(leader) {
            ldr.text("Remove Leader");
            ldr.click(function () {
                socket.emit("assignLeader", {
                    name: ""
                });
            });
        } else {
            ldr.text("Give Leader");
            ldr.click(function () {
                socket.emit("assignLeader", {
                    name: name
                });
            });
        }
    }

    /* kick button */
    if(hasPermission("kick")) {
        $("<button/>").addClass("btn btn-xs btn-default")
            .text("Kick")
            .click(function () {
                var reason = prompt("Enter kick reason (optional)");
                if (reason === null) {
                    return;
                }
                socket.emit("chatMsg", {
                    msg: "/kick " + name + " " + reason,
                    meta: {}
                });
            })
            .appendTo(btngroup);
    }

    /* mute buttons */
    if (hasPermission("mute")) {
        var mute = $("<button/>").addClass("btn btn-xs btn-default")
            .text("Mute")
            .click(function () {
                socket.emit("chatMsg", {
                    msg: "/mute " + name,
                    meta: {}
                });
            })
            .appendTo(btngroup);
        var smute = $("<button/>").addClass("btn btn-xs btn-default")
            .text("Shadow Mute")
            .click(function () {
                socket.emit("chatMsg", {
                    msg: "/smute " + name,
                    meta: {}
                });
            })
            .appendTo(btngroup);
        var unmute = $("<button/>").addClass("btn btn-xs btn-default")
            .text("Unmute")
            .click(function () {
                socket.emit("chatMsg", {
                    msg: "/unmute " + name,
                    meta: {}
                });
            })
            .appendTo(btngroup);
        if (meta.muted) {
            mute.hide();
            smute.hide();
        } else {
            unmute.hide();
        }
    }

    /* ban buttons */
    if(hasPermission("ban")) {
        $("<button/>").addClass("btn btn-xs btn-default")
            .text("Name Ban")
            .click(function () {
                var reason = prompt("Enter ban reason (optional)");
                if (reason === null) {
                    return;
                }
                socket.emit("chatMsg", {
                    msg: "/ban " + name + " " + reason,
                    meta: {}
                });
            })
            .appendTo(btngroup);
        $("<button/>").addClass("btn btn-xs btn-default")
            .text("IP Ban")
            .click(function () {
                var reason = prompt("Enter ban reason (optional)");
                if (reason === null) {
                    return;
                }
                socket.emit("chatMsg", {
                    msg: "/ipban " + name + " " + reason,
                    meta: {}
                });
            })
            .appendTo(btngroup);
    }

    var showdd = function(ev) {
        // Workaround for Chrome
        if (ev.shiftKey) return true;
        ev.preventDefault();
        if(menu.css("display") == "none") {
            $(".user-dropdown").hide();
            $(document).bind("mouseup.userlist-ddown", function (e) {
                if (menu.has(e.target).length === 0 &&
                    entry.parent().has(e.target).length === 0) {
                    menu.hide();
                    $(document).unbind("mouseup.userlist-ddown");
                }
            });
            menu.show();
            menu.css("top", entry.position().top);
        } else {
            menu.hide();
        }
        return false;
    };
    entry.contextmenu(showdd);
    entry.click(showdd);
    
    ChatAPI.trigger("profile_menu", menu);
}

function calcUserBreakdown() {
    var breakdown = {
        "Site Admins": 0,
        "Channel Admins": 0,
        "Moderators": 0,
        "Regular Users": 0,
        "Guests": 0,
        "Anonymous": 0,
        "AFK": 0
    };
    var total = 0;
    $("#userlist .userlist_item").each(function (index, item) {
        var data = {
            rank: $(item).data("rank")
        };

        if(data.rank >= 255)
            breakdown["Site Admins"]++;
        else if(data.rank >= 3)
            breakdown["Channel Admins"]++;
        else if(data.rank == 2)
            breakdown["Moderators"]++;
        else if(data.rank >= 1)
            breakdown["Regular Users"]++;
        else
            breakdown["Guests"]++;

        total++;

        if($(item).data("afk"))
            breakdown["AFK"]++;
    });

    breakdown["Anonymous"] = CHANNEL.usercount - total;

    return breakdown;
}

function sortUserlist() {
    var slice = Array.prototype.slice;
    var list = slice.call($("#userlist .userlist_item"));
    list.sort(function (a, b) {
        var r1 = $(a).data("rank");
        var r2 = $(b).data("rank");
        var afk1 = $(a).find(".glyphicon-time").length > 0;
        var afk2 = $(b).find(".glyphicon-time").length > 0;
        var name1 = a.children[1].innerHTML.toLowerCase();
        var name2 = b.children[1].innerHTML.toLowerCase();

        if(USEROPTS.sort_afk) {
            if(afk1 && !afk2)
                return 1;
            if(!afk1 && afk2)
                return -1;
        }

        if(USEROPTS.sort_rank) {
            if(r1 < r2)
                return 1;
            if(r1 > r2)
                return -1;
        }

        return name1 === name2 ? 0 : (name1 < name2 ? -1 : 1);
    });

    list.forEach(function (item) {
        $(item).detach();
    });
    list.forEach(function (item) {
        $(item).appendTo($("#userlist"));
    });
}

/* queue stuff */

function scrollQueue() {
    var li = playlistFind(PL_CURRENT);
    if(!li)
        return;

    li = $(li);
    $("#queue").scrollTop(0);
    var scroll = li.position().top - $("#queue").position().top;
    $("#queue").scrollTop(scroll);
}

function makeQueueEntry(item, addbtns) {
    var video = item.media;
    var li = $("<li/>");
    li.addClass("queue_entry");
    li.addClass("pluid-" + item.uid);
    li.data("pluid", item.uid);
    li.addClass("queue_entry_by_" + item.queueby.replace("@", ""));
    li.data("uid", item.uid);
    li.data("media", video);
    li.data("temp", item.temp);
	li.data("queueby", item.queueby);
    if(video.thumb) {
        $("<img/>").attr("src", video.thumb.url)
            .css("float", "left")
            .css("clear", "both")
            .appendTo(li);
    }
    var title = $("<a/>").addClass("qe_title").appendTo(li)
        .text(video.title)
        .attr("href", formatURL(video))
        .attr("target", "_blank");
    var time = $("<span/>").addClass("qe_time").appendTo(li);
    if (item.queueby) {
        if (item.queueby[0] == "@") {
            item.queueby = item.queueby.substring(1);
            time.html("<span class='glyphicon glyphicon-refresh requeue-icon' title='This track was chosen automatically, but was originally queued in this channel by " + item.queueby + ".'></span> " + item.queueby + " &middot; " + video.duration);
        } else {
            time.html(item.queueby + " &middot; " + video.duration);
        }
    } else {
        time.html(video.duration);
    }
    var clear = $("<div/>").addClass("qe_clear").appendTo(li);
    if(item.temp) {
        li.addClass("queue_temp");
    }
	if (CLIENT.name === item.queueby) 
		addbtns = true;
    if(addbtns)
        addQueueButtons(li);
    return li;
}

function makeSearchEntry(video) {
    var li = $("<li/>");
    li.addClass("queue_entry");
    li.data("media", video);
    if(video.thumb) {
        $("<img/>").attr("src", video.thumb.url)
            .css("float", "left")
            .css("clear", "both")
            .appendTo(li);
    }
    var title = $("<a/>").addClass("qe_title").appendTo(li)
        .text(video.title)
        .attr("href", formatURL(video))
        .attr("target", "_blank");
    var time = $("<span/>").addClass("qe_time").appendTo(li);
    time.text(video.duration);
    var clear = $("<div/>").addClass("qe_clear").appendTo(li);

    return li;
}

function addQueueButtons(li) {
    li.find(".btn-group").remove();
    var menu = $("<div/>").addClass("btn-group").appendTo(li);
    // Play
    if(hasPermission("playlistjump")) {
        $("<button/>").addClass("btn btn-xs btn-default qbtn-play")
            .html("Play")
            .click(function() {
                socket.emit("jumpTo", li.data("uid"));
            })
            .appendTo(menu);
    }
    // Queue next
    if(hasPermission("playlistmove")) {
        $("<button/>").addClass("btn btn-xs btn-default qbtn-next")
            .html("Queue Next")
            .click(function() {
                socket.emit("moveMedia", {
                    from: li.data("uid"),
                    after: PL_CURRENT
                });
            })
            .appendTo(menu);
    }
    // Temp/Untemp
    if(hasPermission("settemp")) {
        var tempstr = li.data("temp")?"Make Permanent":"Make Temporary";
        $("<button/>").addClass("btn btn-xs btn-default qbtn-tmp")
            .html(tempstr)
            .click(function() {
                socket.emit("setTemp", {
                    uid: li.data("uid"),
                    temp: !li.data("temp")
                });
            })
            .appendTo(menu);
    }
    // Delete
    if((hasPermission("playlistdelete")) || (CLIENT.name === li.data("queueby"))) {
        $("<button/>").addClass("btn btn-xs btn-default qbtn-delete")
            .html("Delete")
            .click(function() {
                socket.emit("delete", li.data("uid"));
            })
            .appendTo(menu);
    }

    if(USEROPTS.qbtn_hide && !USEROPTS.qbtn_idontlikechange
        || menu.find(".btn").length == 0)
        menu.hide();

    // I DON'T LIKE CHANGE
    if(USEROPTS.qbtn_idontlikechange) {
        menu.addClass("pull-left");
        menu.detach().prependTo(li);
        menu.find(".btn").each(function() {
            // Clear icon
            var icon = $(this).find(".glyphicon");
            $(this).html("");
            icon.appendTo(this);
        });
        menu.find(".qbtn-play").addClass("btn-success");
        menu.find(".qbtn-delete").addClass("btn-danger");
    }
    else if(menu.find(".btn").length != 0) {
        li.unbind("contextmenu");
        li.contextmenu(function(ev) {
            // Allow shift+click to open context menu
            // (Chrome workaround, works by default on Firefox)
            if (ev.shiftKey) return true;
            ev.preventDefault();
            if(menu.css("display") == "none")
                menu.show("blind");
            else
                menu.hide("blind");
            return false;
        });
    }
}

function rebuildPlaylist() {
    var qli = $("#queue li");
    if(qli.length == 0)
        return;
    REBUILDING = Math.random() + "";
    var r = REBUILDING;
    var i = 0;
    qli.each(function() {
        var li = $(this);
        (function(i, r) {
            setTimeout(function() {
                // Stop if another rebuild is running
                if(REBUILDING != r)
                    return;
                addQueueButtons(li);
                if(i == qli.length - 1) {
                    scrollQueue();
                    REBUILDING = false;
                }
            }, 10*i);
        })(i, r);
        i++;
    });
}

/* menus */

/* user settings menu */
function showUserOptions() {
    hidePlayer();
    $("#useroptions").on("hidden.bs.modal", function () {
        unhidePlayer();
    });
    
    if (CLIENT.rank < 2) {
        $("a[href='#us-mod']").parent().hide();
    } else {
        $("a[href='#us-mod']").parent().show();
    }
    
    if (!CLIENT.logged_in) {
        $("#us-user-emotes-tab").remove();
        $("#us-user-emotes").remove();
    }
    
    $("#us-no-channelcss").prop("checked", USEROPTS.ignore_channelcss);
    $("#us-no-channeljs").prop("checked", USEROPTS.ignore_channeljs);
    $("#us-hide-channelbg").prop("checked", USEROPTS.hide_channelbg);

    $("#us-synch").prop("checked", USEROPTS.synch);
    $("#us-synch-accuracy").val(USEROPTS.sync_accuracy);
    $("#us-wmode-transparent").prop("checked", USEROPTS.wmode_transparent);
    $("#us-hidevideo").prop("checked", USEROPTS.hidevid);
    $("#us-playlistbuttons").prop("checked", USEROPTS.qbtn_hide);
    $("#us-oldbtns").prop("checked", USEROPTS.qbtn_idontlikechange);
    $("#us-default-quality").val(USEROPTS.default_quality || "auto");

    $("#us-chat-colors").prop("checked", USEROPTS.show_colors);
    $("#us-chat-timestamp").prop("checked", USEROPTS.show_timestamps);
    $("#us-chat-joins").prop("checked", USEROPTS.show_joins);
    $("#us-chat-notices").prop("checked", USEROPTS.show_notices);
    $("#us-sort-rank").prop("checked", USEROPTS.sort_rank);
    $("#us-sort-afk").prop("checked", USEROPTS.sort_afk);
    $("#us-blink-title").val(USEROPTS.blink_title);
    $("#us-ping-sound").val(USEROPTS.boop);
    $("#us-sendbtn").prop("checked", USEROPTS.chatbtn);
    $("#us-no-emotes").prop("checked", USEROPTS.no_emotes);

    $("#us-modflair").prop("checked", USEROPTS.modhat);
    $("#us-joinmessage").prop("checked", USEROPTS.joinmessage);
    $("#us-shadowchat").prop("checked", USEROPTS.show_shadowchat);
    $("#us-highlight").val(USEROPTS.highlight);

    formatScriptAccessPrefs();

    $("a[href='#us-chat']").click();
    $("#useroptions").modal();
}

function saveUserOptions() {
    USEROPTS.ignore_channelcss    = $("#us-no-channelcss").prop("checked");
    USEROPTS.ignore_channeljs     = $("#us-no-channeljs").prop("checked");
    USEROPTS.hide_channelbg       = $("#us-hide-channelbg").prop("checked");
    USEROPTS.secure_connection    = $("#us-ssl").prop("checked");

    USEROPTS.synch                = $("#us-synch").prop("checked");
    USEROPTS.sync_accuracy        = parseFloat($("#us-synch-accuracy").val()) || 2;
    USEROPTS.wmode_transparent    = $("#us-wmode-transparent").prop("checked");
    USEROPTS.hidevid              = $("#us-hidevideo").prop("checked");
    USEROPTS.qbtn_hide            = $("#us-playlistbuttons").prop("checked");
    USEROPTS.qbtn_idontlikechange = $("#us-oldbtns").prop("checked");
    USEROPTS.default_quality      = $("#us-default-quality").val();

    USEROPTS.show_colors          = $("#us-chat-colors").prop("checked");
    USEROPTS.show_timestamps      = $("#us-chat-timestamp").prop("checked");
    USEROPTS.show_joins           = $("#us-chat-joins").prop("checked");
    USEROPTS.show_notices         = $("#us-chat-notices").prop("checked");
    USEROPTS.sort_rank            = $("#us-sort-rank").prop("checked");
    USEROPTS.sort_afk             = $("#us-sort-afk").prop("checked");
    USEROPTS.blink_title          = $("#us-blink-title").val();
    USEROPTS.boop                 = $("#us-ping-sound").val();
    USEROPTS.chatbtn              = $("#us-sendbtn").prop("checked");
    USEROPTS.no_emotes            = $("#us-no-emotes").prop("checked");
    USEROPTS.highlight            = $("#us-highlight").val();
    
    if (USEROPTS.highlight.trim().length > 0) {
        var split = USEROPTS.highlight.split(",")
            .map(Function.prototype.call, String.prototype.trim);
        USEROPTS.highlight_regex = new RegExp('\\b(' + split.join("|") + ')\\b', 'i');
    }
    
    if (CLIENT.rank >= 2) {
        USEROPTS.modhat      = $("#us-modflair").prop("checked");
        USEROPTS.joinmessage = $("#us-joinmessage").prop("checked");
        USEROPTS.show_shadowchat = $("#us-shadowchat").prop("checked");
    }
    
    ChatAPI._saveUserScripts();
    if (!ChatAPI.trigger("user_options_save", USEROPTS).isCancelled()) {
        storeOpts();
        applyOpts();
    }
}

function storeOpts() {
    for(var key in USEROPTS) {
        setOpt(key, USEROPTS[key]);
    }
}

function applyOpts() {
    switch (USEROPTS.layout) {
        case "synchtube-fluid":
            fluidLayout();
        case "synchtube":
            synchtubeLayout();
            break;
        case "fluid":
            fluidLayout();
            break;
        case "hd":
            hdLayout();
            break;
        default:
            compactLayout();
            break;
    }

    if(USEROPTS.hidevid) {
        removeVideo();
    }

    $("#chatbtn").remove();
    if(USEROPTS.chatbtn) {
        var btn = $("<button/>").addClass("btn btn-default btn-block")
            .text("Send")
            .attr("id", "chatbtn")
            .appendTo($("#chatwrap"));
        btn.click(function() {
            if($("#chatline").val().trim()) {
                socket.emit("chatMsg", {
                    msg: $("#chatline").val(),
                    meta: {}
                });
                $("#chatline").val("");
            }
        });
    }

    if (USEROPTS.modhat) {
        $("#modflair").removeClass("label-default")
            .addClass("label-success");
    } else {
        $("#modflair").removeClass("label-success")
            .addClass("label-default");
    }
}

function showBio() {
    var bio = $("#bio");
    if (bio.is(":visible")) {
        bio.hide();
    } else {
        bio.show();
    }
}

function showPollMenu() {
    $("#pollwrap .poll-menu").remove();
    var menu = $("<div/>").addClass("well poll-menu")
        .prependTo($("#pollwrap"));

    $("<button/>").addClass("btn btn-sm btn-danger pull-right")
        .text("Cancel")
        .appendTo(menu)
        .click(function() {
            menu.remove();
        });

    $("<strong/>").text("Title").appendTo(menu);

    var title = $("<input/>").addClass("form-control")
        .attr("type", "text")
        .appendTo(menu);

    $("<strong/>").text("Timeout (optional)").appendTo(menu);
    var timeout = $("<input/>").addClass("form-control")
        .attr("type", "text")
        .appendTo(menu);

    var checkboxOuter = $("<div/>").addClass("checkbox").appendTo(menu);
    var lbl = $("<label/>").text("Hide poll results")
        .appendTo(checkboxOuter);
    var hidden = $("<input/>").attr("type", "checkbox")
        .prependTo(lbl);

    $("<strong/>").text("Options").appendTo(menu);

    var addbtn = $("<button/>").addClass("btn btn-sm btn-default")
        .text("Add Option")
        .appendTo(menu);

    function addOption() {
        $("<input/>").addClass("form-control")
            .attr("type", "text")
            .addClass("poll-menu-option")
            .insertBefore(addbtn);
    }

    addbtn.click(addOption);
    addOption();
    addOption();

    $("<button/>").addClass("btn btn-default btn-block")
        .text("Open Poll")
        .appendTo(menu)
        .click(function() {
            var opts = [];
            menu.find(".poll-menu-option").each(function() {
                if($(this).val() != "")
                    opts.push($(this).val());
            });
            socket.emit("newPoll", {
                title: title.val(),
                opts: opts,
                obscured: hidden.prop("checked"),
                timeout: timeout.val() ? parseInt(timeout.val()) : undefined
            });
            menu.remove();
        });
}

function scrollChat() {
    scrollAndIgnoreEvent($("#messagebuffer").prop("scrollHeight"));
    $("#newmessages-indicator").remove();
}

function scrollAndIgnoreEvent(top) {
    IGNORE_SCROLL_EVENT = true;
    $("#messagebuffer").scrollTop(top);
}

function hasPermission(key) {
    if(key.indexOf("playlist") == 0 && CHANNEL.openqueue) {
        var key2 = "o" + key;
        var v = CHANNEL.perms[key2];
        if(typeof v == "number" && CLIENT.rank >= v) {
            return true;
        }
    }
    var v = CHANNEL.perms[key];
    if(typeof v != "number") {
        return false;
    }
    return CLIENT.rank >= v;
}

function setVisible(selector, bool) {
    // I originally added this check because of a race condition
    // Now it seems to work without but I don't trust it
    if($(selector) && $(selector).attr("id") != selector.substring(1)) {
        setTimeout(function() {
            setVisible(selector, bool);
        }, 100);
        return;
    }
    var disp = bool ? "" : "none";
    $(selector).css("display", disp);
}

function setParentVisible(selector, bool) {
    var disp = bool ? "" : "none";
    $(selector).parent().css("display", disp);
}

function handleModPermissions() {
    $("#cs-chanranks-adm").attr("disabled", CLIENT.rank < 4);
    $("#cs-chanranks-owner").attr("disabled", CLIENT.rank < 4);
    /* update channel controls */
    $("#cs-pagetitle").val(CHANNEL.opts.pagetitle);
    $("#cs-pagetitle").attr("disabled", CLIENT.rank < 3);
    $("#cs-externalcss").val(CHANNEL.opts.externalcss);
    $("#cs-externalcss").attr("disabled", CLIENT.rank < 3);
    $("#cs-externaljs").val(CHANNEL.opts.externaljs);
    $("#cs-externaljs").attr("disabled", CLIENT.rank < 3);
    $("#cs-chat_antiflood").prop("checked", CHANNEL.opts.chat_antiflood);
    if ("chat_antiflood_params" in CHANNEL.opts) {
        $("#cs-chat_antiflood_burst").val(CHANNEL.opts.chat_antiflood_params.burst);
        $("#cs-chat_antiflood_sustained").val(CHANNEL.opts.chat_antiflood_params.sustained);
    }
    $("#cs-show_public").prop("checked", CHANNEL.opts.show_public);
    $("#cs-show_public").attr("disabled", CLIENT.rank < 3);
    $("#cs-password").val(CHANNEL.opts.password || "");
    $("#cs-password").attr("disabled", CLIENT.rank < 3);
    $("#cs-enable_link_regex").prop("checked", CHANNEL.opts.enable_link_regex);
    $("#cs-afk_timeout").val(CHANNEL.opts.afk_timeout);
    $("#cs-allow_voteskip").prop("checked", CHANNEL.opts.allow_voteskip);
    $("#cs-voteskip_ratio").val(CHANNEL.opts.voteskip_ratio);
    $("#cs-rngmod_count").val(CHANNEL.opts.rngmod_count);
    $("#cs-thumbnail").val(CHANNEL.opts.thumbnail);
    $("#cs-background_url").val(CHANNEL.opts.background_url);
    $("#cs-background_repeat").val(CHANNEL.opts.background_repeat);
    $("#cs-join_msg").val(CHANNEL.opts.join_msg);
    $("#cs-allow_dupes").prop("checked", CHANNEL.opts.allow_dupes);
    $("#cs-torbanned").prop("checked", CHANNEL.opts.torbanned);
    $("#cs-allow_ascii_control").prop("checked", CHANNEL.opts.allow_ascii_control);
    $("#cs-playlist_max_per_user").val(CHANNEL.opts.playlist_max_per_user || 0);
    (function() {
        if(typeof CHANNEL.opts.maxlength != "number") {
            $("#cs-maxlength").val("");
            return;
        }
        var h = parseInt(CHANNEL.opts.maxlength / 3600);
        h = ""+h;
        if(h.length < 2) h = "0" + h;
        var m = parseInt((CHANNEL.opts.maxlength % 3600) / 60);
        m = ""+m;
        if(m.length < 2) m = "0" + m;
        var s = parseInt(CHANNEL.opts.maxlength % 60);
        s = ""+s;
        if(s.length < 2) s = "0" + s;
        $("#cs-maxlength").val(h + ":" + m + ":" + s);
    })();
    $("#cs-csstext").val(CHANNEL.css);
    $("#cs-jstext").val(CHANNEL.js);
    $("#cs-motdtext").val(CHANNEL.motd);
    setParentVisible("a[href='#cs-motdeditor']", hasPermission("motdedit"));
    setParentVisible("a[href='#cs-permedit']", CLIENT.rank >= 3);
    setParentVisible("a[href='#cs-banlist']", hasPermission("ban"));
    setParentVisible("a[href='#cs-csseditor']", CLIENT.rank >= 3);
    setParentVisible("a[href='#cs-jseditor']", CLIENT.rank >= 3);
    setParentVisible("a[href='#cs-chatfilters']", hasPermission("filteredit"));
    setParentVisible("a[href='#cs-emotes']", hasPermission("emoteedit"));
    setParentVisible("a[href='#cs-chanranks']", CLIENT.rank >= 3);
    setParentVisible("a[href='#cs-chanlog']", CLIENT.rank >= 3);
    $("#cs-chatfilters-import").attr("disabled", !hasPermission("filterimport"));
    $("#cs-emotes-import").attr("disabled", !hasPermission("filterimport"));
}

function handlePermissionChange() {
    if(CLIENT.rank >= 2) {
        handleModPermissions();
    }

    $("#qlockbtn").attr("disabled", !hasPermission("playlistlock"));
    setVisible("#showchansettings", CLIENT.rank >= 2);
    setVisible("#playlistmanagerwrap", CLIENT.rank >= 1);
    setVisible("#modflair", CLIENT.rank >= 2);
    setVisible("#guestlogin", CLIENT.rank < 0);
    setVisible("#chatline", CLIENT.rank >= 0);
    setVisible("#queue", hasPermission("seeplaylist"));
    setVisible("#plmeta", hasPermission("seeplaylist"));
    $("#getplaylist").attr("disabled", !hasPermission("seeplaylist"));

    setVisible("#showplaylistmanager", hasPermission("seeplaylist"));
    setVisible("#showmediaurl", hasPermission("playlistadd"));
    setVisible("#showcustomembed", hasPermission("playlistaddcustom"));
    $("#queue_next").attr("disabled", !hasPermission("playlistnext"));

    if(hasPermission("playlistadd") ||
        hasPermission("playlistmove") ||
        hasPermission("playlistjump") ||
        hasPermission("playlistdelete") ||
        hasPermission("settemp")) {
        if(USEROPTS.first_visit && $("#plonotification").length == 0) {
            var al = makeAlert("Playlist Options", [
                "From the Options menu, you can choose to automatically",
                " hide the buttons on each entry (and show them when",
                " you right click).  You can also choose to use the old",
                " style of playlist buttons.",
                "<br>"].join(""))
                .attr("id", "plonotification")
                .insertAfter($("#queuefail"));

            al.find(".close").remove();

            $("<button/>").addClass("btn btn-primary")
                .text("Dismiss")
                .appendTo(al.find(".alert"))
                .click(function() {
                    USEROPTS.first_visit = false;
                    storeOpts();
                    al.hide("fade", function() {
                        al.remove();
                    });
                });
        }
    }

    if(hasPermission("playlistmove")) {
        $("#queue").sortable("enable");
        $("#queue").addClass("queue_sortable");
    }
    else {
        $("#queue").sortable("disable");
        $("#queue").removeClass("queue_sortable");
    }

    setVisible("#clearplaylist", hasPermission("playlistclear"));
    setVisible("#shuffleplaylist", hasPermission("playlistshuffle"));
    if (!hasPermission("addnontemp")) {
        $(".add-temp").prop("checked", true);
        $(".add-temp").attr("disabled", true);
    } else {
        $(".add-temp").attr("disabled", false);
    }

    fixWeirdButtonAlignmentIssue();
    
    setVisible("#us-scripting-tab", hasPermission("scripting"));
    setVisible("#us-scripting", hasPermission("scripting"));

    setVisible("#newpollbtn", hasPermission("pollctl"));
    $("#voteskip").attr("disabled", !hasPermission("voteskip") ||
                                    !CHANNEL.opts.allow_voteskip);

    $("#pollwrap .active").find(".btn-danger").remove();
    if(hasPermission("pollctl")) {
        var poll = $("#pollwrap .active");
        if(poll.length > 0) {
            $("<button/>").addClass("btn btn-danger pull-right")
                .text("End Poll")
                .insertAfter(poll.find(".close"))
                .click(function() {
                    socket.emit("closePoll");
                });
        }
    }
    var poll = $("#pollwrap .active");
    if(poll.length > 0) {
        poll.find(".btn").attr("disabled", !hasPermission("pollvote"));
    }
    var users = $("#userlist").children();
    for(var i = 0; i < users.length; i++) {
        addUserDropdown($(users[i]));
    }

    $("#chatline").attr("disabled", !hasPermission("chat"));
    rebuildPlaylist();
}

function fixWeirdButtonAlignmentIssue() {
    // Weird things happen to the alignment in chromium when I toggle visibility
    // of the above buttons
    // This fixes it?
    var wtf = $("#videocontrols").removeClass("pull-right");
    setTimeout(function () {
        wtf.addClass("pull-right");
    }, 1);
}

/* search stuff */

function clearSearchResults() {
    $("#library").html("");
    $("#search_clear").remove();
    var p = $("#library").data("paginator");
    if(p) {
        p.paginator.html("");
    }
}

function addLibraryButtons(li, id, source) {
    var btns = $("<div/>").addClass("btn-group")
        .addClass("pull-left")
        .prependTo(li);

    var type = (source === "library") ? "lib" : source;

    if(hasPermission("playlistadd")) {
        if(hasPermission("playlistnext")) {
            $("<button/>").addClass("btn btn-xs btn-default")
                .text("Next")
                .click(function() {
                    socket.emit("queue", {
                        id: id,
                        pos: "next",
                        type: type,
                        temp: $(".add-temp").prop("checked")
                    });
                })
                .appendTo(btns);
        }
        $("<button/>").addClass("btn btn-xs btn-default")
            .text("End")
            .click(function() {
                socket.emit("queue", {
                    id: id,
                    pos: "end",
                    type: type,
                    temp: $(".add-temp").prop("checked")
                });
            })
            .appendTo(btns);
    }
    if(CLIENT.rank >= 2 && source === "library") {
        $("<button/>").addClass("btn btn-xs btn-danger")
            .html("<span class='glyphicon glyphicon-trash'></span>")
            .click(function() {
                socket.emit("uncache", {
                    id: id
                });
                li.hide("fade", function() {
                    li.remove();
                });
            })
            .appendTo(btns);
    }
}

/* queue stuff */

var AsyncQueue = function () {
    this._q = [];
    this._lock = false;
    this._tm = 0;
};

AsyncQueue.prototype.next = function () {
    if (this._q.length > 0) {
        if (!this.lock())
            return;
        var item = this._q.shift();
        var fn = item[0], tm = item[1];
        this._tm = Date.now() + item[1];
        fn(this);
    }
};

AsyncQueue.prototype.lock = function () {
    if (this._lock) {
        if (this._tm > 0 && Date.now() > this._tm) {
            this._tm = 0;
            return true;
        }
        return false;
    }

    this._lock = true;
    return true;
};

AsyncQueue.prototype.release = function () {
    var self = this;
    if (!self._lock)
        return false;

    self._lock = false;
    self.next();
    return true;
};

AsyncQueue.prototype.queue = function (fn) {
    var self = this;
    self._q.push([fn, 20000]);
    self.next();
};

AsyncQueue.prototype.reset = function () {
    this._q = [];
    this._lock = false;
};

var PL_ACTION_QUEUE = new AsyncQueue();

// Because jQuery UI does weird things
function playlistFind(uid) {
    var children = document.getElementById("queue").children;
    for(var i in children) {
        if(typeof children[i].getAttribute != "function")
            continue;
        if(children[i].getAttribute("class").indexOf("pluid-" + uid) != -1)
            return children[i];
    }
    return false;
}

function playlistMove(from, after, cb) {
    var lifrom = $(".pluid-" + from);
    if(lifrom.length == 0) {
        cb(false);
        return;
    }

    var q = $("#queue");

    if(after === "prepend") {
        lifrom.hide("blind", function() {
            lifrom.detach();
            lifrom.prependTo(q);
            lifrom.show("blind", cb);
        });
    }
    else if(after === "append") {
        lifrom.hide("blind", function() {
            lifrom.detach();
            lifrom.appendTo(q);
            lifrom.show("blind", cb);
        });
    }
    else {
        var liafter = $(".pluid-" + after);
        if(liafter.length == 0) {
            cb(false);
            return;
        }
        lifrom.hide("blind", function() {
            lifrom.detach();
            lifrom.insertAfter(liafter);
            lifrom.show("blind", cb);
        });
    }
}

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

function sendVideoUpdate() {
    if (!CLIENT.leader) {
        return;
    }
    PLAYER.getTime(function (seconds) {
        socket.emit("mediaUpdate", {
            id: PLAYER.mediaId,
            currentTime: seconds,
            paused: PLAYER.paused,
            type: PLAYER.mediaType
        });
    });
}

/* chat */

function formatChatMessage(data, last, permalink) {
    // Backwards compat
    if (!data.meta || data.msgclass) {
        data.meta = {
            addClass: data.msgclass,
            // And the award for "variable name most like Java source code" goes to...
            addClassToNameAndTimestamp: data.msgclass
        };
    }
    if (!data.meta.color) {
        data.meta.color = "#ffffff";
    }
    
    // Phase 1: Determine whether to show the username or not
    var skip = data.username === last.name || data.username === "chmod";
    if(data.meta.addClass === "server-whisper")
        skip = true;
    // Prevent impersonation by abuse of the bold filter
    if(data.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/))
        skip = false;
    if (data.meta.forceShowName)
        skip = false;

    if (data.meta.no_emotes == undefined || data.meta.no_emotes == false) {
        data.msg = execEmotes(data.msg);
    }

    last.name = data.username;
    var div = $("<div/>");
    div.addClass("chat-msg");
    
    //var avatar = $('<img class="chat-msg-avatar"/>');
    //avatar.attr("src", data.to_avatar);
    //div.append(avatar);

    // Add timestamps (unless disabled)
    if (USEROPTS.show_timestamps && data.username !== "chmod") {
        if (permalink) {
            var time = $("<a/>").data("time", data.time).addClass("timestamp").attr("href", permalink).appendTo(div);
        } else {
            var time = $("<span/>").data("time", data.time).addClass("timestamp").appendTo(div);
        }
        
        if (data.pm === true) {
            var diff = timeSince(new Date(data.time));
            time.addClass("pm-timestamp").text(diff);
        } else {
            var timestamp = formatTimestamp(data.time);
            time.text("[" + timestamp + "] ");
        }
        if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
            time.addClass(data.meta.addClass);
        }
    }
    
    if (data.id != undefined) {
        div.attr("id", "chat-msg-" + data.id);
    }

    if (data.pm === true) {
        if (data.username == CLIENT.name) {
            div.addClass("chat-msg-pm-me");
        }
        
        var avatar = $('<img class="pm-avatar"/>');
        avatar.attr("src", data.avatar);
        div.append(avatar);
    }
    
    // Add username
    if (data.pm !== true) {
        var name = $("<span/>");
        if (!skip) {
            name.appendTo(div);
        }
        $("<strong/>").addClass("username").text(data.username + ": ").appendTo(name);
    }
    if (data.meta.modflair) {
        name.addClass(getNameColor(data.meta.modflair));
    }
    if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
        name.addClass(data.meta.addClass);
    }
    if (data.meta.superadminflair) {
        name.addClass("label")
            .addClass(data.meta.superadminflair.labelclass);
        $("<span/>").addClass(data.meta.superadminflair.icon)
            .addClass("glyphicon")
            .css("margin-right", "3px")
            .prependTo(name);
    }

    // Add the message itself
    var message = $("<span/>").appendTo(div);
    message.addClass("chat-msg-line");
    if (data.pm === true && data.username == CLIENT.name) {
        message.addClass("chat-msg-pm-line-me");
    }
    
    data.msg = data.msg.replace(/\[br\]/g, '<br />');
    if (USEROPTS.show_colors) {
        message.css("color", data.meta.color);
        data.msg = parseBBCodes(data.msg);
    } else {
        data.msg = removeBBCodes(data.msg);
    }
    
    message[0].innerHTML = data.msg;

    // For /me the username is part of the message
    if (data.meta.action) {
        name.remove();
        message[0].innerHTML = data.username + " " + data.msg;
    }
    if (data.meta.addClass) {
        message.addClass(data.meta.addClass);
    }
    if (data.meta.shadow) {
        div.addClass("chat-shadow");
    }
    
    if (hasPermission("deletemsg")) {
        div.addClass("chat-msg-deletable")
        var del_msg = $('<span class="glyphicon glyphicon-remove chat-msg-delete-btn"/>');
        del_msg.attr("Delete message");
        del_msg.on("click", function() {
            if (confirm("Delete this message?")) {
                socket.emit("delMsg", data.id);
            }
        });
        div.append(del_msg);
    }
    
    return div;
}

function addChatMessage(data) {
    if (data.username != "chmod") {
        if (IGNORED.indexOf(data.username) !== -1) {
            return;
        }
        if (data.meta.shadow && !USEROPTS.show_shadowchat) {
            return;
        }
    }
    
    var div = formatChatMessage(data, LASTCHAT);
    var us_match = data.msg.match(SCRIPTS_REGEX);
    if (us_match !== null) {
        div.addClass("chat-msg-click-to-install");
        div.find('a:contains("' + us_match[0] + '")')
            .prepend($('<span class="glyphicon glyphicon-flash chat-msg-click-to-install-icon"></span>'))
            .on("click", function(e) {
            var matches = data.msg.match(SCRIPTS_REGEX);
            if (matches !== null) {
                $("#chatline").val("");
                installUserScript(matches[1] + "." + matches[2]);
                e.preventDefault();
            }
        });
    }
    
    var msgBuf = $("#messagebuffer");
    // Incoming: a bunch of crap for the feature where if you hover over
    // a message, it highlights messages from that user
    var safeUsername = data.username.replace(/[^\w-]/g, '\\$');
    div.addClass("chat-msg-" + safeUsername);
    div.appendTo(msgBuf);
    
    var oldHeight = msgBuf.prop("scrollHeight");
    var numRemoved = trimChatBuffer();
    if (SCROLLCHAT) {
        scrollChat();
    } else {
        var newMessageDiv = $("#newmessages-indicator");
        if (!newMessageDiv.length) {
            newMessageDiv = $("<div/>").attr("id", "newmessages-indicator")
                    .insertBefore($("#chatline"));
            var bgHack = $("<span/>").attr("id", "newmessages-indicator-bghack")
                    .appendTo(newMessageDiv);

            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            $("<span/>").text("New Messages Below").appendTo(bgHack);
            $("<span/>").addClass("glyphicon glyphicon-chevron-down")
                    .appendTo(bgHack);
            newMessageDiv.click(function () {
                SCROLLCHAT = true;
                scrollChat();
            });
        }

        if (numRemoved > 0) {
            IGNORE_SCROLL_EVENT = true;
            var diff = oldHeight - msgBuf.prop("scrollHeight");
            scrollAndIgnoreEvent(msgBuf.scrollTop() - diff);
        }
    }

    div.find("img").load(function () {
        if (SCROLLCHAT) {
            scrollChat();
        } else if ($(this).position().top < 0) {
            scrollAndIgnoreEvent(msgBuf.scrollTop() + $(this).height());
        }
    });
    
    var isHighlight = false;
    if (CLIENT.name && data.username != CLIENT.name) {
        if (data.msg_clean.toLowerCase().indexOf(CLIENT.name.toLowerCase()) != -1
            || data.meta.highlight
            || (USEROPTS.highlight_regex !== null && data.msg_clean.match(USEROPTS.highlight_regex) !== null)) {
            div.addClass("nick-highlight");
            isHighlight = true;
        }
    }

    pingMessage(isHighlight);
    
    if(data.meta.addClass != "server-whisper" && !isHighlight) {
        if (!FOCUSED) {
            UNREAD_MSG_COUNT++;
            document.title = "(" + UNREAD_MSG_COUNT + ") " + PAGETITLE;
        } else {
            UNREAD_MSG_COUNT = 0;
        }
    }
}

function addUserJoinMessage(data) {
    if (!USEROPTS.show_joins || CLIENT.name == data.name || CLIENT.rank > 1) {
        return;
    }
    
    var timestamp = new Date(data.time).toTimeString().split(" ")[0];
    var msg = "[" + timestamp + "] " + data.name + " has joined chat";
    
    var msgBuf = $("#messagebuffer");
    var div = $("<div/>");
    div.addClass("join-message");
    div.appendTo(msgBuf);
    
    var message = $("<span/>").appendTo(div);
    message.html(msg);
    if (SCROLLCHAT) {
        scrollChat();
    }
}

function addNotice(data) {
    if (!USEROPTS.show_notices) {
        return;
    }
    
    var div = $("<div/>");
    div.addClass("notice-message");
    if (data.is_error) {
        div.addClass("notice-message-error");
    }
    
    var span = $("<span/>");
    span.addClass("timestamp");
    if (USEROPTS.show_timestamps) {
        span.text("[" + formatTimestamp(data.time) + "]");
    }
    div.append(span);
    
    var message = $("<span/>").appendTo(div);
    message.addClass("msg");
    
    if (data.meta == undefined) {
        data.meta = {};
    }
    if (data.meta.color == undefined) {
        data.meta.color = "#ffffff";
    }
    if (USEROPTS.show_colors) {
        message.css("color", data.meta.color);
        data.msg = parseBBCodes(data.msg);
    } else {
        data.msg = removeBBCodes(data.msg);
    }
    
    message.html(data.msg);
    
    var msgBuf = $("#messagebuffer");
    msgBuf.append(div);
    if (SCROLLCHAT) {
        scrollChat();
    }
}

function addWhisper(data) {
    if (IGNORED.indexOf(data.name) !== -1) {
        return;
    }
    
    addNotice(data);
}

function parseBBCodes(msg) {
    msg = msg.replace(/\[color (#[a-f0-9]{3,6})\](.*?)\[\/color\]/gi, '<span style="color: $1">$2</span>');
    msg = msg.replace(/\[(#[a-f0-9]{3,6})\](.*?)\[\/#\]/gi, '<span style="color: $1">$2</span>');
    
    return msg;
}

function removeBBCodes(msg) {
    msg = msg.replace(/\[color (#[a-f0-9]{3,6})\](.*?)\[\/color\]/gi, '$2');
    msg = msg.replace(/\[(#[a-f0-9]{3,6})\](.*?)\[\/#\]/gi, '$2');
    
    return msg;
}

function addAnnouncement(data) {
    var box = $('<div role="alert"/>');
    box.addClass("alert alert-dismissible alert-" + data.type);
    box.text(data.msg);
    
    var close = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');
    box.append(close);
    
    $("#announcements").append(box);
}

function trimChatBuffer() {
    var maxSize = window.CHATMAXSIZE;
    if (!maxSize || typeof maxSize !== "number")
        maxSize = parseInt(maxSize || 100, 10) || 100;
    var buffer = document.getElementById("messagebuffer");
    var count = buffer.childNodes.length - maxSize;

    for (var i = 0; i < count; i++) {
        buffer.firstChild.remove();
    }

    return count;
}

function pingMessage(isHighlight) {
    if (!FOCUSED) {
        if (!TITLE_BLINK && (USEROPTS.blink_title === "always" ||
            USEROPTS.blink_title === "onlyping" && isHighlight)) {
            TITLE_BLINK = setInterval(function() {
                if(document.title == "*Chat*")
                    document.title = PAGETITLE;
                else
                    document.title = "*Chat*";
            }, 1000);
        }

        if (USEROPTS.boop === "always" || (USEROPTS.boop === "onlyping" &&
            isHighlight)) {
            CHATSOUND.play();
        }
    }
}

/* layouts */

function undoHDLayout() {
    $("body").removeClass("hd");
    $("#drinkbar").detach().removeClass().addClass("col-lg-12 col-md-12")
      .appendTo("#drinkbarwrap");
    $("#chatwrap").detach().removeClass().addClass("col-lg-5 col-md-5")
      .appendTo("#main");
    $("#videowrap").detach().removeClass().addClass("col-lg-7 col-md-7")
      .appendTo("#main");

    $("#leftcontrols").detach().removeClass().addClass("col-lg-5 col-md-5")
      .prependTo("#controlsrow");

    $("#plcontrol").detach().appendTo("#rightcontrols");
    $("#videocontrols").detach().appendTo("#rightcontrols");

    $("#playlistrow").prepend('<div id="leftpane" class="col-lg-5 col-md-5" />');
    $("#leftpane").append('<div id="leftpane-inner" class="row" />');

    $("#pollwrap").detach().removeClass().addClass("col-lg-12 col-md-12")
      .appendTo("#leftpane-inner");
    $("#playlistmanagerwrap").detach().removeClass().addClass("col-lg-12 col-md-12")
      .css("margin-top", "10px")
      .appendTo("#leftpane-inner");

    $("#rightpane").detach().removeClass().addClass("col-lg-7 col-md-7")
      .appendTo("#playlistrow");

    $("nav").addClass("navbar-fixed-top");
    $("#mainpage").css("padding-top", "60px");
    $("#queue").css("max-height", "500px");
    $("#messagebuffer, #userlist").css("max-height", "");
}

function compactLayout() {
    /* Undo synchtube layout */
    if ($("body").hasClass("synchtube")) {
        $("body").removeClass("synchtube")
        $("#chatwrap").detach().insertBefore($("#videowrap"));
        $("#leftcontrols").detach().insertBefore($("#rightcontrols"));
        $("#leftpane").detach().insertBefore($("#rightpane"));
        $("#userlist").css("float", "left");
        if($("#userlisttoggle").hasClass("glyphicon-chevron-left")){
            $("#userlisttoggle").removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-right")
        }
        $("#userlisttoggle").removeClass("pull-right").addClass("pull-left")
    }

    /* Undo fluid layout */
    if ($("body").hasClass("fluid")) {
        $("body").removeClass("fluid")
        $(".container-fluid").removeClass("container-fluid").addClass("container");
    }

    /* Undo HD layout */
    if ($("body").hasClass("hd")) {
        undoHDLayout();
    }

    $("body").addClass("compact");
    handleVideoResize();
}

function fluidLayout() {
    if ($("body").hasClass("hd")) {
        undoHDLayout();
    }
    $(".container").removeClass("container").addClass("container-fluid");
    $("footer .container-fluid").removeClass("container-fluid").addClass("container");
    $("body").addClass("fluid");
    handleVideoResize();
}

function synchtubeLayout() {
    if ($("body").hasClass("hd")) {
        undoHDLayout();
    }
    if($("#userlisttoggle").hasClass("glyphicon-chevron-right")){
        $("#userlisttoggle").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-left")
    }
    $("#userlisttoggle").removeClass("pull-left").addClass("pull-right")
    $("#videowrap").detach().insertBefore($("#chatwrap"));
    $("#rightcontrols").detach().insertBefore($("#leftcontrols"));
    $("#rightpane").detach().insertBefore($("#leftpane"));
    $("#userlist").css("float", "right");
    $("body").addClass("synchtube");
}

/*
 * "HD" is kind of a misnomer.  Should be renamed at some point.
 */
function hdLayout() {
    var videowrap = $("#videowrap"),
        chatwrap = $("#chatwrap"),
        playlist = $("#rightpane")

    videowrap.detach().insertAfter($("#drinkbar"))
        .removeClass()
        .addClass("col-md-8 col-md-offset-2");

    playlist.detach().insertBefore(chatwrap)
        .removeClass()
        .addClass("col-md-6");

    chatwrap.removeClass()
        .addClass("col-md-6");

    var ch = "320px";
    $("#messagebuffer").css("max-height", ch);
    $("#userlist").css("max-height", ch);
    $("#queue").css("max-height", "312px");

    $("#leftcontrols").detach()
        .insertAfter(chatwrap)
        .removeClass()
        .addClass("col-md-6");

    $("#playlistmanagerwrap").detach()
        .insertBefore($("#leftcontrols"))
        .css("margin-top", "0")
        .removeClass()
        .addClass("col-md-6");

    $("#showplaylistmanager").addClass("btn-sm");

    var plcontrolwrap = $("<div/>").addClass("col-md-12")
        .prependTo($("#rightpane-inner"));

    $("#plcontrol").detach().appendTo(plcontrolwrap);
    $("#videocontrols").detach()
        .appendTo(plcontrolwrap);

    $("#controlswrap").remove();

    $("#pollwrap").detach()
        .insertAfter($("#leftcontrols"))
        .removeClass()
        .addClass("col-md-6 col-md-offset-6");

    $("#leftpane").remove();
    $("nav.navbar-fixed-top").removeClass("navbar-fixed-top");
    $("#mainpage").css("padding-top", "0");

    $("body").addClass("hd");
    handleVideoResize();
}

function chatOnly() {
    var chat = $("#chatwrap").detach();
    removeVideo();
    $("#wrap").remove();
    $("footer").remove();
    chat.prependTo($("body"));
    chat.css({
        "min-height": "100%",
        "min-width": "100%",
        margin: "0",
        padding: "0"
    });
    $(".chatbuttons").find("button").css({
        "fontSize": "75%"
    });
    setVisible("#showchansettings", CLIENT.rank >= 2);

    $("body").addClass("chatOnly");
    handleWindowResize();
}

function handleWindowResize() {
    if ($("body").hasClass("chatOnly")) {
        var h = $("body").outerHeight() - $("#chatline").outerHeight() -
                $("#chatheader").outerHeight();
        $("#messagebuffer").outerHeight(h);
        $("#userlist").outerHeight(h);
        return;
    } else {
        handleVideoResize();
    }
}

function handleVideoResize() {
    if ($("#ytapiplayer").length === 0) return;

    var intv, ticks = 0;
    var resize = function () {
        if (++ticks > 10) clearInterval(intv);
        if ($("#ytapiplayer").parent().outerHeight() <= 0) return;
        clearInterval(intv);

        var responsiveFrame = $("#ytapiplayer").parent();
        var height = responsiveFrame.outerHeight() - $("#chatline").outerHeight() - 2;
        $("#messagebuffer").height(height);
        $("#userlist").height(height - 10);

        $("#ytapiplayer").attr("height", VHEIGHT = responsiveFrame.outerHeight());
        $("#ytapiplayer").attr("width", VWIDTH = responsiveFrame.outerWidth());
    };

    if ($("#ytapiplayer").height() > 0) resize();
    else intv = setInterval(resize, 500);
}

$(window).resize(handleWindowResize);
handleWindowResize();

function removeVideo(event) {
    try {
        PLAYER.setVolume(0);
        if (PLAYER.type === "rv") {
            killVideoUntilItIsDead($(PLAYER.player));
        }
    } catch (e) {
    }
    
    CHAT_WRAP = $("#videowrap");
    CHAT_WRAP.remove();
    
    $("#chatwrap").removeClass("col-lg-5 col-md-5").addClass("col-md-12");
    $("#layout-remove-video").hide();
    $("#layout-show-video").show();
    if (event) event.preventDefault();
}

function showVideo(event) {

    $("#videowrap-mount").append(CHAT_WRAP);
    loadMediaPlayer(CHAT_WRAP_MEDIA);
    handleMediaUpdate(CHAT_WRAP_MEDIA);
    $("#currenttitle").text(CHAT_WRAP_MEDIA.title);
    $("#layout-remove-video").show();
    $("#layout-show-video").hide();
    if (event) event.preventDefault();
}

/* channel administration stuff */

function genPermissionsEditor() {
    $("#cs-permedit").html("");
    var form = $("<form/>").addClass("form-horizontal")
        .attr("action", "javascript:void(0)")
        .appendTo($("#cs-permedit"));

    function makeOption(text, key, permset, defval) {
        var group = $("<div/>").addClass("form-group")
            .appendTo(form);
        $("<label/>").addClass("control-label col-sm-4")
            .text(text)
            .appendTo(group);
        var controls = $("<div/>").addClass("col-sm-8")
            .appendTo(group);
        var select = $("<select/>").addClass("form-control")
            .appendTo(controls)
            .data("key", key);

        for (var i = 0; i < permset.length; i++) {
            $("<option/>").attr("value", permset[i][1])
                .text(permset[i][0])
                .attr("selected", defval === permset[i][1])
                .appendTo(select);
        }
    }

    function addDivider(text, nonewline) {
        $("<hr/>").appendTo(form);
        if (!nonewline) {
            $("<h3/>").text(text).appendTo(form);
        }
    }

    var standard = [
        ["Anonymous"    , "-1"],
        ["Guest"        , "0"],
        ["Registered"   , "1"],
        ["Leader"       , "1.5"],
        ["Moderator"    , "2"],
        ["Channel Admin", "3"],
        ["Nobody"       , "1000000"]
    ];

    var noanon = [
        ["Guest"        , "0"],
        ["Registered"   , "1"],
        ["Leader"       , "1.5"],
        ["Moderator"    , "2"],
        ["Channel Admin", "3"],
        ["Nobody"       , "1000000"]
    ];

    var modleader = [
        ["Leader"       , "1.5"],
        ["Moderator"    , "2"],
        ["Channel Admin", "3"],
        ["Nobody"       , "1000000"]
    ];

    var modplus = [
        ["Moderator"    , "2"],
        ["Channel Admin", "3"],
        ["Nobody"       , "1000000"]
    ];

    $("<h3/>").text("Open playlist permissions").appendTo(form);
    makeOption("Add to playlist", "oplaylistadd", standard, CHANNEL.perms.oplaylistadd+"");
    makeOption("Add/move to next", "oplaylistnext", standard, CHANNEL.perms.oplaylistnext+"");
    makeOption("Move playlist items", "oplaylistmove", standard, CHANNEL.perms.oplaylistmove+"");
    makeOption("Delete playlist items", "oplaylistdelete", standard, CHANNEL.perms.oplaylistdelete+"");
    makeOption("Jump to video", "oplaylistjump", standard, CHANNEL.perms.oplaylistjump+"");
    makeOption("Queue playlist", "oplaylistaddlist", standard, CHANNEL.perms.oplaylistaddlist+"");
    makeOption("Up/Down vote", "votevideo", standard, CHANNEL.perms.votevideo+"");

    addDivider("General playlist permissions");
    makeOption("View the playlist", "seeplaylist", standard, CHANNEL.perms.seeplaylist+"");
    makeOption("Add to playlist", "playlistadd", standard, CHANNEL.perms.playlistadd+"");
    makeOption("Add/move to next", "playlistnext", standard, CHANNEL.perms.playlistnext+"");
    makeOption("Move playlist items", "playlistmove", standard, CHANNEL.perms.playlistmove+"");
    makeOption("Delete playlist items", "playlistdelete", standard, CHANNEL.perms.playlistdelete+"");
    makeOption("Jump to video", "playlistjump", standard, CHANNEL.perms.playlistjump+"");
    makeOption("Queue playlist", "playlistaddlist", standard, CHANNEL.perms.playlistaddlist+"");
    makeOption("Queue livestream", "playlistaddlive", standard, CHANNEL.perms.playlistaddlive+"");
    makeOption("Embed custom media", "playlistaddcustom", standard, CHANNEL.perms.playlistaddcustom + "");
    makeOption("Add raw video file", "playlistaddrawfile", standard, CHANNEL.perms.playlistaddrawfile + "");
    makeOption("Exceed maximum media length", "exceedmaxlength", standard, CHANNEL.perms.exceedmaxlength+"");
    makeOption("Exceed maximum number of videos per user", "exceedmaxitems", standard, CHANNEL.perms.exceedmaxitems+"");
    makeOption("Add nontemporary media", "addnontemp", standard, CHANNEL.perms.addnontemp+"");
    makeOption("Temp/untemp playlist item", "settemp", standard, CHANNEL.perms.settemp+"");
    makeOption("Lock/unlock playlist", "playlistlock", modleader, CHANNEL.perms.playlistlock+"");
    makeOption("Shuffle playlist", "playlistshuffle", standard, CHANNEL.perms.playlistshuffle+"");
    makeOption("Clear playlist", "playlistclear", standard, CHANNEL.perms.playlistclear+"");

    addDivider("Polls");
    makeOption("Open/Close poll", "pollctl", modleader, CHANNEL.perms.pollctl+"");
    makeOption("Vote", "pollvote", standard, CHANNEL.perms.pollvote+"");
    makeOption("View hidden poll results", "viewhiddenpoll", standard, CHANNEL.perms.viewhiddenpoll+"");
    makeOption("Voteskip", "voteskip", standard, CHANNEL.perms.voteskip+"");
    makeOption("View voteskip results", "viewvoteskip", standard, CHANNEL.perms.viewvoteskip+"");
    
    addDivider("Moderation");
    makeOption("Assign/Remove leader", "leaderctl", modplus, CHANNEL.perms.leaderctl+"");
    makeOption("Mute users", "mute", modleader, CHANNEL.perms.mute+"");
    makeOption("Kick users", "kick", modleader, CHANNEL.perms.kick+"");
    makeOption("Ban users", "ban", modplus, CHANNEL.perms.ban+"");
    makeOption("Edit MOTD", "motdedit", modplus, CHANNEL.perms.motdedit+"");
    makeOption("Edit biography", "bioedit", modplus, CHANNEL.perms.bioedit+"");
    makeOption("Edit chat filters", "filteredit", modplus, CHANNEL.perms.filteredit+"");
    makeOption("Import chat filters", "filterimport", modplus, CHANNEL.perms.filterimport+"");
    makeOption("Edit chat emotes", "emoteedit", modplus, CHANNEL.perms.emoteedit+"");
    makeOption("Upload files", "upload", modplus, CHANNEL.perms.upload+"");
    makeOption("Import chat emotes", "emoteimport", modplus, CHANNEL.perms.emoteimport+"");
    makeOption("Delete messages", "deletemsg", modplus, CHANNEL.perms.deletemsg+"");

    addDivider("Misc");
    makeOption("Drink calls", "drink", modleader, CHANNEL.perms.drink+"");
    makeOption("Chat", "chat", noanon, CHANNEL.perms.chat+"");
    makeOption("Clear Chat", "chatclear", modleader, CHANNEL.perms.chatclear+"");
    makeOption("User Scripting", "scripting", standard, CHANNEL.perms.scripting+"");
    makeOption("Chat Commands", "chat_commands", noanon, CHANNEL.perms.chat_commands+"");

    var sgroup = $("<div/>").addClass("form-group").appendTo(form);
    var sgroupinner = $("<div/>").addClass("col-sm-8 col-sm-offset-4").appendTo(sgroup);
    var submit = $("<button/>").addClass("btn btn-primary").appendTo(sgroupinner);
    submit.text("Save");
    submit.click(function() {
        var perms = {};
        form.find("select").each(function() {
            perms[$(this).data("key")] = parseFloat($(this).val());
        });
        socket.emit("setPermissions", perms);
    });

    var msggroup = $("<div/>").addClass("form-group").insertAfter(sgroup);
    var msginner = $("<div/>").addClass("col-sm-8 col-sm-offset-4").appendTo(msggroup);
    var text = $("<span/>").addClass("text-info").text("Permissions updated")
        .appendTo(msginner);

    setTimeout(function () {
        msggroup.hide("fade", function () {
            msggroup.remove();
        });
    }, 5000);
}

function waitUntilDefined(obj, key, fn) {
    if(typeof obj[key] === "undefined") {
        setTimeout(function () {
            waitUntilDefined(obj, key, fn);
        }, 100);
        return;
    }
    fn();
}

function hidePlayer() {
    /* 2015-09-16
     * Originally used to hide the player while a modal was open because of
     * certain flash videos that always rendered on top.  Seems to no longer
     * be an issue.  Uncomment this if it is.
    if (!PLAYER) return;

    $("#ytapiplayer").hide();
    */
}

function unhidePlayer() {
    //$("#ytapiplayer").show();
}

function chatDialog(div) {
    var parent = $("<div/>").addClass("profile-box")
        .css({
            padding: "10px",
            "z-index": "auto",
            position: "absolute"
        })
        .appendTo($("#chatwrap"));

    div.appendTo(parent);
    var cw = $("#chatwrap").width();
    var ch = $("#chatwrap").height();
    var x = cw/2 - parent.width()/2;
    var y = ch/2 - parent.height()/2;
    parent.css("left", x + "px");
    parent.css("top", y + "px");
    return parent;
}

function errDialog(err) {
    var div = $("<div/>").addClass("profile-box")
        .css("padding", "10px")
        .text(err)
        .appendTo($("body"));

    $("<br/>").appendTo(div);
    $("<button/>").addClass("btn btn-xs btn-default")
        .css("width", "100%")
        .text("OK")
        .click(function () { div.remove(); })
        .appendTo(div);
    var cw = $("#chatwrap").width();
    var ch = $("#chatwrap").height();
    var cp = $("#chatwrap").offset();
    var x = cp.left + cw/2 - div.width()/2;
    var y = cp.top + ch/2 - div.height()/2;
    div.css("left", x + "px")
        .css("top", y + "px")
        .css("position", "absolute");
    return div;
}

function queueMessage(data, type) {
    if (!data)
        data = { link: null };
    if (!data.msg || data.msg === true) {
        data.msg = "Queue failed.  Check your link to make sure it is valid.";
    }
    var ltype = "label-danger";
    var title = "Error";
    if (type === "alert-warning") {
        ltype = "label-warning";
        title = "Warning";
    }

    var alerts = $(".qfalert.qf-" + type + " .alert");
    for (var i = 0; i < alerts.length; i++) {
        var al = $(alerts[i]);
        if (al.data("reason") === data.msg) {
            var tag = al.find("." + ltype);
            if (tag.length > 0) {
                var morelinks = al.find(".qflinks");
                $("<a/>").attr("href", data.link)
                    .attr("target", "_blank")
                    .text(data.link)
                    .appendTo(morelinks);
                $("<br/>").appendTo(morelinks);
                var count = parseInt(tag.text().match(/\d+/)[0]) + 1;
                tag.text(tag.text().replace(/\d+/, ""+count));
            } else {
                var tag = $("<span/>")
                    .addClass("label pull-right pointer " + ltype)
                    .text("+ 1 more")
                    .appendTo(al);
                var morelinks = $("<div/>")
                    .addClass("qflinks")
                    .appendTo(al)
                    .hide();
                $("<a/>").attr("href", data.link)
                    .attr("target", "_blank")
                    .text(data.link)
                    .appendTo(morelinks);
                $("<br/>").appendTo(morelinks);
                tag.click(function () {
                    morelinks.toggle();
                });
            }
            return;
        }
    }
    var text = data.msg;
    text = text.replace(/(https?:[^ ]+)/g, "<a href='$1' target='_blank'>$1</a>");
    if (typeof data.link === "string") {
        text += "<br><a href='" + data.link + "' target='_blank'>" +
                data.link + "</a>";
    }
    var newAlert = makeAlert(title, text, type)
        .addClass("linewrap qfalert qf-" + type)
        .appendTo($("#queuefail"));
    newAlert.find(".alert").data("reason", data.msg);
}

function setupChanlogFilter(data) {
    var getKey = function (ln) {
        var left = ln.indexOf("[", 1);
        var right = ln.indexOf("]", left);
        if (left === -1 || right === -1) {
            return "unknown";
        }
        return ln.substring(left+1, right);
    };

    data = data.split("\n").filter(function (ln) {
        return ln.indexOf("[") === 0 && ln.indexOf("]") > 0;
    });

    var log = $("#cs-chanlog-text");
    var select = $("#cs-chanlog-filter");
    select.html("");
    log.data("lines", data);

    var keys = {};
    data.forEach(function (ln) {
        keys[getKey(ln)] = true;
    });

    Object.keys(keys).forEach(function (key) {
        $("<option/>").attr("value", key).text(key).appendTo(select);
    });

    $("<option/>").attr("value", "chat").text("chat").prependTo(select);
}

function filterChannelLog() {
    var log = $("#cs-chanlog-text");
    var filter = $("#cs-chanlog-filter").val();
    var getKey = function (ln) {
        var left = ln.indexOf("[", 1);
        var right = ln.indexOf("]", left);
        if (left === -1) {
            return false;
        }
        return ln.substring(left+1, right);
    };

    var getTimestamp = function (ln) {
        var right = ln.indexOf("]");
        return ln.substring(1, right);
    };

    var getMessage = function (ln) {
        var right = ln.indexOf("]");
        return ln.substring(right + 2);
    };

    var show = [];
    (log.data("lines")||[]).forEach(function (ln) {
        var key = getKey(ln);
        if (!filter || !key && filter.indexOf("chat") !== -1) {
            show.push(ln);
        } else if (filter.indexOf(key) >= 0) {
            show.push(ln);
        }
    });

    log.text(show.join("\n"));
    log.scrollTop(log.prop("scrollHeight"));
}

function makeModal() {
    var wrap = $("<div/>").addClass("modal fade");
    var dialog = $("<div/>").addClass("modal-dialog").appendTo(wrap);
    var content = $("<div/>").addClass("modal-content").appendTo(dialog);

    var head = $("<div/>").addClass("modal-header").appendTo(content);
    $("<button/>").addClass("close")
        .attr("data-dismiss", "modal")
        .attr("data-hidden", "true")
        .html("&times;")
        .appendTo(head);

    wrap.on("hidden.bs.modal", function () {
        unhidePlayer();
        wrap.remove();
    });
    return wrap;
}

function formatCSModList() {
    var tbl = $("#cs-chanranks table");
    tbl.find("tbody").remove();
    var entries = tbl.data("entries") || [];
    entries.sort(function(a, b) {
        if (a.rank === b.rank) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();
            return y == x ? 0 : (x < y ? -1 : 1);
        }

        return b.rank - a.rank;
    });

    entries.forEach(function (entry) {
        var tr = $("<tr/>").addClass("cs-chanrank-tr-" + entry.name);
        var name = $("<td/>").text(entry.name).appendTo(tr);
        name.addClass(getNameColor(entry.rank));
        var rankwrap = $("<td/>");
        var rank = $("<span/>").text(entry.rank).appendTo(rankwrap);
        var dd = $("<div/>").addClass("btn-group");
        var toggle = $("<button/>")
            .addClass("btn btn-xs btn-default dropdown-toggle")
            .attr("data-toggle", "dropdown")
            .html("Edit <span class=caret></span>")
            .appendTo(dd);
        if (CLIENT.rank <= entry.rank && !(CLIENT.rank === 4 && entry.rank === 4)) {
            toggle.addClass("disabled");
        }

        var menu = $("<ul/>").addClass("dropdown-menu")
            .attr("role", "menu")
            .appendTo(dd);

        var ranks = [
            { name: "Remove Moderator", rank: 1 },
            { name: "Moderator", rank: 2 },
            { name: "Admin", rank: 3 },
            { name: "Owner", rank: 4 },
            { name: "Founder", rank: 5 }
        ];

        ranks.forEach(function (r) {
            var li = $("<li/>").appendTo(menu);
            var a = $("<a/>")
                .addClass(getNameColor(r.rank))
                .attr("href", "javascript:void(0)")
                .text(r.name)
                .appendTo(li);
            if (r.rank !== entry.rank) {
                a.click(function () {
                    socket.emit("setChannelRank", {
                        name: entry.name,
                        rank: r.rank
                    });
                });
            } else {
                $("<span/>").addClass("glyphicon glyphicon-ok")
                    .appendTo(a);
                li.addClass("disabled");
            }

            if (r.rank > CLIENT.rank || (CLIENT.rank < 4 && r.rank === CLIENT.rank)) {
                li.addClass("disabled");
            }
        });

        dd.css("margin-right", "10px").prependTo(rankwrap);
        rankwrap.appendTo(tr);
        tr.appendTo(tbl);
    });
}

function formatCSBanlist() {
    var tbl = $("#cs-banlist table");
    tbl.find("tbody").remove();
    var entries = tbl.data("entries") || [];
    var sparse = {};
    for (var i = 0; i < entries.length; i++) {
        if (!(entries[i].name in sparse)) {
            sparse[entries[i].name] = [];
        }
        sparse[entries[i].name].push(entries[i]);
    }

    var flat = [];
    for (var name in sparse) {
        flat.push({
            name: name,
            bans: sparse[name]
        });
    }
    flat.sort(function (a, b) {
        var x = a.name.toLowerCase(),
            y = b.name.toLowerCase();
        return x === y ? 0 : (x > y ? 1 : -1);
    });

    var addBanRow = function (entry, after) {
        var tr = $("<tr/>");
        if (after) {
            tr.insertAfter(after);
        } else {
            tr.appendTo(tbl);
        }
        var unban = $("<button/>").addClass("btn btn-xs btn-danger")
            .appendTo($("<td/>").appendTo(tr));
        unban.click(function () {
            socket.emit("unban", {
                id: entry.id,
                name: entry.name
            });
        });
        $("<span/>").addClass("glyphicon glyphicon-remove-circle").appendTo(unban);
        $("<td/>").text(entry.ip).appendTo(tr);
        $("<td/>").text(entry.name).appendTo(tr);
        $("<td/>").text(entry.bannedby).appendTo(tr);
        tr.attr("title", "Ban Reason: " + entry.reason);
        return tr;
    };

    flat.forEach(function (person) {
        var bans = person.bans;
        var name = person.name;
        var first = addBanRow(bans.shift());

        if (bans.length > 0) {
            var showmore = $("<button/>").addClass("btn btn-xs btn-default pull-right");
            $("<span/>").addClass("glyphicon glyphicon-list").appendTo(showmore);
            showmore.appendTo(first.find("td")[1]);

            showmore.click(function () {
                if (showmore.data("elems")) {
                    showmore.data("elems").forEach(function (e) {
                        e.remove();
                    });
                    showmore.data("elems", null);
                } else {
                    var elems = [];
                    bans.forEach(function (b) {
                        elems.push(addBanRow(b, first));
                    });
                    showmore.data("elems", elems);
                }
            });
        }
    });
}

function checkEntitiesInStr(str) {
    var entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "\\(": "&#40;",
        "\\)": "&#41;"
    };

    var m = str.match(/([&<>"'])|(\\\()|(\\\))/);
    if (m && m[1] in entities) {
        return { src: m[1].replace(/^\\/, ""), replace: entities[m[1]] };
    } else {
        return false;
    }
}

function formatCSChatFilterList() {
    var tbl = $("#cs-chatfilters table");
    tbl.find("tbody").remove();
    tbl.find(".ui-sortable").remove();
    var entries = tbl.data("entries") || [];
    entries.forEach(function (f) {
        var tr = $("<tr/>").appendTo(tbl);
        var controlgroup = $("<div/>").addClass("btn-group")
            .appendTo($("<td/>").appendTo(tr));
        var control = $("<button/>").addClass("btn btn-xs btn-default")
            .attr("title", "Edit this filter")
            .appendTo(controlgroup);
        $("<span/>").addClass("glyphicon glyphicon-list").appendTo(control);
        var del = $("<button/>").addClass("btn btn-xs btn-danger")
            .appendTo(controlgroup);
        $("<span/>").addClass("glyphicon glyphicon-trash").appendTo(del);
        del.click(function () {
            socket.emit("removeFilter", f);
        });
        var name = $("<code/>").text(f.name).appendTo($("<td/>").appendTo(tr));
        var activetd = $("<td/>").appendTo(tr);
        var active = $("<input/>").attr("type", "checkbox")
            .prop("checked", f.active)
            .appendTo(activetd)
            .change(function () {
                f.active = $(this).prop("checked");
                socket.emit("updateFilter", f);
            });

        var reset = function () {
            control.data("editor") && control.data("editor").remove();
            control.data("editor", null);
            control.parent().find(".btn-success").remove();
            var tbody = $(tbl.children()[1]);
            if (tbody.find(".filter-edit-row").length === 0) {
                tbody.sortable("enable");
            }
        };

        control.click(function () {
            if (control.data("editor")) {
                return reset();
            }
            $(tbl.children()[1]).sortable("disable");
            var tr2 = $("<tr/>").insertAfter(tr).addClass("filter-edit-row");
            var wrap = $("<td/>").attr("colspan", "3").appendTo(tr2);
            var form = $("<form/>").addClass("form-inline").attr("role", "form")
                .attr("action", "javascript:void(0)")
                .appendTo(wrap);
            var addTextbox = function (placeholder) {
                var div = $("<div/>").addClass("form-group").appendTo(form)
                    .css("margin-right", "10px");
                var input = $("<input/>").addClass("form-control")
                    .attr("type", "text")
                    .attr("placeholder", placeholder)
                    .attr("title", placeholder)
                    .appendTo(div);
                return input;
            };

            var regex = addTextbox("Filter regex").val(f.source);
            var flags = addTextbox("Regex flags").val(f.flags);
            var replace = addTextbox("Replacement text").val(f.replace);

            var checkwrap = $("<div/>").addClass("checkbox").appendTo(form);
            var checklbl = $("<label/>").text("Filter Links").appendTo(checkwrap);
            var filterlinks = $("<input/>").attr("type", "checkbox")
                .prependTo(checklbl)
                .prop("checked", f.filterlinks);

            var save = $("<button/>").addClass("btn btn-xs btn-success")
                .attr("title", "Save changes")
                .insertAfter(control);
            $("<span/>").addClass("glyphicon glyphicon-floppy-save").appendTo(save);
            save.click(function () {
                f.source = regex.val();
                var entcheck = checkEntitiesInStr(f.source);
                if (entcheck) {
                    alert("Warning: " + entcheck.src + " will be replaced by " +
                          entcheck.replace + " in the message preprocessor.  This " +
                          "regular expression may not match what you intended it to " +
                          "match.");
                }
                f.flags = flags.val();
                f.replace = replace.val();
                f.filterlinks = filterlinks.prop("checked");

                socket.emit("updateFilter", f);
                socket.once("updateFilterSuccess", function () {
                    reset();
                });
            });

            control.data("editor", tr2);
        });
    });
    $(tbl.children()[1]).sortable({
        start: function(ev, ui) {
            FILTER_FROM = ui.item.prevAll().length;
        },
        update: function(ev, ui) {
            FILTER_TO = ui.item.prevAll().length;
            if(FILTER_TO != FILTER_FROM) {
                socket.emit("moveFilter", {
                    from: FILTER_FROM,
                    to: FILTER_TO
                });
            }
        }
    });
}

function formatCSEmoteList() {
    var tbl = $("#cs-emotes table");
    tbl.find("tbody").remove();
    var entries = CLIENT.emotes.concat(CHANNEL.emotes);
    entries.forEach(function (f) {
        var tr = $("<tr/>").appendTo(tbl);
        var del = $("<button/>").addClass("btn btn-xs btn-danger")
            .appendTo($("<td/>").appendTo(tr));
        $("<span/>").addClass("glyphicon glyphicon-trash").appendTo(del);
        del.click(function () {
            socket.emit("removeEmote", f);
        });
        var name = $("<code/>").text(f.name).addClass("linewrap")
            .appendTo($("<td/>").appendTo(tr));
        var image = $("<code/>").text(f.image).addClass("linewrap")
            .appendTo($("<td/>").appendTo(tr));
        image.popover({
            html: true,
            trigger: "hover",
            content: '<img src="' + f.image + '" class="channel-emote">'
        });

        image.click(function () {
            var td = image.parent();
            td.find(".popover").remove();
            image.detach();
            var edit = $("<input/>").addClass("form-control").attr("type", "text")
                .appendTo(td);

            edit.val(f.image);
            edit.focus();

            var finish = function () {
                var val = edit.val();
                edit.remove();
                image.appendTo(td);
                socket.emit("updateEmote", {
                    name: f.name,
                    image: val
                });
            };

            edit.blur(finish);
            edit.keydown(function (ev) {
                if (ev.keyCode === 13) {
                    finish();
                }
            });
        });
    });
}

function formatUploadsList(first) {
    var tbl = $("#cs-uploadoptions table");
    tbl.find("tbody").remove();
    
    var size    = 0;
    var entries = tbl.data("entries");
    entries.forEach(function (f) {
        size += f.size;
        var tr = $("<tr/>")
            .appendTo(tbl);
        var td = $("<td/>");
        td.appendTo(tr);
        var group = $("<div/>")
            .addClass("btn-group")
            .appendTo(td);
        
        var del = $("<button/>")
            .addClass("btn btn-xs btn-danger")
            .attr("title", "Delete upload")
            .appendTo(group);
        $("<span/>").addClass("glyphicon glyphicon-trash")
            .appendTo(del);
        del.click(function () {
            if (confirm("Are you sure you want to delete this upload?")) {
                socket.emit("removeUpload", f);
            }
        });
    
        var emote = $("<button/>")
            .addClass("btn btn-xs btn-default")
            .attr("title", "Create emote")
            .appendTo(group);
        $("<span/>").addClass("glyphicon glyphicon-user")
            .appendTo(emote);
        emote.click(function () {
            $("#cs-emotes-newimage").val(f.url);
            $("#cs-emotes-link").click();
            setTimeout(function() {
                $("#cs-emotes-newname").focus();
            }, 5);
        });
    
        var open = $("<button/>")
            .addClass("btn btn-xs btn-default")
            .attr("title", "Open upload")
            .appendTo(group);
        $("<span/>").addClass("glyphicon glyphicon-share-alt")
            .appendTo(open);
        open.click(function () {
            window.open(f.url);
        });
    
        td = $("<td/>");
        td.appendTo(tr);
        td.text(humanFileSize(f.size))
            .addClass("linewrap")
            .appendTo(td);
    
        td = $("<td/>");
        td.appendTo(tr);
        td.text(f.url)
            .addClass("linewrap")
            .appendTo(td);
    });
    
    $("#cs-uploads-used").text(humanFileSize(size));
    if (first) {
        var avail = $("#cs-uploads-available");
        avail.text(humanFileSize(avail.text()));
        var max = $("#cs-uploads-bytes-per-file");
        max.text(humanFileSize(max.text()));
    }
}

function formatUserEmotesList(tbl) {
    tbl.find("tbody").remove();
    
    var entries = tbl.data("entries");
    entries.forEach(function (f) {
        var tr = $("<tr/>")
            .appendTo(tbl);
        var td = $("<td/>");
        td.appendTo(tr);
        
        var group = $("<div/>")
            .addClass("btn-group")
            .appendTo(td);
        
        var del = $("<button/>")
            .addClass("btn btn-xs btn-danger")
            .attr("title", "Delete")
            .appendTo(group);
        $("<span/>").addClass("glyphicon glyphicon-trash")
            .appendTo(del);
        del.click(function () {
            if (confirm("Are you sure you want to delete this emote?")) {
                socket.emit("userEmoteRemove", f);
            }
        });
        
        td = $("<td/>");
        td.appendTo(tr);
        td.text(f.text)
            .addClass("linewrap")
            .appendTo(td);
        
        td = $("<td/>");
        td.appendTo(tr);
        td.text(f.url)
            .addClass("linewrap")
            .appendTo(td);
    });
}

function formatFavorites(favorites, prepend) {
    var list = $("#favorites-thumbs");
    var items = list.find("div.col-xs-3");
    prepend = prepend || false;
    
    for(var i = 0; i < favorites.length; i++) {
        (function(fav) {
            if (favoriteExists(items, fav)) {
                return;
            }
            
            var col = $('<div class="col-xs-3">');
            col.data("tid", fav.type + fav.uid);
            if (prepend) {
                list.prepend(col);
            } else {
                list.append(col);
            }
            
            var thumb = $('<div class="thumbnail">');
            col.append(thumb);
            
            var a_img = $('<a target="_blank">');
            a_img.attr("href", mediaUrl(fav));
            thumb.append(a_img);
            
            var img = $('<img />');
            img.attr("src", thumbnailUrl(fav, "mq"));
            a_img.append(img);
            
            var title = $('<h4/>');
            thumb.append(title);
            
            var a_title = $('<a target="_blank"/>');
            a_title.attr("href", mediaUrl(fav));
            a_title.text(fav.title);
            title.append(a_title);
            
            var btn_group = $('<div class="btn-group">');
            thumb.append(btn_group);
            
            if(hasPermission("playlistnext")) {
                var btn_next = $('<button class="btn btn-xs btn-default">Next</button>');
                btn_group.append(btn_next);
                btn_next.on("click", function() {
                    socket.emit("queue", {
                        id: fav.uid,
                        pos: "next",
                        type: fav.type,
                        temp: $(".add-temp").prop("checked")
                    });
                });
            }
            
            var btn_end = $('<button class="btn btn-xs btn-default">End</button>');
            btn_group.append(btn_end);
            btn_end.on("click", function() {
                socket.emit("queue", {
                    id: fav.uid,
                    pos: "end",
                    type: fav.type,
                    temp: $(".add-temp").prop("checked")
                });
            });
        })(favorites[i]);
    }
}

function favoriteExists(items, media) {
    var found = false;
    items.each(function(i, item) {
        if ($(item).data("tid") == (media.type + media.uid)) {
            found = true;
        }
    });
    return found;
}

function formatTags(tags) {
    var list  = $("#favorites-tag-list");
    var items = list.find("li");
    for(var i = 0; i < tags.length; i++) {
        (function(tag) {
            if (!tagExists(items, tag)) {
                var item = $('<li class="tag label"/>');
                var name = $('<span/>');
                name.text(tag);
                item.append(name);
                item.on("click", function() {
                    socket.emit("favoritesGet", tag);
                });
                list.append(item);
            }
        })(tags[i]);
    }
}

function tagExists(items, tag) {
    var found = false;
    items.each(function(i, item) {
        if ($(item).find("span:first").text() == tag) {
            found = true;
        }
    });
    return found;
}

function formatTime(sec) {
    var h = Math.floor(sec / 3600) + "";
    var m = Math.floor((sec % 3600) / 60) + "";
    var s = sec % 60 + "";

    if (h.length < 2) {
        h = "0" + h;
    }

    if (m.length < 2) {
        m = "0" + m;
    }

    if (s.length < 2) {
        s = "0" + s;
    }

    if (h === "00") {
        return [m, s].join(":");
    } else {
        return [h, m, s].join(":");
    }
}

function formatUserPlaylistList() {
    var list = $("#userpl_list").data("entries") || [];
    list.sort(function (a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return x == y ? 0 : (x < y ? -1 : 1);
    });

    $("#userpl_list").html("");
    list.forEach(function (pl) {
        var li = $("<li/>").addClass("queue_entry").appendTo($("#userpl_list"));
        var title = $("<span/>").addClass("qe_title").appendTo(li)
            .text(pl.name);
        var time = $("<span/>").addClass("pull-right").appendTo(li)
            .text(pl.count + " items, playtime " + formatTime(pl.duration));
        var clear = $("<div/>").addClass("qe_clear").appendTo(li);

        var btns = $("<div/>").addClass("btn-group pull-left").prependTo(li);
        if (hasPermission("playlistadd")) {
            $("<button/>").addClass("btn btn-xs btn-default")
                .text("End")
                .appendTo(btns)
                .click(function () {
                    socket.emit("queuePlaylist", {
                        name: pl.name,
                        pos: "end",
                        temp: $(".add-temp").prop("checked")
                    });
                });
        }

        if (hasPermission("playlistadd") && hasPermission("playlistnext")) {
            $("<button/>").addClass("btn btn-xs btn-default")
                .text("Next")
                .prependTo(btns)
                .click(function () {
                    socket.emit("queuePlaylist", {
                        name: pl.name,
                        pos: "next",
                        temp: $(".add-temp").prop("checked")
                    });
                });
        }

        $("<button/>").addClass("btn btn-xs btn-danger")
            .html("<span class='glyphicon glyphicon-trash'></span>")
            .attr("title", "Delete playlist")
            .appendTo(btns)
            .click(function () {
                var really = confirm("Are you sure you want to delete" +
                    " this playlist? This cannot be undone.");
                if (!really) {
                    return;
                }
                socket.emit("deletePlaylist", {
                    name: pl.name
                });
            });
    });
}

function loadEmotes(data) {
    CHANNEL.emotes = [];
    data.forEach(function (e) {
        if (e.image && e.name) {
            e.regex = new RegExp(e.source, "gi");
            CHANNEL.emotes.push(e);
        } else {
            console.error("Rejecting invalid emote: " + JSON.stringify(e));
        }
    });
}

function loadUserEmotes(data) {
    CLIENT.emotes = [];
    data.forEach(function (e) {
        if (e.url && e.text) {
            e.source = '(^|\s)' + e.text + '(?!\S)';
            e.name   = e.text;
            e.image  = e.url;
            e.regex  = new RegExp(e.source, "gi");
            CLIENT.emotes.push(e);
        } else {
            console.error("Rejecting invalid emote: " + JSON.stringify(e));
        }
    });
}

function execEmotes(msg) {
    if (USEROPTS.no_emotes) {
        return msg;
    }
    
    CHANNEL.emotes.forEach(function (e) {
        msg = msg.replace(e.regex, '$1<img class="channel-emote" src="' +
                                   e.image + '" title="' + e.name + '">');
    });

    return msg;
}

function initPm(user) {
    if ($("#pm-" + user).length > 0) {
        return $("#pm-" + user);
    }
    
    var pm = $("<div/>")
        .addClass("pm-panel")
        .appendTo($("#pmbar"))
        .data("last", { name: "" })
        .data("unread_msg_count", 0)
        .attr("id", "pm-" + user);

    var title = $("<div/>")
        .addClass("panel-heading")
        .html("<span>" + user + "</span>")
        .data("username", user)
        .appendTo(pm);
    
    var close = $("<span/>")
        .addClass("pm-close pull-right glyphicon glyphicon-remove")
        .attr("title", "Close")
        .appendTo(title);
        
    var expand = $("<span/>")
        .addClass("pm-expand pull-right glyphicon glyphicon-new-window")
        .attr("title", "Expand")
        .appendTo(title);
    
    close.on("click", function () {
        pm.remove();
        $("#pm-placeholder-" + user).remove();
    });
        
    expand.on("click", function() {
        if (pm.is(".expanded")) {
            pm.removeClass("expanded");
            $("#pm-placeholder-" + user).removeClass("expanded");
        } else {
            pm.addClass("expanded");
            $("#pm-placeholder-" + user).addClass("expanded");
        }
        
        return false;
    });

    var body = $("<div/>")
        .addClass("panel-body")
        .appendTo(pm).hide();
    var placeholder;
    
    var buffer = $("<div/>").addClass("pm-buffer linewrap").appendTo(body);
    $("<hr/>").appendTo(body);
    var input = $("<input/>").addClass("form-control pm-input").attr("type", "text")
        .attr("maxlength", 240)
        .appendTo(body);

    input.keydown(function (ev) {
        if (ev.keyCode === 13) {
            if (CHATTHROTTLE) {
                return;
            }
            var meta = {};
            var msg = input.val();
            if (msg.trim() === "") {
                return;
            }

            if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
                meta.modflair = CLIENT.rank;
            }

            if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                meta.modflair = CLIENT.rank;
                msg = msg.substring(3);
            }
            socket.emit("pm", {
                to: user,
                msg: msg,
                meta: meta
            });
            input.val("");
        }
    });
    
    title.click(function () {
        body.toggle();
        pm.removeClass("panel-primary").addClass("panel-default");
        
        if (!body.is(":hidden")) {
            placeholder = $("<div/>")
                .addClass("pm-panel-placeholder")
                .attr("id", "pm-placeholder-" + user)
                .insertAfter(pm);
            if (pm.is(".expanded")) {
                placeholder.addClass("expanded");
            }
            var left = pm.position().left;
            pm.css("position", "absolute")
                .css("bottom", "0px")
                .css("left", left);
            title.find("span:first").text(title.data("username"));
            buffer.scrollTop(buffer.prop("scrollHeight"));
        } else {
            pm.css("position", "");
            $("#pm-placeholder-" + user).remove();
        }
    });

    return pm;
}

function killVideoUntilItIsDead(video) {
    try {
        video[0].volume = 0;
        video[0].muted = true;
        video.attr("src", "");
        video.remove();
    } catch (e) {
    }
}

function fallbackRaw(data) {
    $("<div/>").insertBefore($("#ytapiplayer")).attr("id", "ytapiplayer");
    $("video").each(function () {
        killVideoUntilItIsDead($(this));
    });
    $("audio").each(function () {
        killVideoUntilItIsDead($(this));
    });
    data.type = "fl";
    data.url = data.direct.sd.url;
    PLAYER.player = undefined;
    PLAYER = new FlashPlayer(data);

    handleMediaUpdate(data);
}

function checkScriptAccess(source, type, cb) {
    var pref = JSPREF[CHANNEL.name.toLowerCase() + "_" + type];
    if (pref === "ALLOW") {
        return cb("ALLOW");
    } else if (pref !== "DENY") {
        var div = $("#chanjs-allow-prompt");
        if (div.length > 0) {
            setTimeout(function () {
                checkScriptAccess(source, type, cb);
            }, 500);
            return;
        }

        div = $("<div/>").attr("id", "chanjs-allow-prompt");
        var close = $("<button/>").addClass("close pull-right")
            .html("&times;")
            .appendTo(div);
        var form = $("<form/>")
            .attr("action", "javascript:void(0)")
            .attr("id", "chanjs-allow-prompt")
            .attr("style", "text-align: center")
            .appendTo(div);
        form.append("<span>This channel has special features that require your permission to run.</span><br>");
        $("<a/>").attr("href", source)
            .attr("target", "_blank")
            .text(type === "embedded" ? "view embedded script" : source)
            .appendTo(form);
        form.append("<div id='chanjs-allow-prompt-buttons'>" +
                        "<button id='chanjs-allow' class='btn btn-xs btn-danger'>Allow</button>" +
                        "<button id='chanjs-deny' class='btn btn-xs btn-danger'>Deny</button>" +
                    "</div>");
        form.append("<div class='checkbox'><label><input type='checkbox' " +
                    "id='chanjs-save-pref'/>Remember my choice for this channel" +
                    "</label></div>");
        var dialog = chatDialog(div);

        close.click(function () {
            dialog.remove();
            /* Implicit denial of script access */
            cb("DENY");
        });

        $("#chanjs-allow").click(function () {
            var save = $("#chanjs-save-pref").is(":checked");
            dialog.remove();
            if (save) {
                JSPREF[CHANNEL.name.toLowerCase() + "_" + type] = "ALLOW";
                setOpt("channel_js_pref", JSPREF);
            }
            cb("ALLOW");
        });

        $("#chanjs-deny").click(function () {
            var save = $("#chanjs-save-pref").is(":checked");
            dialog.remove();
            if (save) {
                JSPREF[CHANNEL.name.toLowerCase() + "_" + type] = "DENY";
                setOpt("channel_js_pref", JSPREF);
            }
            cb("DENY");
        });
    }
}

function formatScriptAccessPrefs() {
    var tbl = $("#us-scriptcontrol table");
    tbl.find("tbody").remove();

    var channels = Object.keys(JSPREF).sort();
    channels.forEach(function (channel) {
        var parts = channel.split("_");
        if (!parts[1].match(/^(external|embedded)$/)) {
            return;
        }

        var pref = JSPREF[channel];
        var tr = $("<tr/>").appendTo(tbl);
        $("<td/>").text(parts[0]).appendTo(tr);
        $("<td/>").text(parts[1]).appendTo(tr);

        var pref_td = $("<td/>").appendTo(tr);
        var allow_label = $("<label/>").addClass("radio-inline")
            .text("Allow").appendTo(pref_td);
        var allow = $("<input/>").attr("type", "radio")
            .prop("checked", pref === "ALLOW").
            prependTo(allow_label);
        allow.change(function () {
            if (allow.is(":checked")) {
                JSPREF[channel] = "ALLOW";
                setOpt("channel_js_pref", JSPREF);
                deny.prop("checked", false);
            }
        });

        var deny_label = $("<label/>").addClass("radio-inline")
            .text("Deny").appendTo(pref_td);
        var deny = $("<input/>").attr("type", "radio")
            .prop("checked", pref === "DENY").
            prependTo(deny_label);
        deny.change(function () {
            if (deny.is(":checked")) {
                JSPREF[channel] = "DENY";
                setOpt("channel_js_pref", JSPREF);
                allow.prop("checked", false);
            }
        });

        var clearpref = $("<button/>").addClass("btn btn-sm btn-danger")
            .text("Clear Preference")
            .appendTo($("<td/>").appendTo(tr))
            .click(function () {
                delete JSPREF[channel];
                setOpt("channel_js_pref", JSPREF);
                tr.remove();
            });
    });
}

function formatTimestamp(time) {
    var d = new Date(time);
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}

/*
    VIMEO SIMULATOR 2014

    Vimeo decided to block my domain.  After repeated emails, they refused to
    unblock it.  Rather than give in to their demands, there is a serverside
    option which extracts direct links to the h264 encoded MP4 video files.
    These files can be loaded in a custom player to allow Vimeo playback without
    triggering their dumb API domain block.

    It's a little bit hacky, but my only other option is to keep buying new
    domains every time one gets blocked.  No thanks to Vimeo, who were of no help
    and unwilling to compromise on the issue.
*/
function vimeoSimulator2014(data) {
    /* Vimeo Simulator uses the raw file player */
    data.type = "fi";

    /* Convert youtube-style quality key to vimeo workaround quality */
    var q = {
        small: "mobile",
        medium: "sd",
        large: "sd",
        hd720: "hd",
        hd1080:"hd",
        highres: "hd"
    }[USEROPTS.default_quality] || "sd";

    var fallback = {
        hd: "sd",
        sd: "mobile",
        mobile: false
    };

    /* Pick highest quality less than or equal to user's preference from the options */
    while (!(q in data.meta.direct) && q != false) {
        q = fallback[q];
    }
    if (!q) {
        q = "sd";
    }

    data.url = data.meta.direct[q].url;
    return data;
}

function googlePlusSimulator2014(data) {
    /* Google+ Simulator uses the raw file player */
    data.type = "fi";

    if (!data.meta.gpdirect) {
        data.url = "";
        return data;
    }

    /* Convert youtube-style quality key to vimeo workaround quality */
    var q = USEROPTS.default_quality || "auto";
    if (q === "highres") {
        q = "hd1080";
    }

    var fallbacks = ["hd1080", "hd720", "large", "medium", "small"];
    var i = fallbacks.indexOf(q);
    if (i < 0) {
        i = fallbacks.indexOf("medium");
    }

    while (!(q in data.meta.gpdirect) && i < fallbacks.length) {
        q = fallbacks[i++];
    }

    if (i === fallbacks.length) {
        var hasCodecs = Object.keys(data.meta.gpdirect);
        if (hasCodecs.length > 0) {
            q = hasCodecs[0];
        }
    }

    data.url = data.meta.gpdirect[q].url;
    data.contentType = data.meta.gpdirect[q].contentType;
    return data;
}

function EmoteList(selector) {
    this.elem = $(selector);
    this.initSearch();
    this.initSortOption();
    this.table = this.elem.find(".emotelist-table")[0];
    this.paginatorContainer = this.elem.find(".emotelist-paginator-container");
    this.cols = 5;
    this.itemsPerPage = 25;
    this.emotes = [];
    this.page = 0;
}

EmoteList.prototype.initSearch = function () {
    this.searchbar = this.elem.find(".emotelist-search");
    var self = this;

    this.searchbar.keyup(function () {
        var value = this.value.toLowerCase();
        if (value) {
            self.filter = function (emote) {
                return emote.name.toLowerCase().indexOf(value) >= 0;
            };
        } else {
            self.filter = null;
        }
        self.handleChange();
        self.loadPage(0);
    });
};

EmoteList.prototype.initSortOption = function () {
    this.sortOption = this.elem.find(".emotelist-alphabetical");
    this.sortAlphabetical = false;
    var self = this;

    this.sortOption.change(function () {
        self.sortAlphabetical = this.checked;
        self.handleChange();
        self.loadPage(0);
    });
};

EmoteList.prototype.handleChange = function () {
    var user_emotes = CLIENT.emotes.slice();
    this.emotes = user_emotes.concat(CHANNEL.emotes.slice());
    
    if (this.sortAlphabetical) {
        this.emotes.sort(function (a, b) {
            var x = a.name.toLowerCase();
            var y = b.name.toLowerCase();

            if (x < y) {
                return -1;
            } else if (x > y) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    if (this.filter) {
        this.emotes = this.emotes.filter(this.filter);
    }

    this.paginator = new NewPaginator(this.emotes.length, this.itemsPerPage,
            this.loadPage.bind(this));
    this.paginatorContainer.html("");
    this.paginatorContainer.append(this.paginator.elem);
    this.paginator.loadPage(this.page);
};

EmoteList.prototype.loadPage = function (page) {
    var tbody = this.table.children[0];
    tbody.innerHTML = "";
    
    var row;
    var start = page * this.itemsPerPage;
    if (start >= this.emotes.length) return;
    var end = Math.min(start + this.itemsPerPage, this.emotes.length);
    var _this = this;

    for (var i = start; i < end; i++) {
        if ((i - start) % this.cols === 0) {
            row = document.createElement("tr");
            tbody.appendChild(row);
        }

        (function (emote) {
            var td = document.createElement("td");
            td.className = "emote-preview-container";

            // Trick element to vertically align the emote within the container
            var hax = document.createElement("span");
            hax.className = "emote-preview-hax";
            td.appendChild(hax);

            var img = document.createElement("img");
            img.src = emote.image;
            img.className = "emote-preview";
            img.title = emote.name;
            img.onclick = function () {
                var val = chatline.value;
                if (!val) {
                    chatline.value = emote.name;
                } else {
                    if (!val.charAt(val.length - 1).match(/\s/)) {
                        chatline.value += " ";
                    }
                    chatline.value += emote.name;
                }

                _this.modal.modal("hide");
                chatline.focus();
            };

            td.appendChild(img);
            row.appendChild(td);
        })(this.emotes[i]);
    }

    this.page = page;
};

window.EMOTELIST = new EmoteList("#emotelist");
window.EMOTELIST.sortAlphabetical = USEROPTS.emotelist_sort;

function showChannelSettings() {
    hidePlayer();
    $("#channeloptions").on("hidden.bs.modal", function () {
        unhidePlayer();
    });

    $("#channeloptions").modal();
}

function humanFileSize(bytes) {
    var thresh = 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = ['KB','MB','GB','TB','PB','EB','ZB','YB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function secondsToTime(seconds) {
    seconds = Math.floor(seconds);
    var hours = Math.floor(seconds / 3600);
    seconds -= hours*3600;
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes*60;
    
    var d_hours = "00", d_minutes = "00", d_seconds = "00";
    if (hours   < 10) {d_hours   = "0"+hours;}
    if (minutes < 10) {d_minutes = "0"+minutes;}
    if (seconds < 10) {d_seconds = "0"+seconds;}
    
    if (hours > 0) {
        return d_hours + ':' + d_minutes + ':' + d_seconds;
    } else {
        return d_minutes + ':' + d_seconds;
    }
}

function mediaUrl(media) {
    switch(media.type) {
        case "yt":
            return "http://youtube.com/watch?v=" + media.uid;
            break;
        case "sc":
            return media.uid;
            break;
        case "vi":
            return "http://vimeo.com/" + media.uid;
            break;
        case "dm":
            return "http://dailymotion.com/video/" + media.uid;
            break;
        case "li":
            return "http://livestream.com/" + media.uid;
            break;
        case "tw":
            return "http://twitch.tv/" + media.uid;
            break;
        case "im":
            return "http://imgur.com/a/" + media.uid;
            break;
        case "us":
            return "http://imgur.com/a/" + media.uid;
            break;
        case "gd":
            return "https://docs.google.com/file/d/" + media.uid;
            break;
        case "hb":
            return "http://hitbox.tv/" + media.uid;
            break;
        default:
            return media.uid;
            break;
        
    }
}

function thumbnailUrl(media, size) {
    size = size || "default";
    switch(media.type) {
        case "yt":
            var file = (size == "default") ? "/default.jpg" : "/mqdefault.jpg";
            return "https://i.ytimg.com/vi/" + media.uid + file;
            break;
        case "sc":
            return "/img/thumbs/sc.png";
            break;
        case "vi":
            return "/img/thumbs/missing.jpg";
            break;
        case "dm":
            return "/img/thumbs/missing.jpg";
            break;
        case "li":
            return "/img/thumbs/missing.jpg";
            break;
        case "tw":
            return "/img/thumbs/missing.jpg";
            break;
        case "im":
            return "/img/thumbs/missing.jpg";
            break;
        case "us":
            return "/img/thumbs/missing.jpg";
            break;
        case "gd":
            return "/img/thumbs/missing.jpg";
            break;
        case "hb":
            return "/img/thumbs/missing.jpg";
            break;
        default:
            return "/img/thumbs/missing.jpg";
            break;
        
    }
}

function timeSince(timeStamp) {
    var now = new Date(),
        secondsPast = (now.getTime() - timeStamp.getTime() ) / 1000;
    if(secondsPast < 60){
        return parseInt(secondsPast) + 's';
    }
    if(secondsPast < 3600){
        return parseInt(secondsPast/60) + 'm';
    }
    if(secondsPast <= 86400){
        return parseInt(secondsPast/3600) + 'h';
    }
    if(secondsPast > 86400){
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
        return day + " " + month + year;
    }
}

function installUserScript(script) {
    var script_url = SCRIPTS_BASE_URL + "/" + script;
    
    $.ajax({
        url: SCRIPTS_BASE_URL + "/meta.json",
        dataType: "json",
        cache: false
    }).done(function(res) {
        if (typeof res[script] === "undefined") {
            return alert("Unable to fetch script meta data. Try again in a minute.");
        }
        
        var meta = res[script];
        $("#install-script-name").text(meta.name + " v" + meta.version);
        $("#install-script-author").text("Author: " + meta.author);
        $("#install-script-description").text(meta.description);
        $("#install-script-open-anchor").attr("href", script_url);
        
        $.ajax({
            url: script_url,
            cache: false
        }).done(function(script_text) {
            
            var preview_input = $("#install-script-preview-input");
            preview_input.val(script_text);
            var save_as_input = $("#install-script-save-as-input");
            save_as_input.val(script);
        
            var button = $("#install-script-install-btn");
            button
                .prop("disabled", true)
                .text("(4) Please wait...")
                .off("click.install_script")
                .on("click.install_script", function() {
                    var filename = save_as_input.val().trim();
                    if (filename.length == 0) {
                        save_as_input.parent().addClass("has-error");
                        return alert("Script name cannot be blank.");
                    }
                    if (filename.match(/[^\sa-zA-Z0-9_\-\.]/)) {
                        save_as_input.parent().addClass("has-error");
                        return alert("Only letters, numbers, spaces, underscores, dashes and periods allowed in script names.");
                    }
                    save_as_input.parent().removeClass("has-error");
                    
                    $.ajax({
                        url: "/scripting/exists",
                        cache: false,
                        data: {
                            name: script
                        }
                    }).done(function(res) {
                        var okay = true;
                        if (res !== "false") {
                            okay = confirm("A script with the name " + script + " already exists. Overwrite it?");
                        }
                        if (okay) {
                            socket.emit("installUserScript", {
                                name: filename,
                                url: script_url
                            });
                        }
                    }).fail(function(xhr) {
                        return alert(xhr.responseText);
                    });
                });
    
            $("#install-script-modal").modal("show");
            
            var counter = 3;
            var timer   = null;
            timer = setInterval(function() {
                button.text("(" + counter + ") Please wait...");
                counter--;
                if (counter == -1) {
                    clearInterval(timer);
                    button
                        .text("Install")
                        .prop("disabled", false);
                }
            }, 1000);
            
        }).fail(function(xhr) {
            alert(xhr.responseText);
        });
    }).fail(function(xhr) {
        alert(xhr.responseText);
    });
}

var PING_START_TIME = null;

function sendPing() {
    PING_START_TIME = Date.now();
    socket.emit("chatPing", {});
}

function handlePong() {
    if (PING_START_TIME === null) {
        return;
    }
    
    var elapsed = (Date.now()) - PING_START_TIME;
    PING_START_TIME = null;
    addNotice({
        msg: "Ping time: " + elapsed + "ms",
        time: Date.now()
    });
}

setInterval(function() {
    $(".pm-timestamp").each(function(i, item) {
        item = $(item);
        var diff = timeSince(new Date(item.data("time")));
        item.text(diff);
    });
}, 30000);