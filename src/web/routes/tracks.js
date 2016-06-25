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

function handleWho(req, res) {
    var type = req.params.type;
    var uid  = req.params.uid;
    
    db_media.fetchByUidAndType(uid, type, function(err, media) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!media) {
            return res.sendStatus(404);
        }
    
        db_playlists.fetchUsersByMediaId(media.id, function(err, users) {
            if (err) {
                return res.sendStatus(500);
            }
            
            var names = [];
            users.forEach(function(user) {
                names.push(user.name);
            });
            
            res.json(names);
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/tracks/who/:type/:uid', handleWho);
        app.get('/tracks/:mid/:title', handleMedia);
    }
};