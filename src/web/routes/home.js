"use strict";
import template from '../template';
import Config from '../../config';
import db_playlists from '../../database/playlist';
import db_votes from '../../database/votes';
import db_tags from '../../database/tags';
var moment = require('moment');

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

function handleAbout(req, res) {
    template.send(res, 'home/about', {
        pageTitle: "About Us"
    });
}

function handleTags(req, res) {
    db_tags.fetchAll(function(err, tags) {
        if (err || !tags) {
            return res.json([]);
        }
        
        var names = [
            "50s",
            "60s",
            "70s",
            "80s",
            "90s",
            "AlternativeRock",
            "AlternativeRap",
            "Punk",
            "Rock",
            "KPop",
            "CPop",
            "JPop",
            "Grunge",
            "Blues",
            "ClassicCountry",
            "PopCountry",
            "HonkyTonk",
            "Choral",
            "Classical",
            "Opera",
            "Novelty",
            "Comedy",
            "Bluegrass",
            "Club",
            "EDM",
            "Dubstep",
            "Trap",
            "House",
            "Garage",
            "Grime",
            "Hardcore",
            "Liquid Dub",
            "Techno",
            "Trance",
            "Lounge",
            "Swing",
            "8bit",
            "Drum&Bass",
            "Industrial",
            "GangstaRap",
            "EastCoast",
            "WestCoast",
            "OldSchool",
            "Holidays",
            "Christian",
            "Jazz",
            "AcidJazz",
            "SmoothJazz",
            "BigBand",
            "HipHop",
            "Rap",
            "Fusion",
            "AdultContemporary",
            "BubblegumPop",
            "DancePop",
            "SoftRock",
            "Pop",
            "ClassicRock",
            "R&B",
            "Disco",
            "Funk",
            "Soul",
            "Motown",
            "Reggae",
            "Metal",
            "DeathMetal",
            "GlamRock",
            "GrindCore",
            "HardRock",
            "Psychedelic",
            "SouthernRock",
            "Folk",
            "Foreign",
            "MovieSoundtrack",
            "Caribbean"
        ];
        tags.forEach(function(tag) {
            names.push(tag.name);
        });
        
        res.json(names);
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
        app.get('/about', handleAbout);
        app.get('/tags', handleTags);
        app.get('/', (req, res) => {
            channelIndex.listPublicChannels().then((channels) => {
                channels.sort((a, b) => {
                    if (a.usercount === b.usercount) {
                        return a.uniqueName > b.uniqueName ? -1 : 1;
                    }
                
                    return b.usercount - a.usercount;
                });
                
                var today = moment().format("YYYY-MM-DD");
                db_playlists.fetch(3, 0, function(err, recent_rows) {
                    db_playlists.fetchMostWatchedByDate(today, 3, function(err, top_rows) {
                        db_votes.fetchMostUpvotedByDate(today, 3, function(err, voted_rows) {
                            template.send(res, 'home/index', {
                                pageTitle: "upnext.fm - Music and Chat",
                                top_media: top_rows,
                                recent_media: recent_rows,
                                voted_rows: voted_rows,
                                channels: channels,
                                today: today
                            });
                        });
                    });
                });
            });
        });
    }
};