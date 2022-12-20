import path from 'path';
import express, { Request, Response } from 'express';

// Modules to control application life and create native browser window
const { app, BrowserWindow, session, protocol, ipcMain } = require('electron');

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
    // await api.get('/', (_: Request, res: Response) => {
    //     res.sendFile(`${__dirname}/panel`);
    // });

    await api.use(express.static(path.resolve(__dirname)));

    await api.get('/player/:contentId/static*', (req, res) => {
        const path = req.path.split('/');

        console.log(path);

        res.sendFile(`${__dirname}/static/${path[4]}/${path[5]}`);
    });
    await api.get('/player/:contentId/:channelId/static*', (req, res) => {
        console.log('A');
        const path = req.path.split('/');

        res.sendFile(`${__dirname}/static/${path[4]}/${path[5]}`);
    });

    /**
     * @deprecated
     */
    await api.get(
        '/openNewWindow/:contentId',
        (req: Request, res: Response) => {
            const { contentId } = req.params;

            createWindow(
                `http://localhost:${
                    process.env.RUN_ENV === 'dev' ? 3002 : 3001
                }/player/${contentId}`,
                false
            );
            console.log('Openning new player');
            res.send('OK');
        }
    );

    await api.get(
        '/openNewWindow/:contentId/:channelId',
        (req: Request, res: Response) => {
            const { contentId, channelId } = req.params;

            createWindow(
                `http://localhost:${
                    process.env.RUN_ENV === 'dev' ? 3002 : 3001
                }/player/${contentId}/${channelId}`,
                false
            );
            console.log('Openning new player');
            res.send('OK');
        }
    );

    await api.get(
        '/openNewWindow/:contentId/:channelId/:x/:y',
        (req: Request, res: Response) => {
            const { contentId, channelId, x, y } = req.params;

            createWindow(
                `http://localhost:${
                    process.env.RUN_ENV === 'dev' ? 3002 : 3001
                }/player/${contentId}/${channelId}`,
                false,
                parseInt(x),
                parseInt(y)
            );
            console.log('Openning new player');
            res.send('OK');
        }
    );

    await api.get(
        '/openNewWindow/:contentId/:channelId/:x/:y/:width',
        (req: Request, res: Response) => {
            const { contentId, channelId, x, y, width } = req.params;

            const height = parseInt(width) / (16 / 9);

            createWindow(
                `http://localhost:${
                    process.env.RUN_ENV === 'dev' ? 3002 : 3001
                }/player/${contentId}/${channelId}`,
                false,
                parseInt(x),
                parseInt(y),
                parseInt(width),
                height
            );
            console.log('Openning new player');
            res.send('OK');
        }
    );

    await api.get('*', (_: Request, res: Response) => {
        res.sendFile(`${__dirname}/index.html`);
    });

    await api.listen(3001, () => {
        console.log('Web server started');
    });
}

function createWindow(
    url: string,
    frame?: boolean,
    x?: number,
    y?: number,
    width?: number,
    height?: number
) {
    if (frame === undefined) frame = true;

    console.log(
        url,
        frame,
        x,
        y,
        width,
        Math.round(height === undefined ? 0 : height)
    );

    let mainWindow;

    if (x === undefined || y === undefined) {
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: width === undefined ? 1000 : width,
            height:
                height === undefined
                    ? 562
                    : Math.round(height === undefined ? 0 : height),
            frame: frame,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                contextBridge: true,
            },
            preload: `${__dirname}/preload.js`,
        });
    } else {
        mainWindow = new BrowserWindow({
            width: width === undefined ? 1000 : width,
            height:
                height === undefined
                    ? 562
                    : Math.round(height === undefined ? 0 : height),
            x: x,
            y: y,
            frame: frame,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                contextBridge: true,
            },
            preload: `${__dirname}/preload.js`,
        });
    }

    ipcMain.on('set-title', (event: { sender: any }, title: any) => {
        const webContents = event.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        win.setTitle(title);
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // mainWindow.setAspectRatio(16 / 9);
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

            if (
                details.url.match(/^https:\/\/(dev-)?livetiming.formula1.com\//)
            ) {
                console.log('F1 Live Timing Call - Editing headers...');
                const { referer, Referer, ...headers } = details.requestHeaders;

                const secFetchSite = details.url.startsWith(
                    'https://f1tv.formula1.com'
                )
                    ? 'same-origin'
                    : 'same-site';

                return callback({
                    requestHeaders: {
                        ...headers,
                        // 'user-agent':
                        //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                        referer: 'https://www.formula1.com/',
                        Origin: 'https://www.formula1.com',
                        'Sec-Fetch-Site': secFetchSite,
                        // Cookie: [authCookie, Cookie, cookie]
                        //     .filter(Boolean)
                        //     .join('; '),
                        Cookie: 'GCLB=CLLmiLaG7obCmwE',
                        'sec-ch-ua': '"Not;A=Brand";v="99", "Chromium";v="106"',
                    },
                });
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
                    'user-agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
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
    await createWindow(
        `http://localhost:${process.env.RUN_ENV === 'dev' ? 3002 : 3001}/panel`
    );

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow(
                `http://localhost:${
                    process.env.RUN_ENV === 'dev' ? 3002 : 3001
                }/`
            );
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', function () {
//     if (process.platform !== 'darwin') app.quit();
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
