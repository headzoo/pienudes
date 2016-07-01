'use strict';

import template from '../../template';
import Config from '../../../config';
import security from './security';
import db_playlist from '../../../database/playlist.js';

function handleIndex(req, res) {
    var page  = req.params.page;
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    
    db_playlist.count(function(err, count) {
        var limit  = 200;
        var pages  = Math.ceil(count / limit);
        if (page > pages) {
            page = pages;
        }
        var offset = (page - 1) * limit;
        
        db_playlist.fetch(limit, offset, function(err, rows) {
            template.send(res, 'admin/playlist/index', {
                pageTitle: "Playlist",
                rows: rows,
                count: count,
                page: page,
                pages: pages
            });
        });
    });
}

function handleDeletePlay(req, res) {
    var play_id = req.body.play_id;
    if (play_id) {
        db_playlist.removeById(play_id, function() {
            res.sendStatus(200);
        });
    } else {
        res.sendStatus(200);
    }
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/admin/playlist', security, handleIndex);
        app.get('/admin/playlist/page/:page', security, handleIndex);
        app.delete('/admin/playlist/play', security, handleDeletePlay);
    }
};