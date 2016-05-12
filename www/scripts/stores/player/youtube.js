'use strict';

var Reflux        = require('reflux');
var YouTubePlayerActions = require('../../actions/player/youtube');
var SocketActions = require('../../actions/socket');
var Events        = require('../../events');

module.exports = Reflux.createStore({
    listenables: [SocketActions, YouTubePlayerActions],
    youtube: null,
    player: null,
    play_w_ready: null,
    data: {
        playing: false,
        ready: false
    },
    
    getInitialState() {
        return this.data;
    },
    
    onConnectDone: function(socket) {
        socket.on(Events.CHANGE_MEDIA, this.onChangeMedia);
        socket.on(Events.MEDIA_UPDATE, this.onMediaUpdate);
    },
    
    onChangeMedia: function(media) {
        if (!this.data.ready) {
            this.play_w_ready = media;
        } else {
            YouTubePlayerActions.play(media);
        }
    },
    
    onMediaUpdate: function(data) {
        if (this.player) {
            var time     = data.currentTime;
            var diff     = (time - this.player.getCurrentTime()) || time;
            var accuracy = 2;
            
            if (diff > accuracy) {
                this.player.seekTo(time);
            } else if (diff < -accuracy) {
                this.player.seekTo(time + 1);
            }
        }
    },
    
    onPlay: function(media) {
        var current_time = 0;
        if (media.currentTime != undefined) {
            current_time = Math.ceil(media.currentTime);
        }
        
        if (this.player) {
            this.player.loadVideoById(media.id, current_time);
            return;
        }
        
        var self = this;
        this.player = new this.youtube.Player('player-youtube', {
            videoId: media.id,
            playerVars: {
                start: current_time,
                autohide: 1,
                autoplay: 1,
                controls: 1,
                iv_load_policy: 3,
                rel: 0,
                wmode: 'transparent'
            },
            events: {
                'onReady': self.onPlayerReady,
                'onStateChange': self.onPlayerStateChange
            }
        });
    },
    
    onLoadDone: function(youtube) {
        this.youtube = youtube;
        if (window.onYouTubeIframeAPIReady == undefined) {
            window.onYouTubeIframeAPIReady = function () {
                this.data.ready = true;
                this.trigger(this.data);
                if (this.play_w_ready) {
                    YouTubePlayerActions.play(this.play_w_ready);
                    this.play_w_ready = null;
                }
            }.bind(this);
        }
    },
    
    onLoadFail: function(jqxhr, settings, exception) {
        console.log(exception);
    },
    
    onPlayerReady: function() {
        this.data.playing = true;
        this.trigger(this.data);
    },
    
    onPlayerStateChange: function(e) {
        
    }
});