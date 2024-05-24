const select = require('soupselect').select;

export interface IDownloadStrategy {
    baseLink: string;
    baseFolder: string;
    getChapterLinks: (dom) => string[];
    getImageLinks: (dom) => string[];
}

const getHrefBySelector = (dom, selector): string[] => select(dom, selector).map((element) => element.attribs.href);
const getImagesSrc = (dom, filterQuery): string[] => select(dom, 'img').filter(filterQuery).map(element => element.attribs.src);
const hasSrcThatStartsWith = (filters: string[]) => (element): boolean => element.attribs.src && filters.some(f => element.attribs.src.startsWith(f))
const commonCdns = ['https://cdn.hxmanga.com/file', 'https://www.mangaread.org/wp-content/', 'https://i.ibb.co/'];

export const blackCloverStrategy = (): IDownloadStrategy => {
    const baseLink = 'http://bcmanga.org/manga/black-clover-chapter-195';
    const cdnBase = [...commonCdns];
    const baseFolder = 'Black Clover';

    const getChapterLinks = (dom) => getHrefBySelector(dom, 'li .su-post a');
    const getImageLinks = (dom) => getImagesSrc(dom, hasSrcThatStartsWith(cdnBase));

    return {
        baseLink, baseFolder,
        getChapterLinks, getImageLinks
    };
}

export const onePieceStrategy = (): IDownloadStrategy => {
    const baseLink = 'https://w13.read-onepiece-manga.com/';
    const cdnBase = ['https://cdn.onepiecechapters.com/', ...commonCdns];
    const baseFolder = 'One Piece';

    const getChapterLinks = (dom) => getHrefBySelector(dom, '#ceo_latest_comics_widget-3 li a');
    const getImageLinks = (dom) => getImagesSrc(dom, hasSrcThatStartsWith(cdnBase));

    return {
        baseLink, baseFolder,
        getChapterLinks, getImageLinks
    };
}