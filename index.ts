import { getStreamURL } from './getStreamURL';
import { token } from './variables';
import $ from 'jquery';
import shaka from 'shaka-player';
import muxjs from 'mux.js';
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

    const video = document.getElementById('video');
    player = new shaka.Player(video);
    // Attach player to the window to make it easy to access in the JS console.
    // @ts-expect-error
    window.player = player;
    await player.load(data?.url, null, 'video/mp4');
}

async function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    shaka.dependencies.add(shaka.dependencies.Allowed.muxjs, muxjs);

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
    await initApp();
});
