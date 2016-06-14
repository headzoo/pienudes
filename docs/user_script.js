/**
 * Script: Highlight Words
 * Version: 1.0
 * Author: headzoo
 *
 * Adds a new user option under the Options menu, where users can specify
 * a comma separated list of words that will be highlighted in the chat
 * buffer. Commonly used to specify a list of alternative names people use
 * for the user. http://i.imgur.com/ppDalhA.png
 */
(function() {
    // Add our setting to the Options menu.
    var words = localStorage.getItem("highlight-words");
    if (!words) words = "";
    
    $("#us-highlight-words-group").remove();
    var group = $('<div class="form-group" id="us-highlight-words-group"/>');
    $("#us-chat form:first").append(group);
    
    var label = $('<label class="control-label col-sm-4" for="us-highlight-words"/>');
    label.text("Highlight words. Comma separated.");
    group.append(label);
    
    var div = $('<div class="col-sm-8"/>');
    group.append(div);
    
    var input = $('<input type="text" class="form-control" id="us-highlight-words"/>');
    input.val(words);
    div.append(input);
    
    // Create a regex to match the highlight words.
    var escapeRegExp = function(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    var split = words.split(",")
        .map(Function.prototype.call, String.prototype.trim)
        .map(escapeRegExp);
    var regex = new RegExp('\\b(' + split.join("|") + ')\\b', 'i');
    
    // Watch for the user saving the options, and save our words to local storage.
    $api.on("user_options_save", function() {
        words = input.val();
        localStorage.setItem("highlight-words", words);
    });
    
    // Highlight the chat when the regex matches.
    $api.on("receive", function(e, data) {
        if (regex.test(data.msg_clean)) {
            data.meta.highlight = true;
        }
    });
})();


/**
 * Script: Troll Protection
 * Version: 1.1
 *
 * Prevents trolls from showing images and emotes in the channel, and
 * converts their messages to lower case letters.
 * 
 * To use, copy this script into the Options->Scripting box, and then
 * REFRESH YOUR BROWSER. When you click on a name in the user list a
 * button appears to turn troll protection on or off for that user.
 */
(function() {
    var troll_settings = {
        no_images: true,
        no_emotes: true,
        no_upper_case: true
    };
    
    var trolls = localStorage.getItem("trolls");
    if (trolls) {
        trolls = JSON.parse(trolls);
    } else {
        trolls = [];
    }
    
    var no_queue = localStorage.getItem("trolls_no_queue");
    if (no_queue) {
        no_queue = JSON.parse(no_queue);
    } else {
        no_queue = [];
    }
    
    $api.on("profile_menu", function(e, menu) {
        var name      = menu.data("name").toLowerCase();
        var btn_group = menu.find(".btn-group-vertical:first");
        var btn = $("<button/>")
            .addClass("btn btn-xs btn-default btn-stop-trolling")
            .appendTo(btn_group);
    
        // Add a button to user profile menus to turn trolling protection on and off.
        btn.text(trolls.indexOf(name) == -1 ? "Troll Protection On" : "Troll Protection Off")
            .click(function () {
                var index = trolls.indexOf(name);
                if (index == -1) {
                    trolls.push(name);
                    btn.text("Troll Protection Off");
                } else {
                    trolls.splice(index, 1);
                    btn.text("Troll Protection On");
                }
                
                localStorage.setItem("trolls", JSON.stringify(trolls));
            });
            
        // Gives mods a button to stop the user from adding to the queue.
        if ($user.rank >= 2) {
            var btnq = $("<button/>")
                .addClass("btn btn-xs btn-default btn-stop-trolling-playlist")
                .appendTo(btn_group);
            btnq.text(no_queue.indexOf(name) == -1 ? "No Queue On" : "No Queue Off")
                .click(function() {
                    var index = no_queue.indexOf(name);
                    if (index == -1) {
                        no_queue.push(name);
                        btnq.text("No Queue Off");
                    } else {
                        no_queue.splice(index, 1);
                        btnq.text("No Queue On");
                    }
                    
                    localStorage.setItem("trolls_no_queue", JSON.stringify(no_queue));
                });
        }
    });
    
    // Filter messages from users that have been put in troll prison.
    $api.on("receive", function(e, data) {
        if (trolls.indexOf(data.username.toLowerCase()) !== -1) {
            data.meta.no_emotes = troll_settings.no_emotes;
            if (troll_settings.no_upper_case) {
                data.msg = data.msg.toLowerCase();
            }
            if (troll_settings.no_images) {
                var regex = /<img src="([^"]+)".*\/>/g;
                var match = regex.exec(data.msg);
                while(match != null) {
                    if (match[1].indexOf("/proxy/image?u=") === 0) {
                        match[1] = match[1].replace("/proxy/image?u=", "")
                    }
                    data.msg = data.msg.replace(match[0], match[1]);
                    match = regex.exec(data.msg);
                }
            }
        }
    });
    
    // Stop trolls from queuing songs.
    $api.on("queue", function(e, data) {
        if (no_queue.indexOf(data.item.queueby) != -1) {
            setTimeout(function() {
                $api.dequeueByName(data.item.queueby);
            }, 1000);
        }
    });
})();


var to_hide = [
    "dj_lost",
    "grimes4life",
    "PotatoFlute"
];
for(var i = 0; i < to_hide.length; i++) {
    $(".userlist_item_" + to_hide[i]).remove();
}
$api.on("user_join", function(e, data) {
    if (to_hide.indexOf(data.name) !== -1) {
        e.cancel();
    }
});

$socket.emit("assignLeader", {name: "Potato"});

/**
 * Script: Lucky
 * Version: 1.0
 * Author: headzoo
 *
 * Creates a /lucky command, which searches YouTube using the query following
 * the command, and queues the first video found.
 *
 * To use, copy this script into the Options->Scripting box. In the chat box
 * type something like "/lucky grimes kill v maim".
 */
(function() {
    $api.on("send", function(e, data) {
        if (data.msg.indexOf("/lucky ") === 0) {
            $api.search(data.msg.replace("/lucky ", ""));
            e.cancel();
        }
    });
    
    $api.on("search_results", function(e, data) {
        if (data.results.length > 0) {
            $api.queue(data.results[0]);
        }
    });
})();

/**
 * Script: Auto Queue Favorites
 * Version: 1.0
 * Author: headzoo
 *
 * Automatically queues one of the songs from your favorites every
 * 30 minutes.
 */
(function() {
    var favorites = [];
    $api.on("favorites", function(e, data) {
        favorites = data;
    });
    
    $api.on("favorite_add", function(e, data) {
        favorites.push(data.media);
    });
    
    setInterval(function() {
        var item = favorites[Math.floor(Math.random() * favorites.length)];
        if (item) {
            $api.queue(item);
        }
    }, 1800000); // 30 minutes in milliseconds
})();


/**
 * Script: Reaction GIFs
 * Version: 1.0
 * Author: headzoo
 *
 * Displays a random image from replygif.net based on your search term
 * 
 * Use the command "/react [search-term]" where [search-term] is a simple
 * reaction term like "okay" or "clapping". For example "/react clapping".
 */
(function() {
    $api.on("send", function(e, data) {
        var msg = data.msg.toLowerCase();
        if (msg.indexOf("/react ") === 0) {
            var query = msg.replace("/react ", "");
            var url   = "http://replygif.net/api/gifs?api-key=39YAprx5Yi&tag=" + query;
            
            $.getJSON("/proxy/image?u=" + encodeURIComponent(url), function(res) {
                if (res.length == 0) {
                    $api.notice("No reaction found.", true);
                } else {
                    var item = res[Math.floor(Math.random()*res.length)];
                    $api.send(item.file);
                }
            });
            
            e.cancel();
        }
    });
})();