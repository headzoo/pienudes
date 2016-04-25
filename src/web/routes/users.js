"use strict";

var multer  = require('multer');
var AWS     = require('aws-sdk');
var fs      = require('fs');
var Jimp    = require('jimp');
var async   = require('async');
import template from '../template';
import Config from '../../config';
import db from '../../database';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';
import db_votes from '../../database/votes';
import xss from '../../xss';

const ONEMB = (1024 * 1024);
const HEADER_COLOR = "#9609B5";

var upload_avatar = multer({
    dest: '/tmp',
    limits: {
        fileSize: ONEMB
    }
});

var upload_header = multer({
    dest: '/tmp',
    limits: {
        fileSize: (5 * ONEMB)
    }
});

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
            user.profile = {image: "", text: "", bio: "", header: "", header_color: ""};
        } else {
            user.profile = JSON.parse(user.profile);
        }
        console.log(user.profile);
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
                        pages: 1,
                        input_maxes: getInputMaxes()
                    });
                }
        
                var limit  = 25;
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
                    
                    var pids = [];
                    rows.forEach(function(row) {
                        pids.push(row.pid);
                    });
                    async.map(pids, findPlayedByCount, function(err, results) {
                        if (err) {
                            return template.send(res, 'error/http', {
                                status: 500
                            });
                        }
                        rows.forEach(function(row) {
                            results.forEach(function(r) {
                                if (row.pid == r.pid) {
                                    row.common = parseInt(r.num) - 1;
                                }
                            });
                        });
    
                        template.send(res, 'users/profile', {
                            pageTitle: req.params.name,
                            pageTab: "home",
                            user: user,
                            media: rows,
                            media_count: count,
                            likes: likes,
                            page:  parseInt(page),
                            pages: parseInt(pages),
                            input_maxes: getInputMaxes()
                        });
                    });
                });
            });
        });
    });
}

function handleProfileSave(req, res) {
    
    db.users.getProfile(req.user.name, function(err, profile) {
        if (err) {
            res.json({
                message: "Failed to fetch profile information."
            }, 500);
        }
        
        var text     = xss.sanitizeHTML(req.body.text).trim();
        var location = xss.sanitizeHTML(req.body.location).trim();
        var website  = xss.sanitizeHTML(req.body.website).trim();
        var bio      = xss.sanitizeHTML(req.body.bio).trim();
        var image    = xss.sanitizeHTML(req.body.image).trim();
        var header   = xss.sanitizeHTML(req.body.header).trim();
        var color    = xss.sanitizeHTML(req.body.color).trim();
        if (header == "none") {
            header = "";
        }
        
        if (website && (website.substring(0, 8) !== "https://" && website.substring(0, 7) !== "http://")) {
            return res.json({
                message: "Website value must start with http:// or https://",
                target: "#profile-website-edit"
            }, 500);
        }
        if (image && image.substring(0, 8) !== "https://") {
            return res.json({
                message: "Invalid avatar value."
            }, 500);
        }
        if (header && header[0] !== "#" && header.substring(0, 8) !== "https://") {
            return res.json({
                message: "Invalid header image value."
            }, 500);
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
        
        db.users.setProfile(req.user.name, meta, function (err) {
            if (err) {
                res.json({
                    message: "Failed to save profile information."
                }, 500);
            }
            
            res.json({
                text:     text,
                location: location,
                website:  website,
                bio:      bio,
                color:    color,
                image:    profile.image,
                header:   profile.header
            });
        });
    });
}

function handleProfileAvatarSave(req, res) {
    
    db.users.getProfile(req.user.name, function(err, profile) {
        if (err) {
            res.json({
                message: "Failed to fetch profile information."
            }, 500);
        }
        
        Jimp.read(req.file.path)
            .then(function(image) {
                image.resize(200, 200);
                image.getBuffer("image/png", function(err, buff) {
                    if (err) throw err;
                
                    var filename = "profiles/avatars/" + req.user.name + "-" + Date.now() + ".png";
                    var bucket   = new AWS.S3({params: {Bucket: Config.get("uploads.s3_bucket")}});
                    var params   = {
                        Key:         filename,
                        Body:        buff,
                        ContentType: req.file.mimetype,
                        ACL:         'public-read'
                    };
                    bucket.upload(params, function(err) {
                        if (err) throw err;
    
                        res.json({
                            src: Config.get("uploads.uploads_url") + filename
                        });
                    });
                });
            })
            .catch(function(err) {
            
            });
    });
}

function handleProfileHeaderSave(req, res) {
    db.users.getProfile(req.user.name, function(err, profile) {
        if (err) {
            res.json({
                message: "Failed to fetch profile information."
            }, 500);
        }
        
        Jimp.read(req.file.path)
            .then(function(image) {
                image.quality(65);
                image.getBuffer("image/jpeg", function(err, buff) {
                    if (err) throw err;
                    
                    var filename = "profiles/headers/" + req.user.name + "-" + Date.now() + ".jpg";
                    var bucket   = new AWS.S3({params: {Bucket: Config.get("uploads.s3_bucket")}});
                    var params   = {
                        Key:         filename,
                        Body:        buff,
                        ContentType: req.file.mimetype,
                        ACL:         'public-read'
                    };
                    bucket.upload(params, function(err) {
                        if (err) throw err;
                        
                        res.json({
                            src: Config.get("uploads.uploads_url") + filename
                        });
                    });
                });
            })
            .catch(function(err) {
                
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
                        pages: 1,
                        input_maxes: getInputMaxes()
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
                        pages: parseInt(pages),
                        input_maxes: getInputMaxes()
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
                        pages: 1,
                        input_maxes: getInputMaxes()
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
                        pages: parseInt(pages),
                        input_maxes: getInputMaxes()
                    });
                });
            });
        });
    });
}

function handleTrackDelete(req, res) {
    var pid = req.body.pid;
    
    db_playlists.fetchById(pid, function(err, row) {
        if (err || !row) {
            return res.json({status: "error"}, 500);
        }
        if (row.user != req.user.name) {
            return res.json({status: "error"}, 403);
        }
    
        db_playlists.removeById(pid, function(err) {
            if (err) {
                return res.json({status: "error"}, 500);
            }
        
            res.json({status: "ok"});
        });
    });
}

function findPlayedByCount(pid, callback) {
    db_playlists.countDistinctUsersById(pid, function(err, num) {
        if (err) return callback(err);
        callback(null, {pid: pid, num: num});
    });
}

function getInputMaxes() {
    return {
        image:    db.users.max_image,
        header:   db.users.max_header,
        text:     db.users.max_text,
        location: db.users.max_location,
        website:  db.users.max_website,
        bio:      db.users.max_bio
    }
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/liked/:page?', handleUpvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/disliked/:page?', handleDownvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/:page?', handleProfile);
        app.post('/user/profile/bio/save', handleProfileSave);
        app.post('/user/profile/avatar/save', upload_avatar.single("avatar"), handleProfileAvatarSave);
        app.post('/user/profile/header/save', upload_header.single("header"), handleProfileHeaderSave);
        app.post('/user/profile/track/delete', handleTrackDelete);
    }
};