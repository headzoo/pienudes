'use strict';

import template from '../../template';
import Config from '../../../config';

var channelIndex;

function securityCheck(req, res, next) {
    if (!req.user || req.user.global_rank < 255) {
        return res.send(401);
    }
    next();
}

function handleIndex(req, res) {
    channelIndex.listAllChannels()
        .then(function(channels) {
            console.log(channels);
            template.send(res, 'admin/index', {
                pageTitle: "Admin",
                channels: channels
            });
        });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app, ci) {
        channelIndex = ci;
        app.get('/admin', securityCheck, handleIndex);
    }
};