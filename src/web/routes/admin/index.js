'use strict';

import template from '../../template';
import Config from '../../../config';
import security from './security';
import db_channels from '../../../database/channels';

var channelIndex;

function handleIndex(req, res) {
    channelIndex.listAllChannels()
        .then(function(channels) {
            db_channels.fetchAll(function(err, rows) {
                var cleaned = [];
                rows.forEach(function(row) {
                    var chan   = row;
                    var values = JSON.parse(row.value);
                    chan.pagetitle = values.pagetitle;
                    cleaned.push(chan);
                });
                
                template.send(res, 'admin/index', {
                    pageTitle: "Admin",
                    channels: channels,
                    registered: cleaned
                });
            });
        });
}

function handleDeleteChannel(req, res) {
    db_channels.fetchById(req.body.chan_id, function(err, channel) {
        if (err) {
            return res.sendStatus(500);
        } else if (!channel) {
            return res.sendStatus(404);
        }
        
        db_channels.drop(channel.name, function(err) {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app, ci) {
        channelIndex = ci;
        app.get('/admin', security, handleIndex);
        app.post('/admin/channels/delete', security, handleDeleteChannel);
    }
};