import { getStreamURL } from './getStreamURL';
import { token } from './variables';
import $ from 'jquery';
import shaka from 'shaka-player';
window.shaka = shaka;
window.token = token;

let player: any;

const path = window.location.pathname.split('/');

async function loadStream(
    contentId: number | string,
    token: string,
    channelId: number | string
) {
    try {
        player.destroy();
    } catch (error) {
        console.warn('No player detected. Or an issue happened while destroy.');
    }

    let data;
    if (channelId !== 'WIF')
        data = await getStreamURL('WEB_DASH', contentId, token, channelId);
    else data = await getStreamURL('WEB_DASH', contentId, token);

    console.log(data);

    // let driver = '';

    // if (data?.driver !== undefined) {
    //     for (let index = 0; index < data?.driver.length; index++) {
    //         const element = data?.driver[index];
    //         driver = driver + element + `${index !== 2 ? ' | ' : ''}`;
    //     }
    // } else {
    //     if (data?.stream) driver = data.stream;
    //     else driver = 'INTERNATIONAL';
    // }

    // let source;

    // if (data?.streamType === 'HLS') {
    //     source = {
    //         title: `${data?.title} - ${driver}`,
    //         hls: data?.url,
    //     };
    // }

    // if (data?.streamType === 'DASH') {
    //     source = {
    //         title: `${data?.title} - ${driver}`,
    //         dash: data?.url,
    //     };
    // }

    const video = document.getElementById('video');
    player = new shaka.Player(video);
    // Attach player to the window to make it easy to access in the JS console.
    // @ts-expect-error
    window.player = player;
    await player.load(data?.url);
}

async function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        await loadStream(path[2], token, path[3]);
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}

$(document).ready(async () => {
    await $('body').append(
        '<video id="video" width="100%" poster="/assets/poster.png" controls autoplay></video>'
    );
    await initApp();
});
