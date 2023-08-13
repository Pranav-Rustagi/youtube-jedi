const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require('fluent-ffmpeg');
const { ColorLog, getFileName, getUserInput, getAvailableFormats, plotProgress } = require("../utilities");
const puppeteer = require("puppeteer");
const scrapePlaylist = require("../scraper");

ffmpeg.setFfmpegPath(ffmpegPath);

const fetchVideoInfo = async (url) => {
    try {
        process.env["YTDL_NO_UPDATE"] = true;
        const videoId = ytdl.getURLVideoID(url);
        if (ytdl.validateURL(url) && ytdl.validateID(videoId)) {
            const info = await ytdl.getInfo(url);
            return info;
        }
    } catch (err) {
        if (err.code === "ENOTFOUND") {
            throw new Error("ENOTFOUND");
        } else {
            // console.log(err);
            throw new Error("INVALID_URL");
        }
    }
}

const displayVideoInfo = async (url) => {
    const dataObj = await fetchVideoInfo(url);
    const data = dataObj.videoDetails;

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

const downloadVideo = async (url, options) => {
    const video_data = await fetchVideoInfo(url);
    const formats = video_data.formats;

    if (options.quality === undefined && options.audioonly === false) {
        const availableFormats = getAvailableFormats(formats);
        process.stdout.write("\x1B[?25h");
        options.quality = await getUserInput(`Please enter the video quality ${ColorLog.bold("( " + availableFormats.join(" | ") + " )", true)}: \x1B[?25`);
        process.stdout.write("\x1B[?25l");

        if (availableFormats.includes(options.quality) === false) {
            throw new Error("RESOLUTION_NOT_SUPPORTED");
        }
    }

    const title = getFileName(video_data.videoDetails.title);

    console.info(`\n${ColorLog.bold(`Downloading "${video_data.videoDetails.title}"`)}\n`);

    if (options.audioonly) {
        const audioOnlyFormat = ytdl.chooseFormat(formats, {
            quality: "highest",
            filter: "audioonly"
        });

        if (audioOnlyFormat === undefined) {
            throw new Error("FILE_NOT_FOUND");
        }

        const filename = `${title}.${audioOnlyFormat.container}`;

        const toConvert = audioOnlyFormat.container !== "mp3";

        await new Promise((resolve, reject) => {
            const audioStream = ytdl(url, { format: audioOnlyFormat }).on("error", (err) => {
                fs.unlinkSync(filename);
                reject(err);
                throw new Error("DOWNLOAD_FAILED");
            }).on("progress", (_, downloaded, total) => {
                plotProgress(downloaded / total * 100);
            }).on("end", () => {
                resolve(audioStream);
            }).pipe(fs.createWriteStream(filename));
        });

        if (toConvert) {
            process.stdout.write("\n\nProcessing...");

            await new Promise((resolve, reject) => {
                let dots = "";
                const command = ffmpeg()
                    .input(filename)
                    .noVideo()
                    .toFormat("mp3")
                    .save(`${title}.mp3`)
                    .on("error", (err) => {
                        fs.unlinkSync(filename);
                        reject(err);
                        throw new Error("DOWNLOAD_FAILED");
                    }).on("progress", () => {
                        if (dots.length === 5) dots = "";
                        process.stdout.write("\r\x1B[?25l");
                        process.stdout.write("Processing" + dots);
                        dots += ".";
                    }).on("end", () => {
                        process.stdout.write("\r\x1B[?25l");
                        process.stdout.write("Cleaning up...");
                        fs.unlinkSync(filename);
                        process.stdout.write("\r\x1B[?25l");
                        process.stdout.write("Download complete!!!");
                        resolve(command);
                    });
            });
        }
        return;
    }

    const audioVideoFormat = formats.find((format) => {
        return format.hasVideo && format.hasAudio && format.qualityLabel === options.quality && format.container === "mp4";
    });

    if (audioVideoFormat !== undefined) {
        await new Promise((resolve, reject) => {
            const stream = ytdl(url, { format: audioVideoFormat })
                .on("error", (err) => {
                    console.error(`\n${ColorLog.error("Error downloading video!!!", true)} 😫\n`);
                    fs.unlinkSync(`${title}.mp4`);
                    reject(err);
                }).on("progress", (_, downloaded, total) => {
                    plotProgress(downloaded / total * 100);

                }).on("end", () => {
                    console.log("\n\nDownload complete!!!");
                    resolve(stream);
                }).pipe(fs.createWriteStream(`${title}.mp4`));;
        });
        return;
    }


    const videoOnlyFormat = formats.find((format) => {
        return format.hasVideo && format.hasAudio === false && format.qualityLabel === options.quality;
    });

    const audioOnlyFormat = ytdl.chooseFormat(formats, {
        quality: "highestaudio",
        filter: "audioonly"
    });

    if (videoOnlyFormat === undefined || audioOnlyFormat === undefined) {
        throw new Error("RESOLUTION_NOT_SUPPORTED");
    }

    const file_id = getFileName(video_data.videoDetails.videoId);

    const videoOnlyFile = `jedi_vid_${file_id}.${videoOnlyFormat.container}`;
    const audioOnlyFile = `jedi_aud_${file_id}.${audioOnlyFormat.container}`;

    await new Promise((resolve, reject) => {
        const videoStream = ytdl(url, { format: videoOnlyFormat })
            .on("error", (err) => {
                fs.unlinkSync(videoOnlyFile);
                reject(err);
                throw new Error("DOWNLOAD_FAILED");
            }).on("progress", (_, downloaded, total) => {
                plotProgress(downloaded / total * 50);
            }).on("end", () => {
                resolve(videoStream);
            }).pipe(fs.createWriteStream(videoOnlyFile));
    });

    await new Promise((resolve, reject) => {
        const audioStream = ytdl(url, { format: audioOnlyFormat }).on("error", (err) => {
            fs.unlinkSync(audioOnlyFile);
            console.log(err);
            reject(err);
            throw new Error("DOWNLOAD_FAILED");
        }).on("progress", (_, downloaded, total) => {
            plotProgress(50 + (downloaded / total * 50));
        }).on("end", () => {
            resolve(audioStream);
        }).pipe(fs.createWriteStream(audioOnlyFile));;
    });

    process.stdout.write("\n\nProcessing...");

    await new Promise((resolve, reject) => {
        let dots = ""
        const command = ffmpeg()
            .input(videoOnlyFile)
            .input(audioOnlyFile)
            .outputOptions(["-c:v libx264", "-c:a aac", "-map 0:v:0", "-map 1:a:0"])
            .format("mp4")
            .save(`${title}.mp4`)
            .on("error", (err) => {
                fs.unlinkSync(videoOnlyFile);
                fs.unlinkSync(audioOnlyFile);
                console.log(err);
                reject(err);
                throw new Error("DOWNLOAD_FAILED");
            }).on("progress", () => {
                if (dots.length === 5) dots = "";
                process.stdout.write("\r\x1B[?25l");
                process.stdout.write("Processing" + dots);
                dots += ".";
            }).on("end", () => {
                process.stdout.write("\r\x1B[?25l");
                process.stdout.write("Cleaning up...");
                fs.unlinkSync(videoOnlyFile);
                fs.unlinkSync(audioOnlyFile);
                process.stdout.write("\r\x1B[?25l");
                process.stdout.write("Download complete!!!");
                resolve(command);
            })
    });
}

const displayPlaylistInfo = async (url) => {
    const data = await scrapePlaylist(url);
    
    console.info(`\n${ColorLog.label(" Title ")}\n${data.title}`);
    console.info(`\n${ColorLog.label(" Channel Name ")}\n${data.channelName}`);
    console.info(`\n${ColorLog.label(" Channel Link ")}\n${data.channelUrl}`);
    console.info(`\n${ColorLog.label(" Video Count ")}\n${data.videoCount}`);
    console.info(`\n${ColorLog.label(" Views ")}\n${data.viewCount}`);
    console.info(`\n${ColorLog.label(" Last Updated ")}\n${data.lastUpdated}`);

    console.info(`\n${ColorLog.label(" Videos ")}\n`);

    console.info(`${ColorLog.bold("│‾" + '‾'.repeat(5) + "‾│‾" + '‾'.repeat(100) + "‾│‾" + '‾'.repeat(15) + "‾│‾" + '‾'.repeat(15) + "‾│")}`);
    console.info(`${ColorLog.bold("│ " + "S.No.".padStart(5) + " │ " + "Title".padEnd(100) + " │ " + "Views".padStart(15) + " │ " + "Uploaded".padStart(15) + " │")}`);
    console.info(`${ColorLog.bold("│_" + '_'.repeat(5) + "_│_" + '_'.repeat(100) + "_│_" + '_'.repeat(15) + "_│_" + '_'.repeat(15) + "_│")}`);


    let ind = 1;
    for (const video of data.videos) {
        let { title, viewCount, uploaded } = video;
        if (title.length > 100) title = title.substring(0, 95) + "...";

        console.info(`${ColorLog.bold("│ " + '\u00A0'.repeat(5) + " │ " + '\u00A0'.repeat(100) + " │ " + '\u00A0'.repeat(15) + " │ " + '\u00A0'.repeat(15) + " │")}`);
        console.info(`${ColorLog.bold("│ " + ind.toString().padStart(5) + " │ " + title.padEnd(100) + " │ " + viewCount.padStart(15) + " │ " + uploaded.padStart(15) + " │")}`);

        ind++;
    }
    console.info(`${ColorLog.bold("│_" + '_'.repeat(5) + "_│_" + '_'.repeat(100) + "_│_" + '_'.repeat(15) + "_│_" + '_'.repeat(15) + "_│")}`);
}

const downloadPlaylist = async (url, options) => {
    console.info("Feature coming soon...");
}


module.exports = {
    displayVideoInfo,
    downloadVideo,
    displayPlaylistInfo,
    downloadPlaylist
};