import { getStreamURL } from './getStreamURL';
import { token } from './variables';
import { Player } from 'bitmovin-player';

let pla: any;

const path = window.location.pathname.split('/');

async function loadStream(
    contentId: number | string,
    token: string,
    channelId: number | string
) {
    try {
        pla.destroy();
    } catch (error) {
        console.warn('No player detected. Or an issue happened while destroy.');
    }

    let data;
    if (channelId !== 'WIF')
        data = await getStreamURL('WEB_DASH', contentId, token, channelId);
    else data = await getStreamURL('WEB_DASH', contentId, token);

    console.log(data);

    let driver = '';

    if (data?.driver !== undefined) {
        for (let index = 0; index < data?.driver.length; index++) {
            const element = data?.driver[index];
            driver = driver + element + `${index !== 2 ? ' | ' : ''}`;
        }
    } else {
        if (data?.stream) driver = data.stream;
        else driver = 'INTERNATIONAL';
    }

    let source;

    if (data?.streamType === 'HLS') {
        source = {
            title: `${data?.title} - ${driver}`,
            hls: data?.url,
        };
    }

    if (data?.streamType === 'DASH') {
        source = {
            title: `${data?.title} - ${driver}`,
            dash: data?.url,
        };
    }

    const config = {
        key: '',
        source: source,
        location: {
            ui: '/ui/bitmovinplayer-ui.js',
            ui_css: '/ui/bitmovinplayer-ui.css',
        },
    };

    // @ts-ignore
    pla = new Player(document.getElementById('player'), config);
    await pla.load(source);
    await pla.play();
}

(async () => {
    await loadStream(path[2], token, path[3]);
})();
