import { IDownloadStrategy, blackCloverStrategy, onePieceStrategy } from "./IMangaStrategy";

const fs = require('node:fs');
const htmlparser = require('htmlparser');
const { mkdir } = require("fs/promises");
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

const fetchUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    return await response.text();
}
const downloadFile = (async (url, destination) => {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
    await finished(Readable.fromWeb(res.body).pipe(fileStream));
});

const chaptersDone = [];

const blackCloverDownloader = blackCloverStrategy();
const onePieceDownloader = onePieceStrategy();

const fetchAndParse = async (url: string, onDom: (dom) => string[]) => {
    let data = [];
    const content = await fetchUrl(url)
    fs.writeFile('text.html', content, () => { });

    let parsingFinished = false;
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            console.log(error);
        } else {
            data = onDom(dom);
            parsingFinished = true;
        }
    });

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(content);

    while (!parsingFinished) { }
    return data;
}

const main = async (strategy: IDownloadStrategy) => {
    const allChapterLinks = await fetchAndParse(strategy.baseLink, strategy.getChapterLinks);

    if (!fs.existsSync('downloads')) await mkdir('downloads');
    if (!fs.existsSync('downloads/' + strategy.baseFolder)) await mkdir('downloads/' + strategy.baseFolder);

    const basePath = 'downloads/' + strategy.baseFolder;

    for (const link of allChapterLinks) {
        if (chaptersDone.includes(link)) continue;

        const allImagesLinks = await fetchAndParse(link, strategy.getImageLinks);

        if (allImagesLinks.length === 0) console.warn(`WARN: 0 images foud for chapter ${link}`);

        const dirName = path.basename(link);
        if (!fs.existsSync(basePath + '/' + dirName)) await mkdir(basePath + '/' + dirName);
        for (const imageLink of allImagesLinks) {
            const imagePath = path.resolve(path.resolve(basePath, dirName), path.basename(imageLink));
            if (!fs.existsSync(imagePath)) {
                const destination = imagePath;
                await downloadFile(imageLink, destination);
            }
        }

        chaptersDone.push(link);
    }
}

main(onePieceDownloader);