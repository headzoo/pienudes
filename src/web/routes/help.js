import { sendJade } from '../jade';

export default function initialize(app, channelIndex) {
    app.get('/help', (req, res) => {
        sendJade(res, 'help', {});
    });
}
