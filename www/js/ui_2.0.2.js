/* window focus/blur */
$(window).focus(function() {
    FOCUSED = true;
    if (ChatAPI.trigger("unblink").isCancelled()) {
        return;
    }
    
    clearInterval(TITLE_BLINK);
    TITLE_BLINK = false;
    document.title = PAGETITLE;
    UNREAD_MSG_COUNT = 0;
}).blur(function() {
    FOCUSED = false;
});

$("#togglemotd").click(function () {
    var hidden = $("#motd").css("display") === "none";
    $("#motd").toggle();
    if (hidden) {
        $("#togglemotd").find(".glyphicon-plus")
            .removeClass("glyphicon-plus")
            .addClass("glyphicon-minus");
    } else {
        $("#togglemotd").find(".glyphicon-minus")
            .removeClass("glyphicon-minus")
            .addClass("glyphicon-plus");
    }
});

/* chatbox */

$(function() {
    if (USEROPTS.show_colors) {
        $("#chatcolor").spectrum({
            color: CHAT_LINE_COLOR,
            preferredFormat: "hex",
            showInput: true,
            clickoutFiresChange: true,
            replacerClassName: "chatline-color-picker"
        }).on("change", function () {
            CHAT_LINE_COLOR = $(this).val();
            ChatAPI.trigger("color_change", CHAT_LINE_COLOR);
            window.localStorage.setItem("chat_line_color", CHAT_LINE_COLOR);
        });
    } else {
        $("#chatcolor").hide();
    }
    
    var voteup   = $("#voteup");
    var votedown = $("#votedown");
    voteup.click(function() {
        socket.emit("voteVideo", 1);
        if (voteup.is(".active")) {
            voteup.removeClass("active");
        } else {
            voteup.addClass("active");
            votedown.removeClass("active");
        }
    });
    votedown.click(function() {
        socket.emit("voteVideo", -1);
        if (votedown.is(".active")) {
            votedown.removeClass("active");
        } else {
            votedown.addClass("active");
            voteup.removeClass("active");
        }
    });
    
    $("#clearbtn").click(function() {
        $("#messagebuffer").empty();
    });
    
    $('#chatline').textcomplete([
        {
            id: 'emoji',
            match: /\B:([\-+\w]*)$/,
            search: function (term, callback) {
                callback($.map(CLIENT.emotes, function (emoji) {
                    return emoji.text.replace(':', '').indexOf(term) === 0 ? emoji : null;
                }));
            },
            template: function (value) {
                return '<img src="' + value.image + '" class="dropdown-emote"></img>' + value.text;
            },
            replace: function (value) {
                return value.text + ' ';
            },
            index: 1
        }
    ], {
        maxCount: 5,
        onKeydown: function (e, commands) {
            if (e.ctrlKey && e.keyCode === 74) { // CTRL-J
                return commands.KEY_ENTER;
            }
        }
    });
    
    var default_scripting = $("#user-script-pane-default textarea");
    tabOverride.tabSize(4);
    tabOverride.autoIndent(true);
    tabOverride.set(default_scripting[0]);
    
    $("#user-scripting-browse-btn").on("click", function() {
        window.open("https://scripts.upnext.fm");
    });
    $("#user-scripting-help-btn").on("click", function() {
        window.open("https://scripts.upnext.fm#docs");
    });
    $("#user-scripting-safe-mode-btn").on("click", function() {
        if (confirm("This will refresh the page with scripts disabled. Continue?")) {
            document.location = document.location + "?safemode";
        }
    });
    $("#user-scripting-install-btn").on("click", function() {
        var container = $("#user-scripting-import-container");
        var input     = container.find("input");
        
        input.on("keyup", function(e) {
            if (e.keyCode == 13) {
                var value = input.val();
                var matches = value.match(SCRIPTS_REGEX);
                if (matches === null) {
                    return alert("Invalid script url.");
                }
                
                input.val("");
                container.slideUp();
                installUserScript(matches[1] + ".js");
                e.preventDefault();
            }
        });
        
        container.slideToggle(function() {
            if (container.is(":visible")) {
                input.focus();
            }
        });
    });
    
    $(function() {
        var scripting_box_full    = false;
        var user_options          = $("#useroptions");
        var user_emotes           = $("#us-user-emotes");
        var scripting_expand_btn  = $("#user-scripting-expand-btn");
        var scripting_expand_icon = scripting_expand_btn.find(".glyphicon:first");
        var scripting_box         = $("#us-scripting");
        var options_footer        = $("#user-scripting-modal-footer");
    
        window.shrinkScriptingBox = function() {
            scripting_box.detach();
            scripting_box.removeClass("scripting-fullscreen");
            user_emotes.after(scripting_box);
            options_footer.hide();
        
            scripting_expand_btn.attr("title", "Full screen");
            scripting_expand_icon
                .removeClass("glyphicon-resize-small")
                .addClass("glyphicon-resize-full");
            user_options.show();
            $("body").css("overflow", "auto");
            scripting_box.trigger("shrunk.scripting");
        };
        
        window.expandScriptingBox = function() {
            scripting_box.detach();
            scripting_box.addClass("scripting-fullscreen");
            $("#main").append(scripting_box);
            options_footer.show();
        
            scripting_expand_btn.attr("title", "Small screen");
            scripting_expand_icon
                .addClass("glyphicon-resize-small")
                .removeClass("glyphicon-resize-full");
            user_options.hide();
            $("body").css("overflow", "hidden");
            options_footer.find(".btn-scripting-close-btn").on("click.scripting_box_expanded", function() {
                $(this).off("click.scripting_box_expanded");
                shrinkScriptingBox();
                $("#useroptions").modal("hide");
            });
    
            scripting_box.trigger("expanded.scripting");
        };
        
        scripting_expand_btn.on("click", function() {
            scripting_box_full = !scripting_box_full;
            if (scripting_box_full) {
                expandScriptingBox();
            } else {
                shrinkScriptingBox();
            }
        });
    });
    
    $("#user-scripting-create-btn").on("click", function() {
        var name = prompt("Name of the file.");
        if (!name) {
            return;
        }
        if (name.match(/[^\sa-zA-Z0-9_\-\.]/)) {
            alert("Special characters are not allowed in script names. Only letters, numbers, spaces, underscores, dashes and periods may be used.");
            return;
        }
        if (name.length > 20) {
            alert("Script names must contain 20 characters or less.");
            return;
        }
        
        var name_low = name.toLowerCase().replace(" ", "-").replace(".", "-");
        var tabs     = $("#user-scripting-tabs");
        var found    = false;
        tabs.find('[role="tab"]').each(function(i, item) {
            if ($(item).attr("href") == ("#user-script-pane-" + name_low)) {
                found = true;
            }
        });
        if (found) {
            alert("The script name must be unique.");
            return;
        }
        
        var data = ChatAPI._createScriptingTab({name: name, script: ""});
        ChatAPI._scripts_changed = true;
        
        var items = tabs.children("li").get();
        items.sort(function(a, b) {
            if ($(a).text().indexOf("Default") !== -1) return -1;
            return $(a).find("a").text().toUpperCase().localeCompare($(b).find("a").text().toUpperCase());
        });
        $.each(items, function(idx, itm) { tabs.append(itm); });
        
        setTimeout(function() {
            data.anchor.click();
            data.textarea.focus();
        }, 250);
    });
    
    var chat_attachment_btn  = $("#chat-attachment-btn");
    var chat_attachment_file = $("#chat-attachment-file");
    chat_attachment_file.on("change", function() {
        if (this.files.length == 0 || !hasPermission("attachment")) {
            return;
        }
        
        var file = this.files[0];
        var fr   = new FileReader();
        var ext  = file.name.split('.').pop().toLowerCase();
        if (["exe", "com", "bat", "msi", "msp", "application", "scr", "cmd", "ws", "wsf", "reg", "gadget", "hta", "cpl", "msc", "jar", "scf", "lnk", "inf"].indexOf(ext) !== -1) {
            alert("File type not allowed.");
            return;
        }
        if (file.size > 10485760) {
            alert("Attachments exceeds 10MB limit.");
            return;
        }
    
        chat_attachment_btn
            .empty()
            .append('<img src="/img/spinner2.gif" />');
        fr.addEventListener("loadend", function() {
            socket.emit("chatAttachment", {
                name: file.name,
                type: file.type,
                data: fr.result
            });
            chat_attachment_file.val("");
        });
        fr.readAsArrayBuffer(file);
    });
    chat_attachment_btn.on("click", function() {
        chat_attachment_file.click();
    });
    
    var wider_layout = $("#widerlayout");
    wider_layout.on("click", function() {
        var target = $(this);
        if (target.data("size") == "small") {
            target.data("size", "big");
            target.html('<span class="glyphicon glyphicon-resize-small"></span> Smaller');
            
            $(".col-video-side")
                .removeClass("col-sm-6")
                .addClass("col-sm-7");
            $(".col-chat-side")
                .removeClass("col-sm-6")
                .addClass("col-sm-5");
    
        } else {
            target.data("size", "small");
            target.html('<span class="glyphicon glyphicon-resize-full"></span> Bigger');
            
            $(".col-video-side")
                .addClass("col-sm-6")
                .removeClass("col-sm-7");
            $(".col-chat-side")
                .addClass("col-sm-6")
                .removeClass("col-sm-5");
        }
    
        ChatStore.local.set("widerlayout", target.data("size"));
        handleWindowResize();
        scrollChat();
    });
    
    var layout = ChatStore.local.get("widerlayout", null);
    if (layout != null) {
        wider_layout.data("size", layout == "small" ? "big" : "small").click();
    }
    
    $("#search_clear").on("click", clearSearchResults);
    
    var btn_grid = $(".btn-grid");
    var btn_rows = $(".btn-rows");
    btn_grid.on("click", function() {
        btn_grid.addClass("activated");
        btn_rows.removeClass("activated");
        USEROPTS.thumb_layout = "grid";
    
        var list = $("#favorites-thumbs");
        list.empty();
        formatFavorites();
        formatSearchResults();
        setOpt("thumb_layout", "grid");
    });
    btn_rows.on("click", function() {
        btn_grid.removeClass("activated");
        btn_rows.addClass("activated");
        USEROPTS.thumb_layout = "rows";
    
        var list = $("#favorites-thumbs");
        list.empty();
        formatFavorites();
        formatSearchResults();
        setOpt("thumb_layout", "rows");
    });
});


$("#modflair").click(function () {
    var m = $("#modflair");
    if (USEROPTS.modhat) {
        USEROPTS.modhat = false;
        m.removeClass("activated");
    } else {
        USEROPTS.modhat = true;
        m.addClass("activated");
    }
});

$("#messagebuffer").scroll(function (ev) {
    if (IGNORE_SCROLL_EVENT) {
        // Skip event, this was triggered by scrollChat() and not by a user action.
        // Reset for next event.
        IGNORE_SCROLL_EVENT = false;
        return;
    }

    var m = $("#messagebuffer");
    var lastChildHeight = 0;
    var messages = m.children();
    if (messages.length > 0) {
        lastChildHeight = messages[messages.length - 1].clientHeight || 0;
    }

    var isCaughtUp = m.height() + m.scrollTop() >= m.prop("scrollHeight") - lastChildHeight;
    if (isCaughtUp) {
        SCROLLCHAT = true;
        $("#newmessages-indicator").remove();
    } else {
        SCROLLCHAT = false;
    }
});

$("#guestname").keydown(function (ev) {
    if (ev.keyCode === 13) {
        socket.emit("login", {
            name: $("#guestname").val()
        });
    }
});

function chatTabComplete(element, separator) {
    element   = (element === undefined) ? $("#chatline") : element;
    separator = separator || ":";
    
    var words = element.val().split(" ");
    var current = words[words.length - 1].toLowerCase();
    if (!current.match(/^[\w-]{1,20}$/)) {
        return;
    }

    var __slice = Array.prototype.slice;
    var usersWithCap = __slice.call($("#userlist").children()).map(function (elem) {
        return elem.children[1].innerHTML;
    });
    var users = __slice.call(usersWithCap).map(function (user) {
        return user.toLowerCase();
    }).filter(function (name) {
        return name.indexOf(current) === 0;
    });

    // users now contains a list of names that start with current word

    if (users.length === 0) {
        return;
    }

    // trim possible names to the shortest possible completion
    var min = Math.min.apply(Math, users.map(function (name) {
        return name.length;
    }));
    users = users.map(function (name) {
        return name.substring(0, min);
    });

    // continually trim off letters until all prefixes are the same
    var changed = true;
    var iter = 21;
    while (changed) {
        changed = false;
        var first = users[0];
        for (var i = 1; i < users.length; i++) {
            if (users[i] !== first) {
                changed = true;
                break;
            }
        }

        if (changed) {
            users = users.map(function (name) {
                return name.substring(0, name.length - 1);
            });
        }

        // In the event something above doesn't generate a break condition, limit
        // the maximum number of repetitions
        if (--iter < 0) {
            break;
        }
    }

    current = users[0].substring(0, min);
    for (var i = 0; i < usersWithCap.length; i++) {
        if (usersWithCap[i].toLowerCase() === current) {
            current = usersWithCap[i];
            break;
        }
    }

    if (users.length === 1) {
        if (words.length === 1) {
            current += separator;
        }
        current += " ";
    }
    words[words.length - 1] = current;
    element.val(words.join(" "));
}

$("#chatline").keydown(function(ev) {
    // Enter/return
    if(ev.keyCode == 13) {
        if (CHATTHROTTLE) {
            return;
        }
        var msg = $("#chatline").val();
        if(msg.trim()) {
            if (msg.indexOf("/ping") === 0) {
                $("#chatline").val("");
                return sendPing(msg);
            }
            
            var meta = {};
            if (USEROPTS.adminhat && CLIENT.rank >= 255) {
                msg = "/a " + msg;
            } else if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
                meta.modflair = CLIENT.rank;
            }

            // The /m command no longer exists, so emulate it clientside
            if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                meta.modflair = CLIENT.rank;
                msg = msg.substring(3);
            }
            meta.color = CHAT_LINE_COLOR;
            var payload = {
                msg: msg,
                meta: meta
            };
            if (!ChatAPI.trigger("send", payload).isCancelled()) {
                socket.emit("chatMsg", payload);
            }

            CHATHIST.push($("#chatline").val());
            CHATHISTIDX = CHATHIST.length;
            $("#chatline").val("");
        }
    }
    else if(ev.keyCode == 9) { // Tab completion
        chatTabComplete();
        ev.preventDefault();
        return false;
    }
    else if(ev.keyCode == 38) { // Up arrow (input history)
        if(CHATHISTIDX == CHATHIST.length) {
            CHATHIST.push($("#chatline").val());
        }
        if(CHATHISTIDX > 0) {
            CHATHISTIDX--;
            $("#chatline").val(CHATHIST[CHATHISTIDX]);
        }

        ev.preventDefault();
        return false;
    }
    else if(ev.keyCode == 40) { // Down arrow (input history)
        if(CHATHISTIDX < CHATHIST.length - 1) {
            CHATHISTIDX++;
            $("#chatline").val(CHATHIST[CHATHISTIDX]);
        }

        ev.preventDefault();
        return false;
    }
});

/* poll controls */
$("#newpollbtn").click(showPollMenu);

$("#biobtn").click(showBio);

/* search controls */
$("#library_search").click(function() {
    if (!hasPermission("seeplaylist")) {
        $("#searchcontrol .alert").remove();
        var al = makeAlert("Permission Denied",
            "This channel does not allow you to search its library",
            "alert-danger");
        al.find(".alert").insertAfter($("#library_query").parent());
        return;
    }

    socket.emit("searchMedia", {
        source: "library",
        query: $("#library_query").val().toLowerCase()
    });
});

$("#library_query").keydown(function(ev) {
    if(ev.keyCode == 13) {
        if (!hasPermission("seeplaylist")) {
            $("#searchcontrol .alert").remove();
            var al = makeAlert("Permission Denied",
                "This channel does not allow you to search its library",
                "alert-danger");
            al.find(".alert").insertAfter($("#library_query").parent());
            return;
        }

        socket.emit("searchMedia", {
            source: "library",
            query: $("#library_query").val().toLowerCase()
        });
    }
});

$("#youtube_search").click(function () {
    var query = $("#library_query").val().toLowerCase();
    if(parseMediaLink(query).type !== null) {
        makeAlert("Media Link", "If you already have the link, paste it " +
                  "in the 'Media URL' box under Playlist Controls.  This "+
                  "searchbar works like YouTube's search function.",
                  "alert-danger")
            .insertBefore($("#library"));
    }

    socket.emit("searchMedia", {
        source: "yt",
        query: query
    });
});

/* user playlists */

$("#userpl_save").click(function() {
    if($("#userpl_name").val().trim() == "") {
        makeAlert("Invalid Name", "Playlist name cannot be empty", "alert-danger")
            .insertAfter($("#userpl_save").parent());
        return;
    }
    socket.emit("clonePlaylist", {
        name: $("#userpl_name").val()
    });
});

$('#favorites-tags').tagsinput({
    typeaheadjs: {
        name: "FAVORITE_TAGS",
        displayKey: "name",
        valueKey: "name",
        maxTags: 6,
        maxChars: 25,
        trimValue: true,
        source: FAVORITE_TAGS.ttAdapter()
    }
});

$("#favorites-add").on("click", function() {
    socket.emit("favoritesAdd", $("#favorites-tags").tagsinput("items"));
});

/* video controls */

$("#mediarefresh").click(function() {
    PLAYER.mediaType = "";
    PLAYER.mediaId = "";
    // playerReady triggers the server to send a changeMedia.
    // the changeMedia handler then reloads the player
    socket.emit("playerReady");
});

/* playlist controls */

$("#video-playlist").sortable({
    items: '.playlist-row:not(.playing)',
    axis: "y",
    start: function(ev, ui) {
        PL_FROM = ui.item.data("uid");
    },
    update: function(ev, ui) {
        var prev = ui.item.prevAll();
        if(prev.length == 0) {
            PL_AFTER = "prepend";
        } else {
            PL_AFTER = $(prev[0]).data("uid");
        }
        socket.emit("moveMedia", {
            from: PL_FROM,
            after: PL_AFTER
        });
        $("#video-playlist")
            .sortable("cancel");
    }
}).disableSelection();


function queue(pos, src) {
    if (!src) {
        src = "url";
    }

    if (src === "customembed") {
        var title = $("#customembed-title").val();
        if (!title) {
            title = false;
        }
        var content = $("#customembed-content").val();

        socket.emit("queue", {
            id: content,
            title: title,
            pos: pos,
            type: "cu",
            temp: true
        });
    } else {
        var linkList = $("#mediaurl").val();
        var links = linkList.split(",http").map(function (link, i) {
            if (i > 0) {
                return "http" + link;
            } else {
                return link;
            }
        });

        if (pos === "next") links = links.reverse();
        if (pos === "next" && $("#queue li").length === 0) links.unshift(links.pop());
        var emitQueue = [];

        links.forEach(function (link) {
            var data = parseMediaLink(link);
            var duration = undefined;
            var title = undefined;
            if (data.type === "fi") {
                title = $("#addfromurl-title-val").val();
            }

            if (data.id == null || data.type == null) {
                alert("Failed to parse link " + link + ".  Please check that it is correct");
            } else {
                emitQueue.push({
                    id: data.id,
                    type: data.type,
                    pos: pos,
                    duration: duration,
                    title: title,
                    temp: true,
                    link: link
                });
            }
        });

        var nextQueueDelay = 1020;
        function next() {
            var data = emitQueue.shift();
            if (!data) {
                $("#mediaurl").val("");
                $("#addfromurl-title").remove();
                return;
            }
            
            delete data.link;

            socket.emit("queue", data);
            setTimeout(next, nextQueueDelay);
        }

        next();
    }
}

$("#queue_next").click(queue.bind(this, "next", "url"));
$("#queue_end").click(queue.bind(this, "end", "url"));
$("#ce_queue_next").click(queue.bind(this, "next", "customembed"));
$("#ce_queue_end").click(queue.bind(this, "end", "customembed"));

$("#mediaurl").keyup(function(ev) {
    if (ev.keyCode === 13) {
        queue("end", "url");
    } else {
        var url = $("#mediaurl").val().split("?")[0];
        if (url.match(/^https?:\/\/(.*)?\.(flv|mp4|og[gv]|webm|mp3|mov)$/) ||
                url.match(/^fi:/)) {
            var title = $("#addfromurl-title");
            if (title.length === 0) {
                title = $("<div/>")
                    .attr("id", "addfromurl-title")
                    .appendTo($("#addfromurl"));
                $("<span/>").text("Title (optional)")
                    .appendTo(title);
                $("<input/>").addClass("form-control")
                    .attr("type", "text")
                    .attr("id", "addfromurl-title-val")
                    .keydown(function (ev) {
                        if (ev.keyCode === 13) {
                            queue("end", "url");
                        }
                    })
                    .appendTo($("#addfromurl-title"));
            }
        } else {
            $("#addfromurl-title").remove();
        }
    }
});

$("#customembed-content").keydown(function(ev) {
    if (ev.keyCode === 13) {
        queue("end", "customembed");
    }
});

$("#qlockbtn").click(function() {
    socket.emit("togglePlaylistLock");
});

$("#voteskip").click(function() {
    socket.emit("voteskip");
    $("#voteskip").attr("disabled", true);
});

$("#getplaylist").click(function() {
    var callback = function(data) {
        hidePlayer();
        var idx = socket.listeners("errorMsg").indexOf(errCallback);
        if (idx >= 0) {
            socket.listeners("errorMsg").splice(idx);
        }
        idx = socket.listeners("playlist").indexOf(callback);
        if (idx >= 0) {
            socket.listeners("playlist").splice(idx);
        }
        var list = [];
        for(var i = 0; i < data.length; i++) {
            var entry = formatURL(data[i].media);
            list.push(entry);
        }
        var urls = list.join(",");

        var outer = $("<div/>").addClass("modal fade")
            .appendTo($("body"));
        modal = $("<div/>").addClass("modal-dialog").appendTo(outer);
        modal = $("<div/>").addClass("modal-content").appendTo(modal);
        var head = $("<div/>").addClass("modal-header")
            .appendTo(modal);
        $("<button/>").addClass("close")
            .attr("data-dismiss", "modal")
            .attr("aria-hidden", "true")
            .html("&times;")
            .appendTo(head);
        $("<h3/>").text("Playlist URLs").appendTo(head);
        var body = $("<div/>").addClass("modal-body").appendTo(modal);
        $("<input/>").addClass("form-control").attr("type", "text")
            .val(urls)
            .appendTo(body);
        $("<div/>").addClass("modal-footer").appendTo(modal);
        outer.on("hidden.bs.modal", function() {
            outer.remove();
            unhidePlayer();
        });
        outer.modal();
    };
    socket.on("playlist", callback);
    var errCallback = function(data) {
        if (data.code !== "REQ_PLAYLIST_LIMIT_REACHED") {
            return;
        }

        var idx = socket.listeners("errorMsg").indexOf(errCallback);
        if (idx >= 0) {
            socket.listeners("errorMsg").splice(idx);
        }

        idx = socket.listeners("playlist").indexOf(callback);
        if (idx >= 0) {
            socket.listeners("playlist").splice(idx);
        }
    };
    socket.on("errorMsg", errCallback);
    socket.emit("requestPlaylist");
});

$("#clearplaylist").click(function() {
    var clear = confirm("Are you sure you want to clear the playlist?");
    if(clear) {
        socket.emit("clearPlaylist");
    }
});

$("#shuffleplaylist").click(function() {
    var shuffle = confirm("Are you sure you want to shuffle the playlist?");
    if(shuffle) {
        socket.emit("shufflePlaylist");
    }
});

/* load channel */

var loc = document.location+"";
var m = loc.match(/\/r\/([a-zA-Z0-9-_]+)/);
if(m) {
    CHANNEL.name = m[1];
    if (CHANNEL.name.indexOf("#") !== -1) {
        CHANNEL.name = CHANNEL.name.substring(0, CHANNEL.name.indexOf("#"));
    }
}

/* channel ranks stuff */
function chanrankSubmit(rank) {
    var name = $("#cs-chanranks-name").val();
    socket.emit("setChannelRank", {
        name: name,
        rank: rank
    });
}
$("#cs-chanranks-mod").click(chanrankSubmit.bind(this, 2));
$("#cs-chanranks-adm").click(chanrankSubmit.bind(this, 3));
$("#cs-chanranks-owner").click(chanrankSubmit.bind(this, 4));

var favorites_wrapper = $("#favorites-container");
var show_favorites    = $("#showfavorites");
show_favorites.on("click", function() {
    if (favorites_wrapper.is(":visible")) {
        favorites_wrapper.slideUp();
        show_favorites.removeClass("activated");
    } else {
        favorites_wrapper.slideDown();
        show_favorites.addClass("activated");
    }
});

var search_wrapper = $("#searchcontrol-container");
var show_search    = $("#showsearch");
show_search.on("click", function() {
    if (search_wrapper.is(":visible")) {
        search_wrapper.slideUp("fast");
        show_search.removeClass("activated");
    } else {
        search_wrapper.slideDown("fast");
        show_search.addClass("activated");
    }
});

$(".cs-checkbox").change(function () {
    var box = $(this);
    var key = box.attr("id").replace("cs-", "");
    var value = box.prop("checked");
    var data = {};
    data[key] = value;
    
    if (!ChatAPI.trigger("channel_option_save", data).isCancelled()) {
        socket.emit("setOptions", data);
    }
});

$(".cs-textbox").keyup(function () {
    var box = $(this);
    var key = box.attr("id").replace("cs-", "");
    var value = box.val();
    var lastkey = Date.now();
    box.data("lastkey", lastkey);

    setTimeout(function () {
        if (box.data("lastkey") !== lastkey || box.val() !== value) {
            return;
        }

        var data = {};
        if (key.match(/chat_antiflood_(burst|sustained)/)) {
            data = {
                chat_antiflood_params: {
                    burst: $("#cs-chat_antiflood_burst").val(),
                    sustained: $("#cs-chat_antiflood_sustained").val()
                }
            };
        } else {
            data[key] = value;
        }
        if (!ChatAPI.trigger("channel_option_save", data).isCancelled()) {
            socket.emit("setOptions", data);
        }
    }, 1000);
});

$(".cs-select").change(function() {
    var box = $(this);
    var key = box.attr("id").replace("cs-", "");
    var data = {};
    data[key] = box.val();
    
    if (!ChatAPI.trigger("channel_option_save", data).isCancelled()) {
        socket.emit("setOptions", data);
    }
});

$("#cs-chanlog-refresh").click(function () {
    socket.emit("readChanLog");
});

$("#cs-chanlog-filter").change(filterChannelLog);

$("#cs-motdsubmit").click(function () {
    socket.emit("setMotd", {
        motd: $("#cs-motdtext").val()
    });
});

$("#cs-biosubmit").click(function () {
    socket.emit("setBio", {
        bio: $("#cs-biotext").val()
    });
});

$("#cs-csssubmit").click(function () {
    socket.emit("setChannelCSS", {
        css: $("#cs-csstext").val()
    });
});

$("#cs-jssubmit").click(function () {
    socket.emit("setChannelJS", {
        js: $("#cs-jstext").val()
    });
});

$("#cs-chatfilters-newsubmit").click(function () {
    var name = $("#cs-chatfilters-newname").val();
    var regex = $("#cs-chatfilters-newregex").val();
    var flags = $("#cs-chatfilters-newflags").val();
    var replace = $("#cs-chatfilters-newreplace").val();
    var entcheck = checkEntitiesInStr(regex);
    if (entcheck) {
        alert("Warning: " + entcheck.src + " will be replaced by " +
              entcheck.replace + " in the message preprocessor.  This " +
              "regular expression may not match what you intended it to " +
              "match.");
    }

    socket.emit("addFilter", {
        name: name,
        source: regex,
        flags: flags,
        replace: replace,
        active: true
    });

    socket.once("addFilterSuccess", function () {
        $("#cs-chatfilters-newname").val("");
        $("#cs-chatfilters-newregex").val("");
        $("#cs-chatfilters-newflags").val("");
        $("#cs-chatfilters-newreplace").val("");
    });
});

$("#cs-emotes-newsubmit").click(function () {
    var name = $("#cs-emotes-newname").val();
    var image = $("#cs-emotes-newimage").val();

    socket.emit("updateEmote", {
        name: name,
        image: image,
    });

    $("#cs-emotes-newname").val("");
    $("#cs-emotes-newimage").val("");
});

$("#cs-chatfilters-export").click(function () {
    var callback = function (data) {
        socket.listeners("chatFilters").splice(
            socket.listeners("chatFilters").indexOf(callback)
        );

        $("#cs-chatfilters-exporttext").val(JSON.stringify(data, null, '\t'));
    };

    socket.on("chatFilters", callback);
    socket.emit("requestChatFilters");
});

$("#cs-chatfilters-import").click(function () {
    var text = $("#cs-chatfilters-exporttext").val();
    var choose = confirm("You are about to import filters from the contents of the textbox below the import button.  If this is empty, it will clear all of your filters.  Are you sure you want to continue?");
    if (!choose) {
        return;
    }

    if (text.trim() === "") {
        text = "[]";
    }

    var data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        alert("Invalid import data: " + e);
        return;
    }

    socket.emit("importFilters", data);
});

$("#cs-emotes-export").click(function () {
    var em = CHANNEL.emotes.map(function (f) {
        return {
            name: f.name,
            image: f.image
        };
    });
    $("#cs-emotes-exporttext").val(JSON.stringify(em, null, '\t'));
});

$("#cs-emotes-import").click(function () {
    var text = $("#cs-emotes-exporttext").val();
    var choose = confirm("You are about to import emotes from the contents of the textbox below the import button.  If this is empty, it will clear all of your emotes.  Are you sure you want to continue?");
    if (!choose) {
        return;
    }

    if (text.trim() === "") {
        text = "[]";
    }

    var data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        alert("Invalid import data: " + e);
        return;
    }

    socket.emit("importEmotes", data);
});

var upload_file = $("#cs-uploadoptions input[type=file]");
upload_file.on("change", function(e) {
    if (this.files.length == 0) {
        alert("No file selected.");
        return;
    }
    
    $("#cs-uploadoptions label:first").text("Uploading...");
    var file = this.files[0];
    var fr   = new FileReader();
    fr.addEventListener("loadend", function() {
        socket.emit("uploadFile", {
            name: file.name,
            type: file.type,
            data: fr.result
        });
    });
    fr.readAsArrayBuffer(file);
});

var user_emote        = $("#us-user-emotes");
var user_emote_button = user_emote.find("button:first");
user_emote_button.on("click", function(e) {
    var emote_file = user_emote.find("input[type=file]")[0];
    var emote_url  = user_emote.find("#cs-uploads-url").val().trim();
    
    if (emote_url.length == 0 && (emote_file.files == undefined || emote_file.files.length == 0)) {
        alert("No file selected.");
        return;
    }
    
    var emote_text = user_emote.find("input[type=text]").val().trim();
    if (emote_text.length == 0) {
        alert("Emote text cannot be empty.");
        return;
    }
    
    user_emote_button
        .prop("disabled", true)
        .html('<img src="/img/spinner.gif" style="width: 16px; height: 16px;" />');
        
    if (emote_url.length > 0) {
        socket.emit("userEmoteUpload", {
            url: emote_url,
            text: emote_text
        });
    } else {
        var file = emote_file.files[0];
        var fr   = new FileReader();
        fr.addEventListener("loadend", function () {
            socket.emit("userEmoteUpload", {
                name: file.name,
                type: file.type,
                data: fr.result,
                text: emote_text
            });
        });
        fr.readAsArrayBuffer(file);
    }
});

var toggleUserlist = function () {
    if ($("#userlist").css("display") === "none") {
        $("#userlist").show();
        $("#userlisttoggle").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
    } else {
        $("#userlist").hide();
        $("#userlisttoggle").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
    }
    scrollChat();
};

if ($(window).width() < 768) {
    toggleUserlist();
}

/*
 * Fixes #417 which is caused by changes in Bootstrap 3.3.0
 * (see twbs/bootstrap#15136)
 *
 * Whenever the active tab in channel options is changed,
 * the modal must be updated so that the backdrop is resized
 * appropriately.
 */
$("#channeloptions li > a[data-toggle='tab']").on("shown.bs.tab", function () {
    $("#channeloptions").data("bs.modal").handleUpdate();
});

applyOpts();

(function () {
    var embed = document.querySelector(".embed-responsive");
    if (!embed) {
        return;
    }

    if (typeof window.MutationObserver === "function") {
        var mr = new MutationObserver(function (records) {
            records.forEach(function (record) {
                if (record.type !== "childList") return;
                if (!record.addedNodes || record.addedNodes.length === 0) return;

                var elem = record.addedNodes[0];
                if (elem.id === "ytapiplayer") handleVideoResize();
            });
        });

        mr.observe(embed, { childList: true });
    } else {
        /*
         * DOMNodeInserted is deprecated.  This code is here only as a fallback
         * for browsers that do not support MutationObserver
         */
        embed.addEventListener("DOMNodeInserted", function (ev) {
            if (ev.target.id === "ytapiplayer") handleVideoResize();
        });
    }
})();

var EMOTELISTMODAL = $("#emotelist");
EMOTELISTMODAL.on("hidden.bs.modal", unhidePlayer);
$("#emotelistbtn").click(function () {
    EMOTELISTMODAL.modal();
});

EMOTELISTMODAL.find(".emotelist-alphabetical").change(function () {
    USEROPTS.emotelist_sort = this.checked;
    setOpt("emotelist_sort", USEROPTS.emotelist_sort);
});
EMOTELISTMODAL.find(".emotelist-alphabetical").prop("checked", USEROPTS.emotelist_sort);

$("#fullscreenbtn").click(function () {
    var elem = document.querySelector(".embed-responsive");
    // this shit is why frontend web development sucks
    var fn = elem.requestFullscreen ||
        elem.mozRequestFullScreen || // Mozilla has to be different and use a capital 'S'
        elem.webkitRequestFullscreen ||
        elem.msRequestFullscreen;

    if (fn) {
        fn.call(elem);
    }
});

function handleCSSJSTooLarge(selector) {
    if (this.value.length > 20000) {
        var warning = $(selector);
        if (warning.length > 0) {
            return;
        }

        warning = makeAlert("Maximum Size Exceeded", "Inline CSS and JavaScript are " +
                "limited to 20,000 characters or less.  If you need more room, you " +
                "need to use the external CSS or JavaScript option.", "alert-danger")
                .attr("id", selector.replace(/#/, ""));
        warning.insertBefore(this);
    } else {
        $(selector).remove();
    }
}

$("#cs-csstext").bind("input", handleCSSJSTooLarge.bind($("#cs-csstext")[0],
        "#cs-csstext-too-big"));
$("#cs-jstext").bind("input", handleCSSJSTooLarge.bind($("#cs-jstext")[0],
        "#cs-jstext-too-big"));
