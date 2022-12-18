import { baseURL } from './variables';

export async function playbackRequestPath(format: string, contentId: number | string, channelId?: number | string) {
    const url = new URL(`${baseURL}/2.0/R/FRA/${format}/ALL/CONTENT/PLAY`);
    const searchParams = new URLSearchParams();
    searchParams.set('contentId', contentId.toString(10));
    if (channelId) searchParams.set('channelId', channelId.toString(10));
    url.search = searchParams.toString();

    return url.toString();
}

// (async () => {
//     console.log(getStreamURL('WEB_HLS', contentId));
// })();
