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

function handleUsers(req, res) {
    db_playlists.fetchDistinctUsers(function(err, rows) {
        if (err) {
            return template.send(res, 'error/http', {
                path: req.path,
                status: 500,
                message: err
            });
        }
        
        var users = [];
        rows.forEach(function(row) {
            if (row.user.length != 0) {
                users.push({
                    name: row.user,
                    count: row.cnt
                });
            }
        });
        
        template.send(res, 'playlists/users', {
            pageTitle: "User Playlists",
            users: users
        });
    });
}

function handleUser(req, res) {
    var name = req.params.name;
    db_accounts.getUser(name, function(err) {
        if (err == "User does not exist") {
            return template.send(res, 'error/http', {
                path: req.path,
                status: 404,
                message: err
            });
        }
        
        var page = req.params.page;
        if (page == undefined) {
            page = 1;
        }
        if (page < 1) {
            page = 1;
        }
    
        db_playlists.countByUser(name, function(err, count) {
            if (count == 0) {
                template.send(res, 'playlists/user_empty', {
                    pageTitle: name + "'s Playlist",
                    name: name
                });
                return;
            }
        
            var limit  = 100;
            var pages  = Math.ceil(count / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
        
            db_playlists.fetchByUser(name, limit, offset, function(err, rows) {
                template.send(res, 'playlists/user', {
                    pageTitle: name + "'s Playlist",
                    name: name,
                    media: rows,
                    page:  parseInt(page),
                    pages: parseInt(pages)
                });
            });
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/playlists/user/:name([a-zA-Z0-9_\-]{1,20})/:page?', handleUser);
        app.get('/playlists/users', handleUsers);
        app.get('/playlists/history/:page?', handleHistory);
        app.get('/playlists/top', handleTop);
    }
};