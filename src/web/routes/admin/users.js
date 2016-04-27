'use strict';

import template from '../../template';
import Config from '../../../config';
import security from './security';
import db_accounts from '../../../database/accounts';

function handleIndex(req, res) {
    db_accounts.getAll(100, 0, function(err, rows) {
        console.log(rows[0]);
        template.send(res, 'admin/users/index', {
            pageTitle: "Users",
            users: rows
        });
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/admin/users', security, handleIndex);
    }
};