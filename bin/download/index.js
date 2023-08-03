const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require('fluent-ffmpeg');
const { ColorLog, getFileName, getUserInput, getAvailableFormats } = require("../utilities");

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

        if(audioOnlyFormat === undefined) {
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
                const progress = (downloaded / total * 100).toFixed(2);

                const done = Math.round(progress);
                const notdone = 100 - done;

                process.stdout.write("\r\x1B[?25l");
                process.stdout.write(ColorLog.label(" ".repeat(done)));
                process.stdout.write(ColorLog.bgGray("▒".repeat(notdone)));
                process.stdout.write(ColorLog.bold(` ${progress}% `));
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
                const progress = (downloaded / total * 50).toFixed(2);

                const done = Math.round(progress);
                const notdone = 100 - done;

                process.stdout.write("\r\x1B[?25l");
                process.stdout.write(ColorLog.label(" ".repeat(done)));
                process.stdout.write(ColorLog.bgGray("▒".repeat(notdone)));
                process.stdout.write(ColorLog.bold(` ${progress}% `));
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
            const progress = (50 + (downloaded / total * 50)).toFixed(2);

            const done = Math.round(progress);
            const notdone = 100 - done;

            process.stdout.write("\r\x1B[?25l");
            process.stdout.write(ColorLog.label(" ".repeat(done)));
            process.stdout.write(ColorLog.bgGray("▒".repeat(notdone)));
            process.stdout.write(ColorLog.bold(` ${progress}% `));
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


module.exports = {
    displayVideoInfo,
    downloadVideo
};