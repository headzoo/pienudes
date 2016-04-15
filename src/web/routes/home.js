"use strict";
import template from '../template';
import Config from '../../config';
import playlists from '../../database/playlist';

function handleUserAgreement(req, res) {
    template.send(res, 'home/tos', {
        pageTitle: "Terms of Service",
        domain: Config.get('http.domain')
    });
}

function handlePrivacyPolicy(req, res) {
    template.send(res, 'home/privacy', {
        pageTitle: "Privacy Policy",
        domain: Config.get('http.domain')
    });
}

function handleHelp(req, res) {
    template.send(res, 'home/help', {
        pageTitle: "Help"
    });
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
                
                playlists.fetchMostWatched(25, function(err, rows) {
                    template.send(res, 'home/index', {
                        pageTitle: "Pienudes - Music and Chat",
                        top_media: rows,
                        channels: channels
                    });
                });
            });
        });
    }
};