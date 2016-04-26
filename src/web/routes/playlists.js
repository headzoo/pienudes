"use strict";
import template from '../template';
import Config from '../../config';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';

function handleHistory(req, res) {
    var page = req.params.page;
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    
    db_playlists.count(function(err, count) {
        var limit  = 100;
        var pages  = Math.ceil(count / limit);
        if (page > pages) {
            page = pages;
        }
        var offset = (page - 1) * limit;
        
        db_playlists.fetch(limit, offset, function(err, rows) {
            rows.forEach(function(row) {
                if (row.user[0] == "@") {
                    row.user = row.user.substring(1);
                }
            });
            
            template.send(res, 'playlists/history', {
                pageTitle: "Playlist History",
                media: rows,
                page:  parseInt(page),
                pages: parseInt(pages)
            });
        });
    });
}

function handleTop(req, res) {
    db_playlists.fetchMostWatched(25, function(err, rows) {
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