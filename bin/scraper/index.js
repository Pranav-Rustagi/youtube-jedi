const puppeteer = require("puppeteer");

const getText = async (page, selector) => {
    await page.waitForSelector(selector);
    return await page.evaluate((selector) => {
        return document.querySelector(selector).innerText;
    }, selector);
}

const getUrl = async (page, selector) => {
    await page.waitForSelector(selector);
    return await page.evaluate((selector) => {
        return document.querySelector(selector).href;
    }, selector);
}

const scrapePlaylist = async (url) => {
    try {
        const playlistData = {};
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
        const page = (await browser.pages())[0];
        await page.goto(url);

        const titleSelector = "#text";
        playlistData.title = await getText(page, titleSelector);
        
        const channelNameSelector = "#owner-text > a";
        playlistData.channelName = await getText(page, channelNameSelector);
        playlistData.channelUrl = await getUrl(page, channelNameSelector);

        const videoCountSelector = ".metadata-stats.style-scope.ytd-playlist-byline-renderer yt-formatted-string:nth-child(2)";
        playlistData.videoCount = await getText(page, videoCountSelector);

        const viewCountSelector = ".metadata-stats.style-scope.ytd-playlist-byline-renderer yt-formatted-string:nth-child(4)";
        playlistData.viewCount = await getText(page, viewCountSelector);

        const lastUpdatedSelector = ".metadata-stats.style-scope.ytd-playlist-byline-renderer yt-formatted-string:nth-child(4)";
        playlistData.lastUpdated = await getText(page, lastUpdatedSelector);


        await browser.close();
        return playlistData;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = scrapePlaylist;