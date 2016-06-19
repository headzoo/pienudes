'use strict';
import template from '../template';

function handleHelp(req, res) {
    template.send(res, 'scripting/help', {
        pageTitle: "Scripting Help",
        pageStylesheets: ["/css/prism.css"],
        pageScripts: ["/js/prism.js"]
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/scripting/help', handleHelp);
    }
};