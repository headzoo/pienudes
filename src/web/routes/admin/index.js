'use strict';

import template from '../../template';
import Config from '../../../config';
import security from './security';

var channelIndex;

function handleIndex(req, res) {
    channelIndex.listAllChannels()
        .then(function(channels) {
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
        app.get('/admin', security, handleIndex);
    }
};