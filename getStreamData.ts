import { baseURL } from './variables';
// @ts-ignore
const fetch = (...args: any) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export async function getStreamDataURL(format: string, contentId: number | string) {
    const url = new URL(`${baseURL}/3.0/R/FRA/${format}/ALL/CONTENT/VIDEO/${contentId}/F1_TV_Pro_Annual/1`);
    const searchParams = new URLSearchParams();
    searchParams.set('contentId', contentId.toString(10));
    url.search = searchParams.toString();

    return url.toString();
}

export async function getStreamData(format: string, contentId: number | string) {
    const response = await fetch(await getStreamDataURL(format, contentId));
    const data = await response.json();

    return data;
}