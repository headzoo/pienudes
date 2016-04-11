"use strict";
import template from '../template';
import Config from '../../config';

function handleUserAgreement(req, res) {
    template.send(res, 'home/tos', {
        domain: Config.get('http.domain')
    });
}

function handlePrivacyPolicy(req, res) {
    template.send(res, 'home/privacy', {
        domain: Config.get('http.domain')
    });
}

function handleHelp(req, res) {
    template.send(res, 'home/help', {});
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app, channelIndex) {
        app.get('/terms', handleUserAgreement);
        app.get('/privacy', handlePrivacyPolicy);
        app.get('/help', handleHelp);
        app.get('/', (req, res) => {
            channelIndex.listPublicChannels().then((channels) => {
                channels.sort((a, b) => {
                    if (a.usercount === b.usercount) {
                        return a.uniqueName > b.uniqueName ? -1 : 1;
                    }
                
                    return b.usercount - a.usercount;
                });
            
                template.send(res, 'home/index', {
                    channels: channels
                });
            });
        });
    }
};