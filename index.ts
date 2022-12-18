import { getStreamURL } from './getStreamURL';
import { token } from './variables';
import $ from 'jquery';
// import shaka from 'shaka-player';
import shaka from 'shaka-player/dist/shaka-player.ui.debug';
import muxjs from 'mux.js';

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
    const uiContainer = document.getElementById('video-container');
    player = new shaka.Player(video);
    // Attach player to the window to make it easy to access in the JS console.
    // @ts-expect-error
    window.player = player;
    const ui = new shaka.ui.Overlay(player, uiContainer, video);
    ui.configure({
        overflowMenuButtons: [
            'captions',
            'quality',
            'language',
            'picture_in_picture',
            'cast',
            'playback_rate',
            'statistics',
        ],
        singleClickForPlayAndPause: false,
        doubleClickForFullscreen: false,
        enableKeyboardPlaybackControls: false,
    } as shaka.extern.UIConfiguration);
    ui.getControls()
        ?.getLocalization()
        ?.insert('en', new Map([['teamradio', 'Team Radio']]));
    ui.getControls()
        ?.getLocalization()
        ?.insert('en', new Map([['fx', 'FX']]));
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
