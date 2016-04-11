"use strict";
import template from '../template';

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
    init: function (app) {
        app.get('/terms', handleUserAgreement);
        app.get('/privacy', handlePrivacyPolicy);
        app.get('/help', handleHelp);
    }
};