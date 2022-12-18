import React from 'react';
import $ from 'jquery';
import { getStreamData } from './getStreamData';
import { Layout, Layout_Player } from './interfaces';

const Panel = () => {
    async function loadLayouts() {
        const req = await fetch('/layouts.json');
        const { layouts } = await req.json();

        for (let _i = 0; _i < layouts.length; _i++) {
            const layout = layouts[_i];
            $('#layouts').append(
                `<option value="${layout.id}">${layout.name}</option>`
            );
        }
    }

    $(document).ready(async () => {
        $('#contentId').val('1000005659');

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
                        stream.type === 'additional'
                            ? 'Additional Streams'
                            : 'OBCs'
                    }"]`
                ).append(
                    `<option value="${
                        stream.reportingName === 'WIF'
                            ? 'WIF'
                            : stream.channelId
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

        $(`#open_layout`).click(async () => {
            console.log('Opening layout.');
            console.log('Getting layout list...');
            const req = await fetch('/layouts.json');
            const layout_list = await req.json();
            const { layouts } = layout_list;
            console.log('Done.');

            const layout_id = $('#layouts').val();

            for (let _i = 0; _i < layouts.length; _i++) {
                const layout: Layout = layouts[_i];
                const contentId: any = $('#contentId').val();

                console.log('Checking this layout...');

                if (layout.id === layout_id) {
                    console.log('Good id.');
                    for (let _i = 0; _i < layout.players.length; _i++) {
                        const player: Layout_Player = layout.players[_i];
                        console.log(player);

                        console.log(
                            `Calling /openNewWindow/${contentId}/${player.channelId}/${player.x}/${player.y}/${player.width}`
                        );

                        fetch(
                            `/openNewWindow/${contentId}/${player.channelId}/${player.x}/${player.y}/${player.width}`
                        );
                    }
                }
            }
        });

        loadLayouts();
    });

    return (
        <div>
            <input type="text" placeholder="contentId" id="contentId" />
            <button id="load">Load streams</button>

            <br />

            {/* <input type="text" placeholder="channelId" id="channelId"> */}
            <select name="Channels" id="channels"></select>
            <button id="open">Open Player</button>

            <br />

            <select name="Layouts" id="layouts"></select>
            <button id="open_layout">Open this layout</button>
        </div>
    );
};

export default Panel;
