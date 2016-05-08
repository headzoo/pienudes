'use strict';

module.exports = {
    clickUrl: function(media) {
        switch(media.type) {
            case "yt":
                return "https://youtu.be/" + media.id;
                break;
            case "sc":
                return media.id;
                break;
            case "vi":
                return "https://vimeo.com/" + media.id;
                break;
            case "dm":
                return "https://dailymotion.com/video/" + media.id;
                break;
            case "li":
                return "http://livestream.com/" + media.id;
                break;
            case "tw":
                return "https://twitch.tv/" + media.id;
                break;
            case "im":
                return "https://imgur.com/a/" + media.id;
                break;
            case "us":
                return "https://imgur.com/a/" + media.id;
                break;
            case "gd":
                return "https://docs.google.com/file/d/" + media.id;
                break;
            case "hb":
                return "https://hitbox.tv/" + media.id;
                break;
            default:
                return media.id;
                break;
        
        }
    },
    
    thumbnailUrl: function(media) {
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
};