const fs = require("fs");
const ytdl = require("ytdl-core");
const { ColorLog, getFileName } = require("../utilities");


const fetchVideoInfo = async (url) => {
    try {
        const videoId = ytdl.getURLVideoID(url);
        if (ytdl.validateURL(url) && ytdl.validateID(videoId)) {
            const info = await ytdl.getInfo(url);
            return info.videoDetails;
        }
    } catch (err) {
        if (err.code === "ENOTFOUND") {
            throw new Error("ENOTFOUND");
        } else {
            throw new Error("INVALID_URL");
        }
    }
}

const displayVideoInfo = async (url) => {
    const data = await fetchVideoInfo(url);

    console.info(`\n${ColorLog.label(" Title ")}\n${data.title}`);
    console.info(`\n${ColorLog.label(" Description ")}\n${data.description}`);
    console.info(`\n${ColorLog.label(" Category ")}\n${data.category}`);
    console.info(`\n${ColorLog.label(" Channel name ")}\n${data.author.name}`);
    console.info(`\n${ColorLog.label(" Channel link ")}\n${data.author.channel_url}`);
    console.info(`\n${ColorLog.label(" Upload date ")}\n${data.uploadDate}`);
    console.info(`\n${ColorLog.label(" Length ")}\n${data.lengthSeconds} seconds`);

    if (data.likes !== null && data.dislikes !== null) {
        console.info(`\n${ColorLog.label(" Likes ")}\n${data.likes}`);
        console.info(`\n${ColorLog.label(" Dislikes ")}\n${data.dislikes}`);
    }

    console.info(`\n${ColorLog.label(" Views ")}\n${data.viewCount}\n`);
}

const downloadVideo = async (url, options, video_data) => {
    if (video_data === undefined) {
        video_data = await fetchVideoInfo(url);
    }
    
    const title = getFileName(video_data.title);

    console.info(`\n${ColorLog.bold(`Downloading "${video_data.title}"`)}\n`);

    await new Promise((resolve) => {
        const stream = ytdl(url, {
            quality: 'highest', filter: 'audioandvideo'
        }).on("error", () => {
            console.error(`\n${ColorLog.error("Error downloading video!!!", true)} 😫\n`);
        }).on("progress", (_, downloaded, total) => {
            const progress = (downloaded / total * 100).toFixed(2);

            const done = Math.round(progress);
            const notdone = 100 - done;

            process.stdout.write("\r\x1B[?25l");

            process.stdout.write(ColorLog.label(" ".repeat(done)));
            process.stdout.write(ColorLog.bgGray("▒".repeat(notdone)));
            process.stdout.write(ColorLog.bold(` ${progress}% `));

        }).on("end", () => {
            console.log("\n\nDownload complete!!!");
            resolve(stream);
        }).pipe(fs.createWriteStream(`${title}.mp4`));
    });
}


module.exports = {
    displayVideoInfo,
    downloadVideo
};