"use strict";
import template from '../template';
import Config from '../../config';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';
import db_votes from '../../database/votes';

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
            user.profile = {image: "", text: "", bio: "", header: ""};
        } else {
            user.profile = JSON.parse(user.profile);
        }
    
        db_votes.countLikesByUser(user.name, function(err, likes) {
            if (err) {
                return template.send(res, 'error/http', {
                    status: 500
                });
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
                        media_count: 0,
                        likes: likes,
                        page:  1,
                        pages: 1
                    });
                }
        
                var limit  = 50;
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
                        media_count: count,
                        likes: likes,
                        page:  parseInt(page),
                        pages: parseInt(pages)
                    });
                });
            });
        });
    });
}

function handleUpvotes(req, res) {
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
    
        db_votes.countLikesByUser(user.name, function(err, likes) {
            if (err) {
                return template.send(res, 'error/http', {
                    status: 500
                });
            }
    
            db_votes.countUpvotedByUser(user.id, function(err, count) {
                if (err) {
                    return template.send(res, 'error/http', {
                        status: 500
                    });
                }
        
                if (count == 0) {
                    return template.send(res, 'users/upvotes', {
                        pageTitle: name + "'s Up Votes",
                        pageTab: "upvotes",
                        user: user,
                        media: [],
                        media_count: 0,
                        likes: likes,
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
        
                db_votes.fetchUpvotedByUser(user.id, limit, offset, function(err, rows) {
                    if (err) {
                        return template.send(res, 'error/http', {
                            status: 500
                        });
                    }
            
                    template.send(res, 'users/upvotes', {
                        pageTitle: name + "'s Up Votes",
                        pageTab: "upvotes",
                        user: user,
                        media: rows,
                        media_count: count,
                        likes: likes,
                        page:  parseInt(page),
                        pages: parseInt(pages)
                    });
                });
            });
        });
    });
}

function handleDownvotes(req, res) {
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
    
        db_votes.countLikesByUser(user.name, function(err, likes) {
            if (err) {
                return template.send(res, 'error/http', {
                    status: 500
                });
            }
    
            db_votes.countDownvotedByUser(user.id, function(err, count) {
                if (err) {
                    return template.send(res, 'error/http', {
                        status: 500
                    });
                }
        
                if (count == 0) {
                    return template.send(res, 'users/downvotes', {
                        pageTitle: name + "'s Down Votes",
                        pageTab: "downvotes",
                        user: user,
                        media: [],
                        media_count: 0,
                        likes: likes,
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
        
                db_votes.fetchDownvotedByUser(user.id, limit, offset, function(err, rows) {
                    if (err) {
                        return template.send(res, 'error/http', {
                            status: 500
                        });
                    }
            
                    template.send(res, 'users/downvotes', {
                        pageTitle: name + "'s Down Votes",
                        pageTab: "downvotes",
                        user: user,
                        media: rows,
                        media_count: count,
                        likes: likes,
                        page:  parseInt(page),
                        pages: parseInt(pages)
                    });
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
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/liked/:page?', handleUpvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/disliked/:page?', handleDownvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/:page?', handleProfile);
    }
};