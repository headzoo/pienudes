import CyTubeUtil from '../../utilities';
import xss from '../../xss';
import Config from '../../config';
import template from '../template';
import * as HTTPStatus from '../httpstatus';
import { HTTPError } from '../../errors';

export default function initialize(app, ioConfig) {
    app.get('/r/:channel', (req, res) => {
        if (!req.params.channel || !CyTubeUtil.isValidChannelName(req.params.channel)) {
            throw new HTTPError(`"${xss.sanitizeText(req.params.channel)}" is not a valid ` +
                    'channel name.', { status: HTTPStatus.NOT_FOUND });
        }
        
        const endpoints = ioConfig.getSocketEndpoints();
        if (endpoints.length === 0) {
            throw new HTTPError('No socket.io endpoints configured');
        }
        const socketBaseURL = endpoints[0].url;
    
        template.send(res, 'channel/index', {
            channelName: req.params.channel,
            bytes_per_channel: Config.get("uploads.bytes_per_channel"),
            bytes_per_file: Config.get("uploads.bytes_per_file"),
            sioSource: `${socketBaseURL}/socket.io/socket.io.js`,
            safemode: (typeof req.query.safemode != "undefined")
        });
    });
}
