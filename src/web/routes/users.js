"use strict";

var multer     = require('multer');
var AWS        = require('aws-sdk');
var fs         = require('fs');
var Jimp       = require('jimp');
var async      = require('async');
var Redis      = require('../../redis');
var striptags  = require('striptags');
var mod_voting = require('../../voting');

import template from '../template';
import Config from '../../config';
import db from '../../database';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';
import db_votes from '../../database/votes';
import xss from '../../xss';

const ONEMB = (1024 * 1024);
const HEADER_COLOR = "#024793";

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

function handleIndex(req, res) {
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
            if (row.name.length != 0) {
                if (row.profile == "") {
                    row.profile = {image: "", text: "", bio: "", header: "", color: HEADER_COLOR};
                } else {
                    row.profile = JSON.parse(row.profile);
                    if (!row.profile.color) {
                        row.profile.color = HEADER_COLOR;
                    }
                }
                
                users.push(row);
            }
        });
        
        template.send(res, 'users/index', {
            pageTitle: "Users",
            users: users
        });
    });
}

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
            user.profile = {image: "", text: "", bio: "", header: "", color: HEADER_COLOR};
        } else {
            user.profile = JSON.parse(user.profile);
            if (!user.profile.color) {
                user.profile.color = HEADER_COLOR;
            }
        }
        
        user.founding_member = (user.id < 37);
        
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
    
                        async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                            template.send(res, 'users/profile', {
                                pageTitle: req.params.name,
                                pageTab: "home",
                                user: user,
                                media: results,
                                media_count: count,
                                likes: likes,
                                page:  parseInt(page),
                                pages: parseInt(pages),
                                input_maxes: getInputMaxes(),
                                pageScripts: ["/js/voting.js"]
                            });
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
    
        var text     = req.body.text.trim();
        var location = req.body.location.trim();
        var website  = req.body.website.trim();
        var bio      = req.body.bio.trim();
        var image    = req.body.image.trim();
        var header   = req.body.header.trim();
        var color    = req.body.color.trim();
        if (header == "none") {
            header = "";
        }
        
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
        
        Redis.createClient(Config.get("redis.databases").uploads, function(err, client) {
            if (err) {
                client.quit();
                return res.json({
                    message: "Failed to save profile."
                }, 500);
            }
    
            var avatars     = {};
            var headers     = {};
            var key_avatars = "uploads:avatars:" + req.user.name;
            var key_headers = "uploads:headers:" + req.user.name;
            
            client.hgetall(key_avatars, function(err, urls) {
                if (err) {
                    client.quit();
                    return res.json({
                        message: "Failed to save profile."
                    }, 500);
                }
                if (urls) {
                    avatars = urls;
                }
                
                client.hgetall(key_headers, function(err, urls) {
                    if (err) {
                        client.quit();
                        return res.json({
                            message: "Failed to save profile."
                        }, 500);
                    }
                    if (urls) {
                        headers = urls;
                    }
                    
                    if (website) {
                        if (!website.match(/^https?:\/\//)) {
                            website = "http://" + website;
                        }
                    }
    
                    if (image && image != "/img/avatar.gif") {
                        if (image != profile.image && avatars[image] === undefined) {
                            client.quit();
                            return res.json({
                                message: "Invalid avatar value."
                            }, 500);
                        }
                        client.hdel(key_avatars, image);
                    }
    
                    if (header) {
                        if (header != profile.header && headers[header] === undefined) {
                            client.quit();
                            return res.json({
                                message: "Invalid header image value."
                            }, 500);
                        }
                        client.hdel(key_headers, header);
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
                            client.quit();
                            return res.json({
                                message: "Failed to save profile information."
                            }, 500);
                        }
                        
                        client.quit();
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
            });
        });
    });
}

function handleProfileAvatarUpload(req, res) {
    
    db.users.getProfile(req.user.name, function(err, profile) {
        if (err) {
            res.json({
                message: "Failed to fetch profile information."
            }, 500);
        }
        
        Jimp.read(req.file.path)
            .then(function(image) {
                image.quality(Config.get("profiles.avatar.quality"))
                    .resize(Config.get("profiles.avatar.width"), Config.get("profiles.avatar.height"));
                image.getBuffer(Config.get("profiles.avatar.mime"), function(err, buff) {
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
    
                        var src = Config.get("uploads.uploads_url") + filename;
                        Redis.createClient(Config.get("redis.databases").uploads, function(err, client) {
                            if (err) {
                                return res.json({
                                    message: "Failed to upload image."
                                }, 500);
                            }
    
                            var key = "uploads:avatars:" + req.user.name;
                            client.hset(key, src, Date.now(), function(err) {
                                if (err) {
                                    return res.json({
                                        message: "Failed to upload image."
                                    }, 500);
                                }
                                client.quit();
                                fs.unlink(req.file.path);
                                
                                res.json({
                                    src: src
                                });
                            });
                        });
                    });
                });
            })
            .catch(function(err) {
                console.log(err);
                res.json({
                    message: "Failed to upload image."
                }, 500);
            });
    });
}

function handleProfileHeaderUpload(req, res) {
    db.users.getProfile(req.user.name, function(err, profile) {
        if (err) {
            res.json({
                message: "Failed to fetch profile information."
            }, 500);
        }
        
        Jimp.read(req.file.path)
            .then(function(image) {
                image
                    .quality(Config.get("profiles.header.quality"))
                    .cover(Config.get("profiles.header.width"), Config.get("profiles.header.height"));
                image.getBuffer(Config.get("profiles.header.mime"), function(err, buff) {
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
    
                        var src = Config.get("uploads.uploads_url") + filename;
                        Redis.createClient(Config.get("redis.databases").uploads, function(err, client) {
                            if (err) {
                                return res.json({
                                    message: "Failed to upload image."
                                }, 500);
                            }
        
                            var key = "uploads:headers:" + req.user.name;
                            client.hset(key, src, Date.now(), function(err) {
                                if (err) {
                                    return res.json({
                                        message: "Failed to upload image."
                                    }, 500);
                                }
            
                                client.quit();
                                fs.unlink(req.file.path);
                                
                                res.json({
                                    src: src
                                });
                            });
                        });
                    });
                });
            })
            .catch(function(err) {
                console.log(err);
                res.json({
                    message: "Failed to upload image."
                }, 500);
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
            user.profile = {image: "", text: "", bio: "", header: "", color: HEADER_COLOR};
        } else {
            user.profile = JSON.parse(user.profile);
            if (!user.profile.color) {
                user.profile.color = HEADER_COLOR;
            }
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
    
                    async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                        template.send(res, 'users/upvotes', {
                            pageTitle: name + "'s Up Votes",
                            pageTab: "upvotes",
                            user: user,
                            media: results,
                            media_count: count,
                            likes: likes,
                            page:  parseInt(page),
                            pages: parseInt(pages),
                            input_maxes: getInputMaxes(),
                            pageScripts: ["/js/voting.js"]
                        });
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
            user.profile = {image: "", text: "", bio: "", header: "", color: HEADER_COLOR};
        } else {
            user.profile = JSON.parse(user.profile);
            if (!user.profile.color) {
                user.profile.color = HEADER_COLOR;
            }
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
    
                    async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                        template.send(res, 'users/downvotes', {
                            pageTitle: name + "'s Down Votes",
                            pageTab: "downvotes",
                            user: user,
                            media: results,
                            media_count: count,
                            likes: likes,
                            page:  parseInt(page),
                            pages: parseInt(pages),
                            input_maxes: getInputMaxes(),
                            pageScripts: ["/js/voting.js"]
                        });
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
        app.get('/users', handleIndex);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/liked/:page?', handleUpvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/disliked/:page?', handleDownvotes);
        app.get('/user/:name([a-zA-Z0-9_\-]{1,20})/:page?', handleProfile);
        app.post('/user/profile/bio/save', handleProfileSave);
        app.post('/user/profile/avatar/save', upload_avatar.single("avatar"), handleProfileAvatarUpload);
        app.post('/user/profile/header/save', upload_header.single("header"), handleProfileHeaderUpload);
        app.post('/user/profile/track/delete', handleTrackDelete);
    }
};