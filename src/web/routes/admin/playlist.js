'use strict';

import template from '../../template';
import Config from '../../../config';
import security from './security';
import db_playlist from '../../../database/playlist.js';

function handleIndex(req, res) {
    var username = req.query.username || "";
    var title    = req.query.title || "";
    var page     = parseInt(req.params.page);
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    
    function send(rows, page, pages) {
        template.send(res, 'admin/playlist/index', {
            pageTitle: "Playlist",
            rows: rows,
            page: page,
            pages: pages,
            username: username,
            title: title
        });
    }
    
    var limit  = 200;
    if (username.length > 0 && title.length > 0) {
        db_playlist.countByUserAndMediaTitle(username, title, function (err, count) {
            var pages = Math.ceil(parseInt(count) / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
            db_playlist.fetchByUserAndMediaTitle(username, title, limit, offset, function (err, rows) {
                send(rows, page, pages);
            });
        });
    } else if (username.length > 0) {
        db_playlist.countByUser(username, function (err, count) {
            var pages = Math.ceil(parseInt(count) / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
            db_playlist.fetchByUser(username, limit, offset, function (err, rows) {
                send(rows, page, pages);
            });
        });
    } else if (title.length > 0) {
        db_playlist.countByMediaTitle(title, function (err, count) {
            var pages = Math.ceil(parseInt(count) / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
            db_playlist.fetchByMediaTitle(title, limit, offset, function (err, rows) {
                send(rows, page, pages);
            });
        });
    } else {
        db_playlist.count(function(err, count) {
            var pages  = Math.ceil(parseInt(count) / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
            db_playlist.fetch(limit, offset, function(err, rows) {
                send(rows, page, pages);
            });
        });
    }
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