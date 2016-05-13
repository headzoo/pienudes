"use strict";

var async  = require('async');
var moment = require('moment');
import template from '../template';
import Config from '../../config';
import db_channels from '../../database/channels.js';
import db_playlists from '../../database/playlist';
import db_accounts from '../../database/accounts';
import db_votes from '../../database/votes';
import mod_voting from '../../voting';

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
        var limit  = 50;
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
            
            async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                template.send(res, 'charts/history', {
                    pageTitle: "Playlist History",
                    media: results,
                    page:  parseInt(page),
                    pages: parseInt(pages),
                    pageScripts: ["/js/voting.js"]
                });
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
    
        async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
            template.send(res, 'charts/history_search', {
                pageTitle: "Playlist History",
                media: results,
                term: term,
                page:  parseInt(page),
                pages: parseInt(pages),
                pageScripts: ["/js/voting.js"]
            });
        });
    });
}

function handleTopRedirect(req, res) {
    res.redirect(301, '/charts/top');
}

function handleTop(req, res) {
    db_playlists.fetchDistinctChannels(function(err, channels){
        db_playlists.fetchDistinctDays(function(err, dates) {
            db_playlists.fetchMostWatched(25, function(err, rows) {
                async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                    template.send(res, 'charts/top', {
                        pageTitle: "25 Most Played Videos",
                        headTitle: "Most Played - All Channels - All Time",
                        media: results,
                        count: 25,
                        channels: channels,
                        dates: dates,
                        pageScripts: ["/js/voting.js"]
                    });
                });
            });
        });
    });
}

function handleTopByChannel(req, res) {
    var channel = req.params.channel;
    db_channels.lookup(channel, function(err) {
        if (err) {
            return template.send(res, 'error/http', {
                path: req.path,
                status: 404,
                message: "Channel does not exist."
            });
        }
    
        db_playlists.fetchDistinctDays(function(err, dates) {
            db_playlists.fetchDistinctChannels(function (err, channels) {
                db_playlists.fetchMostWatchedByChannel(channel, 25, function (err, rows) {
                    async.map(rows, mod_voting.attachVotes.bind(this, req), function (err, results) {
                        template.send(res, 'charts/top', {
                            pageTitle: "25 Most Played Videos - " + channel + " - All Time",
                            headTitle: "Most Played - " + channel + " - All Time",
                            media: results,
                            count: 25,
                            channels: channels,
                            channel: channel,
                            dates: dates,
                            pageScripts: ["/js/voting.js"]
                        });
                    });
                });
            });
        });
    });
}

function handleTopByDate(req, res) {
    var date          = req.params.date;
    var day           = moment(date, "YYYY-MM-D");
    var day_formatted = day.format("MMMM Do YYYY");
    
    db_playlists.fetchDistinctChannels(function(err, channels){
        db_playlists.fetchDistinctDays(function(err, dates) {
            db_playlists.fetchMostWatchedByDate(date, 25, function(err, rows) {
                async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                    template.send(res, 'charts/top', {
                        pageTitle: "25 Most Played Videos - All Channels - " + day_formatted,
                        headTitle: "Most Played - All Channels - " + day_formatted,
                        media: results,
                        count: 25,
                        channels: channels,
                        dates: dates,
                        date: date,
                        pageScripts: ["/js/voting.js"]
                    });
                });
            });
        });
    });
}

function handleTopByChannelAndDate(req, res) {
    var date          = req.params.date;
    var day           = moment(date, "YYYY-MM-D");
    var day_formatted = day.format("MMMM Do YYYY");
    
    var channel = req.params.channel;
    db_channels.lookup(channel, function(err) {
        if (err) {
            return template.send(res, 'error/http', {
                path: req.path,
                status: 404,
                message: "Channel does not exist."
            });
        }
        
        db_playlists.fetchDistinctChannels(function(err, channels){
            db_playlists.fetchDistinctDays(function(err, dates) {
                db_playlists.fetchMostWatchedByChannelAndDate(channel, date, 25, function(err, rows) {
                    async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
                        template.send(res, 'charts/top', {
                            pageTitle: "25 Most Played Videos - " + channel + " - " + day_formatted,
                            headTitle: "Most Played - " + channel + " - " + day_formatted,
                            media: results,
                            count: 25,
                            channels: channels,
                            channel: channel,
                            dates: dates,
                            date: date,
                            pageScripts: ["/js/voting.js"]
                        });
                    });
                });
            });
        });
    });
}

function handleUpvoted(req, res) {
    db_votes.fetchMostUpvoted(25, function(err, rows) {
        async.map(rows, mod_voting.attachVotes.bind(this, req), function(err, results) {
            template.send(res, 'charts/upvoted', {
                pageTitle: "25 Most Upvoted Videos",
                media: results,
                count: 25,
                pageScripts: ["/js/voting.js"]
            });
        });
    });
}

function handleUserRedirect(req, res) {
    var name = req.params.name;
    var page = req.params.page;
    if (page && page != 1) {
        res.redirect(301, '/user/' + name + '/' + page);
    } else {
        res.redirect(301, '/user/' + name);
    }
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/charts/history/search/:page?', handleHistorySearch);
        app.get('/charts/history/:page?', handleHistory);
        app.get('/charts/top', handleTop);
        app.get('/charts/top/r/:channel', handleTopByChannel);
        app.get('/charts/top/date/:date([\\d]{4}\\-[\\d]{2}\\-[\\d]{2})', handleTopByDate);
        app.get('/charts/top/r/:channel/date/:date([\\d]{4}\\-[\\d]{2}\\-[\\d]{2})', handleTopByChannelAndDate);
        app.get('/charts/upvoted', handleUpvoted);
        
        app.get('/playlists/history/:page?', handleHistoryRedirect);
        app.get('/playlists/user/:name/:page?', handleUserRedirect);
        app.get('/playlists/top', handleTopRedirect);
    }
};