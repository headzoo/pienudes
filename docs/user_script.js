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