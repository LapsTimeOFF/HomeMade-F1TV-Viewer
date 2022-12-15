export interface F1TV_API_PlaybackResponse {
    resultCode: string;
    message: string;
    errorDescription: string;
    resultObj: ContentStream;
    systemTime: number;
}

export interface ContentStream {
    entitlementToken: string;
    url: string;
    streamType: 'DASHWV' | 'HLSFP' | 'DASH';
    drmType: 'widevine' | 'fairplay';
    drmToken?: string;
    laURL: string;
    certUrl?: string;
    channelId: number;
}

export interface F1TV_getStreamURL {
    url: string;
    streamType: string;
    title: string;
    stream?: string;
    driver?: [string, number, string];
}

export interface Layout_File {
    version: number;
    layouts: [Layout];
}

export interface Layout {
    id: number;
    name: string;
    players: [Layout_Player];
}

export interface Layout_Player {
    x: number;
    y: number;
    channelId: string;
    width: number;
}
