const chalk = require("chalk");
const ytdl = require("ytdl-core")


const fetchVideoInfo = async (url) => {
    const videoId = ytdl.getURLVideoID(url);
    if(ytdl.validateURL(url) && ytdl.validateID(videoId)) {
        const info = await ytdl.getInfo(url);
        return info.videoDetails;
    }
    return null;
}

const displayVideoInfo = async (url) => {
    const data = await fetchVideoInfo(url);

    if(data === null) {
        console.error(`\n${chalk.bold.redBright("Invalid URL!!!")} 😫\n\nPlease try with a valid URL\n`);
        return;
    }
    
    console.info(`\n${chalk.bold.bgBlueBright("Title:")}\n${data.title}`);
    console.info(`\n${chalk.bold.bgBlueBright("Description:")}\n${data.description}`);
    console.info(`\n${chalk.bold.bgBlueBright("Category:")}\n${data.category}`);
    console.info(`\n${chalk.bold.bgBlueBright("Channel name:")}\n${data.author.name}`);
    console.info(`\n${chalk.bold.bgBlueBright("Channel link:")}\n${data.author.channel_url}`);
    console.info(`\n${chalk.bold.bgBlueBright("Upload date:")}\n${data.uploadDate}`);
    console.info(`\n${chalk.bold.bgBlueBright("Length:")}\n${data.lengthSeconds} seconds`);

    if (data.likes !== null && data.dislikes !== null) {
        console.info(`\n${chalk.bold.bgBlueBright("Likes:")}\n${data.likes}`);
        console.info(`\n${chalk.bold.bgBlueBright("Dislikes:")}\n${data.dislikes}`);
    }

    console.info(`\n${chalk.bold.bgBlueBright("Views:")}\n${data.viewCount}\n`);
}

const downloadVideo = async (url, options, playlist_data) => {
    let data;
    if(playlist_data === undefined) {
        data = await fetchVideoInfo(url);

        if(data === null) {
            console.error(`\n${chalk.bold.redBright("Invalid URL!!!")} 😫\n\nPlease try with a valid URL\n`);
            return;
        }
    }

    const fileName = getFileName(data.title, data.videoId);
    
    console.info("\n\n" + chalk.bold.whiteBright(`Downloading "${data.title}"`) + "\n");

    await new Promise((resolve) => {
        const stream = ytdl(url, { quality: 'highest', filter: 'audioandvideo' }).on("error", () => {
            console.error(`\n${chalk.bold.redBright("Error downloading video!!!")} 😫\n`);
        }).on("progress", (_, downloaded, total) => {
            const progress = (downloaded / total * 100).toFixed(2);

            const done = Math.round(progress);
            const notdone = 100 - done;

            process.stdout.write("\r");
            process.stdout.write(chalk.bgGreenBright(" ".repeat(done)));
            process.stdout.write(chalk.bold.bgGrey("▓".repeat(notdone)));

        }).on("end", () => {
            console.log("\n\nDownload complete!!!");
            resolve(stream);
        }).pipe(fs.createWriteStream(`${fileName}.mp4`));
    });
}


module.exports = {
    displayVideoInfo
};