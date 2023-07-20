const ytdl = require("ytdl-core")


const fetchVideoInfo = async (url) => {
    const videoId = ytdl.getURLVideoID(url);
    if(ytdl.validateURL(url) && ytdl.validateID(videoId)) {
        const info = await ytdl.getInfo(url);
        return info.videoDetails || null;
    }
    return null;
}

const displayVideoInfo = async (url) => {
    const data = await fetchVideoInfo(url);
    
    console.info(`\n${chalk.bold.magentaBright("Title:")}\n${data.title}`);
    console.info(`\n${chalk.bold.magentaBright("Description:")}\n${data.description}`);
    console.info(`\n${chalk.bold.magentaBright("Category:")}\n${data.category}`);
    console.info(`\n${chalk.bold.magentaBright("Channel name:")}\n${data.author.name}`);
    console.info(`\n${chalk.bold.magentaBright("Channel link:")}\n${data.author.channel_url}`);
    console.info(`\n${chalk.bold.magentaBright("Upload date:")}\n${data.uploadDate}`);
    console.info(`\n${chalk.bold.magentaBright("Length:")}\n${data.lengthSeconds} seconds`);

    if (data.likes !== null && data.dislikes !== null) {
        console.info(`\n${chalk.bold.magentaBright("Likes:")}\n${data.likes}`);
        console.info(`\n${chalk.bold.magentaBright("Dislikes:")}\n${data.dislikes}`);
    }

    console.info(`\n${chalk.bold.magentaBright("Views:")}\n${data.viewCount}\n`);
}

const downloadVideo = async (url, index) => {
    
}


module.exports = {
    displayVideoInfo
};