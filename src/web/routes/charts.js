"use strict";
import template from '../template';
import Config from '../../config';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';
import db_votes from '../../database/votes';

function handleHistoryRedirect(req, res) {
    res.redirect(301, '/charts/history');
}

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
            
            template.send(res, 'charts/history', {
                pageTitle: "Playlist History",
                media: rows,
                page:  parseInt(page),
                pages: parseInt(pages)
            });
        });
    });
}

function handleHistorySearch(req, res) {
    var term = req.query.q;
    var page = req.params.page;
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    var limit  = 100;
    var offset = (page - 1) * limit;
    
    db_playlists.fetchBySearchTerm(term, limit, offset, function(err, rows, found) {
        rows.forEach(function(row) {
            if (row.user[0] == "@") {
                row.user = row.user.substring(1);
            }
        });
    
        var pages = Math.ceil(found / limit);
        if (page > pages) {
            page = pages;
        }
        
        template.send(res, 'charts/history_search', {
            pageTitle: "Playlist History",
            media: rows,
            term: term,
            page:  parseInt(page),
            pages: parseInt(pages)
        });
    });
}

function handleTopRedirect(req, res) {
    res.redirect(301, '/charts/top');
}

function handleTop(req, res) {
    db_playlists.fetchMostWatched(25, function(err, rows) {
        template.send(res, 'charts/top', {
            pageTitle: "25 Most Played Videos",
            media: rows,
            count: 25
        });
    });
}

function handleUpvoted(req, res) {
    db_votes.fetchMostUpvoted(25, function(err, rows) {
        template.send(res, 'charts/upvoted', {
            pageTitle: "25 Most Upvoted Videos",
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
        app.get('/charts/history/search/:page?', handleHistorySearch);
        app.get('/charts/history/:page?', handleHistory);
        app.get('/charts/top', handleTop);
        app.get('/charts/upvoted', handleUpvoted);
        
        app.get('/playlists/history/:page?', handleHistoryRedirect);
        app.get('/playlists/top', handleTopRedirect);
    }
};