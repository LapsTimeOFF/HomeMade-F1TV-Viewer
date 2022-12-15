import { Layout, Layout_File, Layout_Player } from './interfaces';

import fs from 'node:fs';

const F1MV_File = {};

const { layouts } = F1MV_File;

let final_layout: Layout_File = {
    version: 1,
    // @ts-ignore
    layouts: [],
};

for (let _i = 0; _i < layouts.length; _i++) {
    const layout = layouts[_i];

    const { windows } = layout;

    let this_layout: Layout = {
        id: 0,
        name: '',
        // @ts-ignore
        players: [],
    };

    this_layout.id = layout.id;
    this_layout.name = layout.title;

    for (let _i = 0; _i < windows.length; _i++) {
        const player = windows[_i];
        let this_player: Layout_Player = {
            x: 0,
            y: 0,
            channelId: '',
            width: 0,
        };

        this_player.x = player.bounds.x;
        this_player.y = player.bounds.y;
        this_player.width = player.bounds.width;
        this_player.channelId =
            player.streamData.title === 'INTERNATIONAL'
                ? 'WIF'
                : player.streamData.channelId.toString();

        this_layout.players.push(this_player);
    }

    final_layout.layouts.push(this_layout);
}

fs.writeFileSync('./layouts.json', JSON.stringify(final_layout));
console.log('Done');
