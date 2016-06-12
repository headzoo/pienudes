/** import: https://somesite.com/somescript.js **/
/** import: https://anothersite.com/anotherscript.js **/

// The "favorites" event is called when you enter chat. Save the favorites to a local variable.
var favorites = [];
$api.on("favorites", function(e, data) {
    favorites = data;
});

// Every 30 minutes, grab one of the favorites at random, and add it to the playlist.
setInterval(function() {
    var item = favorites[Math.floor(Math.random() * favorites.length)];
    if (item) {
        $api.queue(item);
    }
}, 1800000); // 30 minutes in milliseconds


////

$api.on("receive", function(e, data) {
    if (data.msg.match(/\b(red|nyc)\b/)) {
        data.meta.highlight = true;
    }
});

/**
 * Script: Troll Protection
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
    var trolls = [];
    
    $(".btn-stop-trolling").remove();
    
    // Add a button to user profile menus to turn trolling protection on and off.
    $api.on("profile_menu", function(e, menu) {
        var btn_group = menu.find(".btn-group-vertical:first");
        var btn = $("<button/>")
            .addClass("btn btn-xs btn-default btn-stop-trolling")
            .appendTo(btn_group);
        
        btn.text("Troll Protection On")
            .click(function () {
                var name  = menu.data("name").toLowerCase();
                var index = trolls.indexOf(name);
                if (index == -1) {
                    trolls.push(name);
                    btn.text("Troll Protection Off");
                } else {
                    trolls.splice(index, 1);
                    btn.text("Troll Protection On");
                }
            });
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
})();
/**
 * End: Troll Protection
 */


$api.on("send", function(e, data) {
    var colors  = [
        '#00efd3',
        '#00d7d1',
        '#00cacf',
        '#00bccd',
        '#00afcb',
        '#00a1c9',
        '#0094c7',
        '#0086c4',
        '#0079c3',
        '#006bc1',
        '#005ebf'
    ];
    var newstr  = '';
    var counter = 0;
    var chars   = data.msg.split('');
    for (var x in chars) {
        if (chars[x]!=' ') {
            newstr = newstr + '[' + colors[counter] + ']' + chars[x] + '[/#]';
            counter++;
        } else {
            newstr = newstr + ' ';
        }
        if (counter >= colors.length) {
            colors.reverse();
            counter = 0;
        }
    }
    
    data.msg = newstr;
});

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


$api.on("send", function(e, data) {
    var colors  = [
        '#00efd3',
        '#00d7d1',
        '#00cacf',
        '#00bccd',
        '#00afcb',
        '#00a1c9',
        '#0094c7',
        '#0086c4',
        '#0079c3',
        '#006bc1',
        '#005ebf'
    ];
    var newstr  = '';
    var counter = 0;
    var chars   = data.msg.split('');
    for (var x in chars) {
        if (chars[x]!=' ') {
            newstr = newstr + '[' + colors[counter] + ']' + chars[x] + '[/#]';
            counter++;
        } else {
            newstr = newstr + ' ';
        }
        if (counter >= colors.length) {
            colors.reverse();
            counter = 0;
        }
    }
    
    data.msg = newstr;
});


/**
 * Script: Lucky
 *
 * Creates a /lucky command, which searches YouTube using the query following
 * the command, and queues the first video found.
 *
 * To use, copy this script into the Options->Scripting box. In the chat box
 * type something like "/lucky grimes kill v maim".
 */
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