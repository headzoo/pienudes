'use strict';

import template from '../template';
import db_playlists from '../../database/playlist';
import db_media from '../../database/media';

function handleMedia(req, res) {
    var mid = req.params.mid;
    
    db_media.fetchById(mid, function(err, media) {
        if (err) {
            return template.send(res, 'error/http', {
                status: 500
            });
        }
        if (!media) {
            return template.send(res, 'error/http', {
                status: 404
            });
        }
        
        db_playlists.fetchUsersByMediaId(mid, function(err, users) {
            if (err) {
                return template.send(res, 'error/http', {
                    status: 500
                });
            }
            
            users.forEach(function(user) {
                if (user.profile == "") {
                    user.profile = {image: "", text: "", bio: "", header: "", header_color: ""};
                } else {
                    user.profile = JSON.parse(user.profile);
                }
            });
            
            template.send(res, 'tracks/media', {
                pageTitle: media.title,
                media: media,
                users: users,
                user_count: users.length
            });
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/tracks/:mid/:title', handleMedia);
    }
};