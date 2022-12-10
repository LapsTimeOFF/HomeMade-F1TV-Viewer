import $ = require('jquery');
import { getStreamData } from './getStreamData';

async function loadLayouts() {
    const req = await fetch('/layouts.json');
    const { layouts } = await req.json();

    for (let _i = 0; _i < layouts.length; _i++) {
        const layout = layouts[_i];
        $('#layouts').append(
            `<option value="${layout.name}">${layout.name}</option>`
        );
        $(`option[value="${layout.name}"`).click(async () => {
            const req = await fetch('/layouts.json');
            const layouts = await req.json();

            for (let _i = 0; _i < layouts.players.length; _i++) {
                const player = layouts.players[_i];
            }
        });
    }
}

$(document).ready(async () => {
    $('#contentId').val('1000005659');

    const name = document.querySelector('#open');
    $('#open').click(async () => {
        const contentId: any = $('#contentId').val();
        const channelId = $('#channels').val();

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
                }, Type : ${stream.type}, channelId : ${stream.channelId}`
            );
        }

        console.log(`Classification done.`);
    });

    loadLayouts();
});
