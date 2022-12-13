export interface F1TV_API_PlaybackResponse {
    resultCode: string,
    message: string | number,
    errorDescription: string,
    resultObj: {
        entitlementToken: string,
        url: string,
        streamType: string,
        channelId: number
    },
    systemTime: number
}