"use strict";
var Logger = require("../../logger");

import template from '../template';
import Config from '../../config';

function handleIndex(req, res) {
    template.send(res, 'contact/index', {
        pageTitle: "Contact",
        pageSuccess: null,
        pageError: null,
        fields: {email: "", name: "", message: ""},
        errors: {}
    });
}

function handleIndexSubmit(req, res) {
    var email   = req.body.email.trim();
    var name    = req.body.name.trim();
    var message = req.body.message.trim();
    var errors  = {};
    
    if (email.length == 0) {
        errors.email = "Required value.";
    }
    if (name.length == 0) {
        errors.name = "Required value.";
    }
    if (message.length == 0) {
        errors.message = "Required value."
    }
    if (errors.email || errors.name || errors.message) {
        return template.send(res, 'contact/index', {
            pageTitle: "Contact",
            pageSuccess: null,
            pageError: "Please fix the errors below.",
            fields: {email: email, name: name, message: message},
            errors: errors
        });
    }
    
    var mail = {
        from: email,
        to: Config.get("mail.from-name") + " <" + Config.get("mail.from-address") + ">",
        subject: "Contact form submitted from " + name,
        text: message
    };
    Config.get("mail.nodemailer").sendMail(mail, function (err, response) {
        if (err) {
            Logger.errlog.log("mail fail: " + err);
            return template.send(res, 'contact/index', {
                pageTitle: "Contact",
                pageSuccess: null,
                pageError: "There was an error sending your message. Please try again in a minute.",
                fields: {email: email, name: name, message: message},
                errors: {}
            });
        } else {
            template.send(res, 'contact/index', {
                pageTitle: "Contact",
                pageSuccess: "Thank you. Your message has been sent.",
                pageError: null,
                fields: {email: "", name: "", message: ""},
                errors: {}
            });
        }
    });
}

function handleDmca(req, res) {
    template.send(res, 'contact/dmca', {
        pageTitle: "DMCA",
        pageSuccess: null,
        pageError: null,
        fields: {email: "", name: "", phone: "", message: ""},
        errors: {}
    });
}

function handleDmcaSubmit(req, res) {
    var email   = req.body.email.trim();
    var name    = req.body.name.trim();
    var phone   = req.body.phone.trim();
    var message = req.body.message.trim();
    var errors  = {};
    
    if (email.length == 0) {
        errors.email = "Required value.";
    }
    if (name.length == 0) {
        errors.name = "Required value.";
    }
    if (phone.length == 0) {
        errors.phone = "Required value.";
    }
    if (message.length == 0) {
        errors.message = "Required value."
    }
    if (errors.email || errors.name || errors.message) {
        return template.send(res, 'contact/dmca', {
            pageTitle: "DMCA",
            pageSuccess: null,
            pageError: "Please fix the errors below.",
            fields: {email: email, name: name, phone: phone, message: message},
            errors: errors
        });
    }
    
    var mail = {
        from: email,
        to: Config.get("mail.from-name") + " <" + Config.get("mail.from-address") + ">",
        subject: "DMCA form submitted from " + name,
        text: "Phone: " + phone + "\r\n\r\n" + message
    };
    Config.get("mail.nodemailer").sendMail(mail, function (err, response) {
        if (err) {
            Logger.errlog.log("mail fail: " + err);
            return template.send(res, 'contact/dmca', {
                pageTitle: "DMCA",
                pageSuccess: null,
                pageError: "There was an error sending your message. Please try again in a minute.",
                fields: {email: email, name: name, phone: phone, message: message},
                errors: {}
            });
        } else {
            template.send(res, 'contact/dmca', {
                pageTitle: "DMCA",
                pageSuccess: "Thank you. Your message has been sent.",
                pageError: null,
                fields: {email: "", name: "", phone: "", message: ""},
                errors: {}
            });
        }
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.get('/contact', handleIndex);
        app.post('/contact', handleIndexSubmit);
        app.get('/dmca', handleDmca);
        app.post('/dmca', handleDmcaSubmit);
    }
};

