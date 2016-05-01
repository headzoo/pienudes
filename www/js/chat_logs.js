(function() {
    var box = $("#chat-log-box");
    if (box.length == 0) {
        return;
    }
    
    var channel  = "lobby";
    var last_mid = "";
    var title    = $("#chat-logs-title span:first");
    var input    = $("#chat-logs-search-input");
    var channels = $("#chat-logs-channels");
    
    USEROPTS.show_timestamps = true;
    USEROPTS.show_colors = true;
    
    channels.on("click", "li", function() {
        document.location = "/chat/logs#c=" + $(this).data("channel");
    });
    
    $(window).bind("hashchange", function() {
        fetchLogs();
    });
    
    var search = $.deparam.fragment().s;
    if (search) {
        input.val(search);
    }
    input.on("keyup", function(e) {
        if (e.keyCode == 13) {
            document.location = "/chat/logs#c=" + channel + "&s=" + encodeURIComponent(input.val());
        }
    });
    
    fetchLogs();
    
    function fetchLogs() {
        var after   = 0;
        var search  = "";
        var params  = $.deparam.fragment();
        if (params.c != undefined) {
            channel = params.c;
        }
        if (params.i != undefined) {
            after = params.i;
        }
        if (params.s != undefined) {
            search = params.s;
        }
        
        $.ajax({
            url: "/chat/logs/" + channel,
            data: {
                after: after,
                search: search
            }
        }).done(function(res) {
            if (search) {
                title.text("Chat Logs - " + channel + " - Search Results");
            } else if (after > 0) {
                title.text("Chat Logs - " + channel);
                input.val("");
            } else {
                title.text("Chat Logs - " + channel + " - Past 24 Hours");
                input.val("");
            }
            
            formatLogs(res);
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }).fail(function() {
            alert("There was an error. Please try again in a minute.")
        });
    }
    
    function formatLogs(logs) {
        box.empty();
        var div;
        
        for(var i = 0; i < logs.length; i++) {
            var log = logs[i];
            if (log.type == "message") {
                var obj = {
                    username: log.user,
                    msg: log.msg,
                    meta: log.meta,
                    time: log.time
                };
                div = formatChatMessage(obj, {name: ""}, "/chat/logs#c=" + channel + "&i=" + log.id);
                box.append(div);
            } else {
                if (log.meta.id != last_mid) {
                    div = formatMediaCard(log);
                    box.append(div);
                    last_mid = log.meta.id;
                }
            }
        }
    }
    
    function formatMediaCard(log) {
        var card = $("<div/>");
        card.addClass("card card-media");
        
        var time = $("<div/>");
        time.addClass("card-media-time");
        if (log.user[0] == "@") {
            time.html("<span class='glyphicon glyphicon-refresh requeue-icon'></span> " + log.user.substring(1) + " &middot; " + log.meta.duration);
        } else {
            time.html(log.user + " &middot; " + log.meta.duration);
        }
        card.append(time);
        
        var thumbnail_link = $("<a/>");
        thumbnail_link.attr("href", mediaUrl(log.meta));
        thumbnail_link.attr("target", "_blank");
        
        var thumbnail_img  = $("<img/>");
        thumbnail_img.addClass("card-media-thumbnail");
        thumbnail_img.attr("src", thumbnailUrl(log.meta));
        thumbnail_link.append(thumbnail_img);
        card.append(thumbnail_link);
        
        var title = $("<a/>");
        title.addClass("card-media-title");
        title.attr("href", mediaUrl(log.meta));
        title.text(log.msg);
        card.append(title);
        
        return card;
    }
    
    function mediaUrl(media) {
        switch(media.type) {
            case "yt":
                return "http://youtube.com/watch?v=" + media.id;
                break;
            case "sc":
                return media.id;
                break;
            case "vi":
                return "http://vimeo.com/" + media.id;
                break;
            case "dm":
                return "http://dailymotion.com/video/" + media.id;
                break;
            case "li":
                return "http://livestream.com/" + media.id;
                break;
            case "tw":
                return "http://twitch.tv/" + media.id;
                break;
            case "im":
                return "http://imgur.com/a/" + media.id;
                break;
            case "us":
                return "http://imgur.com/a/" + media.id;
                break;
            case "gd":
                return "https://docs.google.com/file/d/" + media.id;
                break;
            case "hb":
                return "http://hitbox.tv/" + media.id;
                break;
            default:
                return media.id;
                break;
        }
    }
    
    function thumbnailUrl(media) {
        switch(media.type) {
            case "yt":
                return "https://i.ytimg.com/vi/" + media.id + "/default.jpg";
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
})();