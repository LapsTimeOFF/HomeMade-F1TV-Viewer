import React, { useEffect, useState } from 'react';
import { JSONTree } from 'react-json-tree';
import { hubConnection } from 'signalr-no-jquery';
import { inflateRaw } from 'pako';

function decompressTimeSeries(data: string) {
    return JSON.parse(
        inflateRaw(Buffer.from(data, 'base64'), { to: 'string' })
    );
}

const LiveTiming = () => {
    const [allData, setAllData] = useState({});
    const [URL, setURL] = useState('https://livetiming.formula1.com/signalr');

    // @ts-ignore
    window.setCustomLT_URL = setURL;

    useEffect(() => {
        let currentData = {};

        const signalrConnection = hubConnection(URL, {
            useDefaultPath: false,
            logging: true,
        });
        const hub = signalrConnection.createHubProxy('Streaming');

        hub.on('feed', function (topic: string, data) {
            if (topic.endsWith('.z')) {
                data = decompressTimeSeries(data);
            }

            let data2;

            switch (topic) {
                default: {
                    data2 = {
                        ...currentData,
                        [topic]: data,
                    };
                }
            }

            currentData = data2;

            setAllData(data2);
            console.log(topic, data);

            // console.log(allData);
        });

        signalrConnection.start().done(() => {
            // do some initialization once you know the connection has been started
            // For instance, call a method on the server
            hub.invoke('Subscribe', [
                'Heartbeat',
                'CarData.z',
                'Position.z',
                'ExtrapolatedClock',
                'TopThree',
                'RcmSeries',
                'TimingStats',
                'TimingAppData',
                'WeatherData',
                'TrackStatus',
                'DriverList',
                'RaceControlMessages',
                'SessionInfo',
                'SessionData',
                'LapCount',
                'TimingData',
            ]);
        });

        return () => {
            signalrConnection.stop();
        };
    }, [URL]);

    return <JSONTree data={allData} />;
};

export default LiveTiming;
