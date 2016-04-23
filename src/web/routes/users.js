"use strict";
import template from '../template';
import Config from '../../config';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';

function handleProfile(req, res) {
    var name = req.params.name;
    var page = req.params.page;
    if (page == undefined) {
        page = 1;
    }
    if (page < 1) {
        page = 1;
    }
    
    db_accounts.getUser(name, function(err, user) {
        if (err == "User does not exist") {
            return template.send(res, 'error/http', {
                path: req.path,
                status: 404,
                message: err
            });
        }
        
        if (user.profile == "") {
            user.profile = {image: "", text: ""};
        } else {
            user.profile = JSON.parse(user.profile);
        }
    
        db_playlists.countByUser(name, function(err, count) {
            if (err) {
                return template.send(res, 'error/http', {
                    status: 500
                });
            }
            
            if (count == 0) {
                return template.send(res, 'users/profile', {
                    pageTitle: req.params.name,
                    pageTab: "home",
                    user: user,
                    media: [],
                    page:  1,
                    pages: 1
                });
            }
    
            var limit  = 100;
            var pages  = Math.ceil(count / limit);
            if (page > pages) {
                page = pages;
            }
            var offset = (page - 1) * limit;
    
            db_playlists.fetchByUser(name, limit, offset, function(err, rows) {
                if (err) {
                    return template.send(res, 'error/http', {
                        status: 500
                    });
                }
        
                template.send(res, 'users/profile', {
                    pageTitle: req.params.name,
                    pageTab: "home",
                    user: user,
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
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/:page?', handleProfile);
    }
};