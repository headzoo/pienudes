$(function() {
    $(".btn-edit-user").on("click", function() {
        document.location = "/admin/users/edit/" + $(this).data("id");
    });
    $(".btn-edit-alt").on("click", function() {
        document.location = "/admin/alts/edit/" + $(this).data("id");
    });
    $("#btn-create-alt").on("click", function() {
        document.location = "/admin/alts/create";
    });
    
    $(".alt-speak-submit").on("click", function() {
        var target   = $(this),
            parent   = target.parents(".alt-speak-form:first"),
            alt_id   = parent.data("alt-id"),
            text_box = parent.find(".alt-speak-text:first"),
            text     = text_box.val().trim(),
            channel  = parent.find(".alt-speak-channel:first").val().trim();
        
        if (text.length == 0) {
            return alert("Text cannot be empty.");
        }
        if (channel.length == 0) {
            return alert("Channel cannot be empty.");
        }
        
        $.ajax({
            url: "/admin/alts/speak",
            type: "post",
            data: {
                alt_id: alt_id,
                text: text,
                channel: channel
            }
        }).done(function() {
            text_box.val("");
        });
    });
    
    $(".alt-speak-text").on("keyup", function(e) {
        if (e.keyCode == 13) {
            $(this).parents(".alt-speak-form:first").find(".alt-speak-submit:first").trigger("click");
        }
    });
    
    $(".btn-delete-play").on("click", function() {
        var target  = $(this),
            parent  = target.parents("tr:first"),
            play_id = parent.data("play-id");
            
        $.ajax({
            url: "/admin/playlist/play",
            type: "delete",
            data: {
                play_id: play_id
            }
        }).done(function() {
            parent.fadeOut();
        }).fail(function() {
            alert("There was an error. Try again in a minute.");
        });
    });
    
    $("#btn-playlist-filter-reset").on("click", function() {
        document.location = "/admin/playlist";
        return false;
    });
});