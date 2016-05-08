'use strict';

var striptags  = require('striptags');
import template from '../../template';
import Config from '../../../config';
import security from './security';
import xss from '../../../xss';
import db from '../../../database';
import db_accounts from '../../../database/accounts';

function handleIndex(req, res) {
    db_accounts.getAll(100, 0, function(err, rows) {
        template.send(res, 'admin/users/index', {
            pageTitle: "Users",
            users: rows
        });
    });
}

function handleEdit(req, res) {
    db_accounts.getUserById(req.params.id, function(err, user) {
        if (err) {
            return res.send(500);
        }
        
        try {
            user.profile = JSON.parse(user.profile);
        } catch (e) {
            user.profile = {
                image: "",
                header: "",
                text: "",
                website: "",
                bio: "",
                color: ""
            };
        }
        
        template.send(res, 'admin/users/edit', {
            pageTitle: "Users",
            user: user
        });
    });
}

function handleEditSave(req, res) {
    
    db_accounts.getUserById(req.params.id, function(err, user) {
        if (err) {
            return res.send(500);
        }
    
        var email    = req.body.email.trim();
        var password = req.body.password.trim();
        var text     = req.body.text.trim();
        var location = req.body.location.trim();
        var website  = req.body.website.trim();
        var bio      = req.body.bio.trim();
        var image    = req.body.image.trim();
        var header   = req.body.header.trim();
        var color    = req.body.color.trim();
    
        // The "original" members can have some html in their profile.
        if (req.user.id < 37) {
            text     = xss.sanitizeHTML(text);
            location = xss.sanitizeHTML(location);
            website  = xss.sanitizeHTML(website);
            bio      = xss.sanitizeHTML(bio);
            image    = xss.sanitizeHTML(image);
            header   = xss.sanitizeHTML(header);
            color    = xss.sanitizeHTML(color);
        } else {
            text     = striptags(text);
            location = striptags(location);
            website  = striptags(website);
            bio      = striptags(bio);
            image    = striptags(image);
            header   = striptags(header);
            color    = striptags(color);
        }
    
        var meta = {
            image:    image,
            header:   header,
            text:     text,
            location: location,
            website:  website,
            bio:      bio,
            color:    color
        };
    
        db.users.setProfile(user.name, meta, function (err) {
            if (err) {
                return res.send(500);
            }
    
            db_accounts.setEmail(user.name, email, function(err) {
                if (err) {
                    return res.send(500);
                }
                
                var success = function() {
                    try {
                        user.email   = email;
                        user.profile = JSON.parse(user.profile);
                    } catch (e) {
                        user.profile = {
                            image: "",
                            header: "",
                            text: "",
                            website: "",
                            bio: "",
                            color: ""
                        };
                    }
    
                    template.send(res, 'admin/users/edit', {
                        pageTitle: "Users",
                        user: user
                    });
                };
                
                if (password.length > 0) {
                    db_accounts.setPassword(user.name, password, function(err) {
                        if (err) {
                            return res.send(500);
                        }
                        success();
                    });
                } else {
                    success();
                }
            });
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/admin/users', security, handleIndex);
        app.get('/admin/users/edit/:id', security, handleEdit);
        app.post('/admin/users/edit/:id', security, handleEditSave);
    }
};