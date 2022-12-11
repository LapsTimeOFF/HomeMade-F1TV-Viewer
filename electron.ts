import path from 'path';
import express from 'express';
require('dotenv').config();

// Modules to control application life and create native browser window
const { app, BrowserWindow, session, protocol } = require('electron');

const api = express();

const privileges = {
    standard: true,
    bypassCSP: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: false,
    stream: true,
};

async function initAPI() {
    await api.get('/', (_: any, res: { sendFile: (arg0: string) => void }) => {
        res.sendFile(`${__dirname}/panel.html`);
    });

    await api.use(
        express.static(
            path.resolve(
                process.env.PATH_STATIC === 'DEV' ? './' : './resources/app/'
            )
        )
    );

    await api.get(
        '/player/:contentId',
        (_: any, res: { sendFile: (arg0: string) => void }) => {
            res.sendFile(`${__dirname}/index.html`);
        }
    );
    await api.get(
        '/player/:contentId/:channelId',
        (_: any, res: { sendFile: (arg0: string) => void }) => {
            res.sendFile(`${__dirname}/index.html`);
        }
    );

    /**
     * @deprecated
     */
    await api.get('/openNewWindow/:contentId', (req, res) => {
        const { contentId } = req.params;

        createWindow(`http://localhost:10101/player/${contentId}`, false);
        console.log('Openning new player');
        res.send('OK');
    });

    await api.get('/openNewWindow/:contentId/:channelId', (req, res) => {
        const { contentId, channelId } = req.params;

        createWindow(
            `http://localhost:10101/player/${contentId}/${channelId}`,
            false
        );
        console.log('Openning new player');
        res.send('OK');
    });

    await api.get('/openNewWindow/:contentId/:channelId/:x/:y', (req, res) => {
        const { contentId, channelId, x, y } = req.params;

        createWindow(
            `http://localhost:10101/player/${contentId}/${channelId}`,
            false,
            parseInt(x),
            parseInt(y)
        );
        console.log('Openning new player');
        res.send('OK');
    });

    await api.listen(10101, () => {
        console.log('Web server started');
    });
}

function createWindow(url: string, frame?: boolean, x?: number, y?: number) {
    if (frame === undefined) frame = true;

    let mainWindow;

    if (x === undefined || y === undefined) {
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 562,
            frame: frame,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                contextBridge: true,
            },
        });
    } else {
        mainWindow = new BrowserWindow({
            width: 1000,
            height: 562,
            x: x,
            y: y,
            frame: frame,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                contextBridge: true,
            },
        });
    }

    // and load the index.html of the app.
    mainWindow.loadURL(url);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    mainWindow.setAspectRatio(16 / 9);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
protocol.registerSchemesAsPrivileged([
    { scheme: 'http', privileges },
    { scheme: 'https', privileges },
    { scheme: 'wss', privileges },
    { scheme: 'mailto', privileges: { standard: true } },
]);

app.whenReady().then(async () => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
        {
            urls: [
                'https://licensing.bitmovin.com/*',
                'https://*.formula1.com/*',
            ],
        },
        (
            details: {
                url: string;
                requestHeaders: {
                    [x: string]: any;
                    referer: any;
                    Referer: any;
                };
            },
            callback: (arg0: { cancel?: boolean; requestHeaders?: any }) => void
        ) => {
            if (details.url.match(/^https:\/\/licensing\.bitmovin\.com/)) {
                console.log('Bitmovin Call - Blocking request');
                return callback({ cancel: true });
            }

            console.log('F1 Call - Editing headers...');
            const { referer, Referer, ...headers } = details.requestHeaders;

            const secFetchSite = details.url.startsWith(
                'https://f1tv.formula1.com'
            )
                ? 'same-origin'
                : 'same-site';

            callback({
                requestHeaders: {
                    ...headers,
                    referer: 'https://www.formula1.com/',
                    Origin: 'https://f1tv.formula1.com',
                    'Sec-Fetch-Site': secFetchSite,
                    // Cookie: [authCookie, Cookie, cookie]
                    //     .filter(Boolean)
                    //     .join('; '),
                },
            });
        }
    );

    // session.defaultSession.webRequest.onBeforeSendHeaders(
    //     { urls: ['https://*.formula1.com/*'] },
    //     (details, callback) => {
    //         console.log('f1 call');
    //         const { referer, Referer, ...headers } = details.requestHeaders;

    //         const secFetchSite = details.url.startsWith(
    //             'https://f1tv.formula1.com'
    //         )
    //             ? 'same-origin'
    //             : 'same-site';

    //         callback({
    //             requestHeaders: {
    //                 ...headers,
    //                 referer: 'https://www.formula1.com/',
    //                 Origin: 'https://f1tv.formula1.com',
    //                 'Sec-Fetch-Site': secFetchSite,
    //                 // Cookie: [authCookie, Cookie, cookie]
    //                 //     .filter(Boolean)
    //                 //     .join('; '),
    //             },
    //         });
    //     }
    // );

    await initAPI();
    await createWindow('http://localhost:10101/');

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow('http://localhost:10101/');
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
