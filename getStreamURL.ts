import { playbackRequestPath } from './getAPIStreamURL';
import { getStreamData } from './getStreamData';

const fetch = (...args: any) =>
    // @ts-ignore
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

export const contentId: number | string = 1000005659;

export async function getStreamURL(
    format: string,
    contentId: number | string,
    token: string,
    channelId?: number | string
) {
    let url;
    if (channelId) {
        url = await playbackRequestPath(format, contentId, channelId);
    } else {
        url = await playbackRequestPath(format, contentId);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: { ascendontoken: token },
    });
    let data: any;
    try {
        data = await response.json();
    } catch (error) {
        console.log(error);
        console.log(response.text());
        return;
    }

    console.log(data);

    if (data.resultCode !== 'OK') {
        console.error(data.message);
        throw new Error('Failed to get a streaming url.');
    }

    const streamData = await getStreamData(format, contentId);

    if (channelId) {
        let driverData;

        for (
            let _i = 0;
            _i <
            streamData.resultObj.containers[0].metadata.additionalStreams
                .length;
            _i++
        ) {
            const driver =
                streamData.resultObj.containers[0].metadata.additionalStreams[
                    _i
                ];
            console.log(driver);

            if (channelId == driver.channelId) driverData = driver;
        }

        console.log(driverData);

        if (driverData.type === 'additional') {
            return {
                url: data.resultObj.url,
                streamType: data.resultObj.streamType,
                title: streamData.resultObj.containers[0].metadata.emfAttributes
                    .Global_Title,
                stream: driverData.title,
            };
        }

        return {
            url: data.resultObj.url,
            streamType: data.resultObj.streamType,
            title: streamData.resultObj.containers[0].metadata.emfAttributes
                .Global_Title,
            driver: [
                driverData.title,
                driverData.racingNumber,
                driverData.teamName,
            ],
        };
    }

    // console.log(data.resultObj);

    return {
        url: data.resultObj.url,
        streamType: data.resultObj.streamType,
        title: streamData.resultObj.containers[0].metadata.emfAttributes
            .Global_Title,
    };
}

// (async () => {
//     console.log(await getStreamURL('WEB_HLS', contentId, token));
// })();
