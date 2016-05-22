var Server = require("../../server");
import CyTubeUtil from '../../utilities';
import xss from '../../xss';
import Config from '../../config';
import template from '../template';
import * as HTTPStatus from '../httpstatus';
import { HTTPError } from '../../errors';
import db_channels from '../../database/channels';

export default function initialize(app, ioConfig) {
    app.get('/r/:channel', (req, res) => {
        if (!req.params.channel || !CyTubeUtil.isValidChannelName(req.params.channel)) {
            throw new HTTPError(`"${xss.sanitizeText(req.params.channel)}" is not a valid ` +
                    'channel name.', { status: HTTPStatus.NOT_FOUND });
        }
        
        var users = [];
        Server.getServer().getChannel(req.params.channel).users.forEach(function(u) {
            users.push({
                name: u.account.name,
                rank: u.account.effectiveRank,
                profile: u.account.profile,
                meta: {
                    afk: false,
                    muted: false,
                    smuted: false
                }
            });
        });
        
        db_channels.fetchByName(req.params.channel, function(err, chan) {
            if (err) {
                return console.log(err);
            }
            
            db_channels.fetchData(chan.id, function(err, data) {
                if (err) {
                    return console.log(err);
                }
                
                var playlist = [];
                var values   = {};
                data.forEach(function(row) {
                    if (row.key == "playlist") {
                        JSON.parse(row.value).pl.forEach(function(p) {
                            p.playing = false;
                            playlist.push(p);
                        });
                    } else {
                        values[row.key] = row.value;
                    }
                });
                
                values.playlist = JSON.stringify(playlist);
                values.users    = JSON.stringify(users);
                
                if (!values.chatbuffer) {
                    values.chatbuffer = JSON.stringify([]);
                }
                if (!values.emotes) {
                    values.emotes = JSON.stringify([]);
                }
                if (!values.filters) {
                    values.filters = JSON.stringify([]);
                }
                if (!values.css) {
                    values.css = JSON.stringify("");
                }
                if (!values.js) {
                    values.js = JSON.stringify("");
                }
    
                const endpoints = ioConfig.getSocketEndpoints();
                if (endpoints.length === 0) {
                    throw new HTTPError('No socket.io endpoints configured');
                }
                const socketBaseURL = endpoints[0].url;
    
                template.send(res, 'channel/index', {
                    channelName: req.params.channel,
                    channelData: values,
                    pageScripts: ["/build/bundle.min.js"],
                    bytes_per_channel: Config.get("uploads.bytes_per_channel"),
                    bytes_per_file: Config.get("uploads.bytes_per_file"),
                    sioSource: `${socketBaseURL}/socket.io/socket.io.js`
                });
            });
        });
    });
}
