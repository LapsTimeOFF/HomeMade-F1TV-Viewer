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
    layouts: Array<Layout>;
}

export interface Layout {
    id: number;
    name: string;
    players: Array<Layout_Player>;
}

export interface Layout_Player {
    x: number;
    y: number;
    channelId: string;
    width: number;
}

export interface F1MV_DriverData {
    driverNumber: number;
    firstName: string;
    lastName: string;
    teamName: string;
    tla: string;
}

export interface F1MV_playbackData {
    currentTime: number;
    paused: boolean;
    startTimestamp: string;
    ts: number;
}

export interface F1MV_streamData {
    channelId: number;
    contentId: string;
    meetingKey: string;
    sessionKey: string;
    title: string;
    type: string;
}

export interface F1MV_meetings_sessions_details_player_syncs {
    diff: number;
    driverData: F1MV_DriverData;
    playbackData: F1MV_playbackData;
    streamData: F1MV_streamData;
}

export interface F1MV_Circuit {
    Key: number;
    ShortName: string;
}
export interface F1MV_Country {
    Code: string;
    Key: number;
    Name: string;
}

export interface F1MV_meeting_info {
    Circuit: F1MV_Circuit;
    Country: F1MV_Country;
    Key: number;
    Location: string;
    Name: string;
    OfficialName: string;
}

export interface F1MV_available_sync_offsets {
    country_code: string;
    meeting_key: string;
    session_key: string;
    session_type: string;
    sync_offsets: Array<F1MV_meetings_sessions_details_player_syncs>;
}

export interface F1MV_session_info {
    ArchiveStatus: {
        Status: string;
    };
    EndDate: string;
    GmtOffset: string;
    Key: number;
    Meeting: F1MV_meeting_info;
    Name: string;
    Path: string;
    StartDate: string;
    Type: string;
}

export interface F1MV_sync_offsets {
    country_code: string;
    meeting_key: string;
    session_key: string;
    session_type: string;
    sync_offsets: Array<F1MV_meetings_sessions_details_player_syncs>;
}
export interface F1MV_meetings_sessions_details {
    // 20221216103544
    // https://api.f1mv.com/api/v1/meetings/1138/sessions/7276
    available_sync_offsets: Array<F1MV_available_sync_offsets>;
    // TBC
    live_timing_availability_end: any;
    // TBC
    live_timing_availability_start: any;
    live_timing_available: boolean;
    live_timing_sync_offset: string;
    meeting_info: F1MV_meeting_info;
    session_info: F1MV_session_info;
    session_start: number;
    sync_offsets: F1MV_sync_offsets;
}
