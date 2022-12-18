"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
// Modules to control application life and create native browser window
const { app, BrowserWindow, session, protocol } = require('electron');
const api = (0, express_1.default)();
const privileges = {
    standard: true,
    bypassCSP: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: false,
    stream: true,
};
function initAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        // await api.get('/', (_: Request, res: Response) => {
        //     res.sendFile(`${__dirname}/panel`);
        // });
        yield api.use(express_1.default.static(path_1.default.resolve(__dirname)));
        yield api.get('/panel/', (_, res) => {
            res.sendFile(`${__dirname}/index.html`);
        });
        yield api.get('/player/:contentId', (_, res) => {
            res.sendFile(`${__dirname}/index.html`);
        });
        yield api.get('/player/:contentId/:channelId', (_, res) => {
            res.sendFile(`${__dirname}/index.html`);
        });
        yield api.get('/player/:contentId/static*', (req, res) => {
            const path = req.path.split('/');
            console.log(path);
            res.sendFile(`${__dirname}/static/${path[4]}/${path[5]}`);
        });
        yield api.get('/player/:contentId/:channelId/static*', (req, res) => {
            console.log('A');
            const path = req.path.split('/');
            res.sendFile(`${__dirname}/static/${path[4]}/${path[5]}`);
        });
        /**
         * @deprecated
         */
        yield api.get('/openNewWindow/:contentId', (req, res) => {
            const { contentId } = req.params;
            createWindow(`http://localhost:10101/player/${contentId}`, false);
            console.log('Openning new player');
            res.send('OK');
        });
        yield api.get('/openNewWindow/:contentId/:channelId', (req, res) => {
            const { contentId, channelId } = req.params;
            createWindow(`http://localhost:10101/player/${contentId}/${channelId}`, false);
            console.log('Openning new player');
            res.send('OK');
        });
        yield api.get('/openNewWindow/:contentId/:channelId/:x/:y', (req, res) => {
            const { contentId, channelId, x, y } = req.params;
            createWindow(`http://localhost:10101/player/${contentId}/${channelId}`, false, parseInt(x), parseInt(y));
            console.log('Openning new player');
            res.send('OK');
        });
        yield api.get('/openNewWindow/:contentId/:channelId/:x/:y/:width', (req, res) => {
            const { contentId, channelId, x, y, width } = req.params;
            const height = parseInt(width) / (16 / 9);
            createWindow(`http://localhost:10101/player/${contentId}/${channelId}`, false, parseInt(x), parseInt(y), parseInt(width), height);
            console.log('Openning new player');
            res.send('OK');
        });
        yield api.listen(10101, () => {
            console.log('Web server started');
        });
    });
}
function createWindow(url, frame, x, y, width, height) {
    if (frame === undefined)
        frame = true;
    console.log(url, frame, x, y, width, Math.round(height === undefined ? 0 : height));
    let mainWindow;
    if (x === undefined || y === undefined) {
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: width === undefined ? 1000 : width,
            height: height === undefined
                ? 562
                : Math.round(height === undefined ? 0 : height),
            frame: frame,
            webPreferences: {
                webSecurity: false,
                nodeIntegration: true,
                contextIsolation: false,
                contextBridge: true,
            },
        });
    }
    else {
        mainWindow = new BrowserWindow({
            width: width === undefined ? 1000 : width,
            height: height === undefined
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
app.whenReady().then(() => __awaiter(void 0, void 0, void 0, function* () {
    session.defaultSession.webRequest.onBeforeSendHeaders({
        urls: [
            'https://licensing.bitmovin.com/*',
            'https://*.formula1.com/*',
        ],
    }, (details, callback) => {
        if (details.url.match(/^https:\/\/licensing\.bitmovin\.com/)) {
            console.log('Bitmovin Call - Blocking request');
            return callback({ cancel: true });
        }
        console.log('F1 Call - Editing headers...');
        const _a = details.requestHeaders, { referer, Referer } = _a, headers = __rest(_a, ["referer", "Referer"]);
        const secFetchSite = details.url.startsWith('https://f1tv.formula1.com')
            ? 'same-origin'
            : 'same-site';
        callback({
            requestHeaders: Object.assign(Object.assign({}, headers), { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', referer: 'https://www.formula1.com/', Origin: 'https://f1tv.formula1.com', 'Sec-Fetch-Site': secFetchSite }),
        });
    });
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
    yield initAPI();
    yield createWindow('http://localhost:10101/panel');
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow('http://localhost:10101/');
    });
}));
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
//# sourceMappingURL=electron.js.map