import { sendTemplate } from '../template';

export default function initialize(app, channelIndex) {
    app.get('/', (req, res) => {
        channelIndex.listPublicChannels().then((channels) => {
            channels.sort((a, b) => {
                if (a.usercount === b.usercount) {
                    return a.uniqueName > b.uniqueName ? -1 : 1;
                }

                return b.usercount - a.usercount;
            });
            
            sendTemplate(res, 'home/index', {
                channels: channels
            });
        });
    });
}
