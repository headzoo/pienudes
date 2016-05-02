'use strict';

var mod_voting = require('../../voting');
var db_media   = require('../../database/media');

function handleVote(req, res) {
    if (req.user == undefined) {
        return res.send(401);
    }
    
    var vote = req.body.vote.trim();
    var mid  = req.body.mid.trim();
    if (vote.length == 0 || mid.length == 0) {
        return res.send(400);
    }
    
    vote = parseInt(vote);
    mid  = parseInt(mid);
    if (isNaN(vote) || isNaN(mid)) {
        return res.send(400);
    }
    
    mod_voting.vote(mid, req.user.id, vote, function(err, votes) {
        if (err) return res.send(500);
        res.json(votes);
    });
}

module.exports = {
    /**
     * Initializes auth callbacks
     */
    init: function (app) {
        app.post('/voting/vote', handleVote);
    }
};