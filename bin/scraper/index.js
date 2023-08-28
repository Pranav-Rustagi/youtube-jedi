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
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.goto(url);

        const titleSelector = "#text";
        const channelNameSelector = "#owner-text > a";
        const metaSelector = ".metadata-stats.style-scope.ytd-playlist-byline-renderer yt-formatted-string";
        const videoCountSelector = `${metaSelector}:nth-child(2) span:first-child`;
        const viewCountSelector = `${metaSelector}:nth-child(4)`;
        const lastUpdatedSelector = `${metaSelector}:nth-child(6) span:last-child`;

        const playlistData = {};
        playlistData.title = await getText(page, titleSelector);
        playlistData.channelName = await getText(page, channelNameSelector);
        playlistData.channelUrl = await getUrl(page, channelNameSelector);
        playlistData.videoCount = await getText(page, videoCountSelector);
        playlistData.viewCount = await getText(page, viewCountSelector);
        playlistData.lastUpdated = await getText(page, lastUpdatedSelector);

        playlistData.videos = [];
        for (let i = 1; i <= +playlistData.videoCount; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });

            const videoBlockSelector = `ytd-playlist-video-renderer:nth-child(${i})`;
            const videoTitleSelector = `${videoBlockSelector} #video-title`;
            const videoViewSelector = `${videoBlockSelector} #video-info > span:nth-child(1)`;
            const videoAddedTimeSelector = `${videoBlockSelector} #video-info > span:nth-child(3)`;

            const videoData = { SNo: i };
            videoData.title = await getText(page, videoTitleSelector);
            videoData.url = await getUrl(page, videoTitleSelector);
            videoData.viewCount = await getText(page, videoViewSelector);
            videoData.uploaded = await getText(page, videoAddedTimeSelector);

            playlistData.videos.push(videoData);
        }

        await browser.close();
        return playlistData;
    } catch (err) {
        throw new Error("PLAYLIST_FETCH_FAILED");
    }
}

module.exports = scrapePlaylist;