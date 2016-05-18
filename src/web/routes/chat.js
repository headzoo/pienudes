'use strict';

import template from '../template';
import Config from '../../config';

var db_chat_logs = require('../../database/chat_logs');
var db_channels  = require('../../database/channels');

function handleLogsIndex(req, res) {
    db_channels.fetchAll(function(err, rows) {
        var channels = [];
        rows.forEach(function(row) {
            var opts = JSON.parse(row.value);
            if (opts.show_public) {
                channels.push({
                    name: row.name,
                    owner: row.owner,
                    opts: opts
                });
            }
        });
        template.send(res, 'chat/logs', {
            pageTitle: "Chat Logs",
            pageScripts: ["/js/data.js", "/js/util.js", "/js/bbq.js", "/js/chat_logs.js"],
            channels: channels
        });
    });
}

function handleLogsForChannel(req, res) {
    var after  = req.query.after;
    var search = req.query.search.trim();
    
    db_channels.lookup(req.params.channel, function(err, chan) {
        if (err) {
            return res.send(500);
        }
        if (!chan) {
            return res.send(404);
        }
        
        if (search.length != 0) {
            db_chat_logs.fetchByChannelAndSearch(chan.id, search, function(err, rows) {
                if (err) {
                    console.log(err);
                    return res.send(500);
                }
                
                rows.forEach(function (row) {
                    row.meta = JSON.parse(row.meta);
                });
                res.json(rows);
            });
        } else {
            if (after != 0) {
                if (after > 5) {
                    after = after - 5;
                }
                db_chat_logs.fetchTodayByChannelAfterId(chan.id, after, function (err, rows) {
                    if (err) {
                        console.log(err);
                        return res.send(500);
                    }
            
                    rows.forEach(function (row) {
                        row.meta = JSON.parse(row.meta);
                    });
                    res.json(rows);
                });
            } else {
                db_chat_logs.fetchTodayByChannel(chan.id, function (err, rows) {
                    if (err) {
                        console.log(err);
                        return res.send(500);
                    }
            
                    rows.forEach(function (row) {
                        row.meta = JSON.parse(row.meta);
                    });
                    res.json(rows);
                });
            }
        }
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/chat/logs', handleLogsIndex);
        app.get('/chat/logs/:channel', handleLogsForChannel);
    }
};