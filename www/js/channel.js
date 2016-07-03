$("#deletecurrent").on("click", function() {
    socket.emit("delete", PL_CURRENT);
});