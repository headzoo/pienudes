"use strict";
import template from '../template';
import Config from '../../config';
import playlists from '../../database/playlist';

function handleHistory(req, res) {
    var page = req.params.page;
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    
    playlists.countPlaylistHistory(function(err, count) {
        var limit  = 100;
        var pages  = Math.ceil(count / limit);
        if (page > pages) {
            page = pages;
        }
        var offset = (page - 1) * limit;
        
        playlists.fetchPlaylistHistory(limit, offset, function(err, rows) {
            template.send(res, 'playlists/history', {
                pageTitle: "Playlist History",
                media: rows,
                page:  page,
                pages: pages
            });
        });
    });
}

function handleTop(req, res) {
    playlists.fetchMostWatched(25, function(err, rows) {
        template.send(res, 'playlists/top', {
            pageTitle: "Top 25 Played Videos",
            media: rows,
            count: 25
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/playlists/history/:page?', handleHistory);
        app.get('/playlists/top', handleTop);
    }
};