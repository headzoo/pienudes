var favorites = [];

$api.on("favorites", function(e, data) {
    favorites = data;
});

setInterval(function() {
    var item = favorites[Math.floor(Math.random() * favorites.length)];
    if (item) {
        $api.queue(item);
    }
}, 30 * 60 * 1000); // 30 minutes