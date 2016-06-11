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
    if (data.msg.toLowerCase().indexOf("headz") != -1) {
        data.meta.highlight = true;
    }
});


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
assignLeader