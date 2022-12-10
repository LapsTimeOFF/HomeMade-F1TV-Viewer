import $ = require('jquery');
import { getStreamData } from './getStreamData';

$(document).ready(async () => {
    $('#contentId').val('1000005659');

    const name = document.querySelector('#open');
    $('#open').click(async () => {
        const contentId: any = $('#contentId').val();
        const channelId = $('#channels').val();

        // var channelId = e?.value;

        console.log(contentId, channelId);

        // if (channelId === '') {
        //     fetch(`/openNewWindow/${contentId}`)
        //     return
        // }
        fetch(`/openNewWindow/${contentId}/${channelId}`);
    });

    $('#load').click(async () => {
        const contentId: any = $('#contentId').val();

        console.log('Getting channels');

        const streamData = await getStreamData('WEB_DASH', contentId);
        const streams =
            streamData.resultObj.containers[0].metadata.additionalStreams;

        console.log(
            `${streamData.resultObj.containers[0].metadata.additionalStreams.length} additional stream found.`
        );
        console.log(`Starting classification...`);

        const categories: any[] = [];

        for (let _i = 0; _i < streams.length; _i++) {
            const stream = streams[_i];

            if (categories.includes(stream.type) === false) {
                console.log(`New category detected : ${stream.type}`);
                categories.push(stream.type);
                $('#channels').append(
                    `<optgroup label="${
                        stream.type === 'additional'
                            ? 'Additional Streams'
                            : 'OBCs'
                    }" id=${stream.type}"></optgroup>`
                );
            }

            $(
                `optgroup[label="${
                    stream.type === 'additional' ? 'Additional Streams' : 'OBCs'
                }"]`
            ).append(
                `<option value="${
                    stream.reportingName === 'WIF' ? 'WIF' : stream.channelId
                }" ${stream.default === true ? 'selected' : ''}>${
                    stream.type === 'obc'
                        ? `${stream.reportingName}|${stream.teamName}`.replace(
                              /[|]/g,
                              ' | '
                          )
                        : stream.title
                }</option>`
            );

            console.log(
                `Name : ${
                    stream.type === 'obc'
                        ? `${stream.reportingName}|${stream.teamName}`.replace(
                              /[|]/g,
                              ' | '
                          )
                        : stream.title
                }, Type : ${stream.type}`
            );
        }

        console.log(`Classification done.`);
    });
});
