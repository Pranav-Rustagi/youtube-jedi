#!/usr/bin/env node

const { parseArgv, ColorLog, checkForUpdate, showHelp } = require("./utilities");
const { displayVideoInfo, downloadVideo, displayPlaylistInfo, downloadPlaylist } = require("./download");

(async () => {
    try {
        process.stdout.write("\x1B[?25l");
        
        await checkForUpdate();

        const args = parseArgv();

        if (args.flags.help) {
            showHelp();
            return;
        }

        if (args.type === "video") {
            if (args.flags.info) {
                await displayVideoInfo(args.url);
            } else {
                await downloadVideo(args.url, args.flags);
                console.log();
            }
        } else if(args.type === "playlist") {
            if (args.flags.info) {
                await displayPlaylistInfo(args.url);
            } else {
                await downloadPlaylist(args.url, args.flags);
            }
        }
    } catch ({ message }) {
        switch (message) {
            case "INVALID_CMD": {
                console.log(`\n${ColorLog.error("Invalid command!!!")} 😫\n\nRun ${ColorLog.bold(" jedi --help ")} to know how to use youtube-jedi`);
                return;
            }
            case "RESOLUTION_NOT_SUPPORTED": {
                console.error(`\n${ColorLog.error("Resolution not supported!!!")} 😫\n\nChoose a valid resolution`);
                return;
            }
            case "ENOTFOUND": {
                console.error(`\n${ColorLog.error("Internet connection unavailable!!!")} 😫`);
                return;
            }
            case "INVALID_URL": {
                console.error(`\n${ColorLog.error("Invalid URL!!!")} 😫\n\nPlease try with a valid URL`);
                return;
            }
            case "DOWNLOAD_FAILED": {
                console.error(`\n${ColorLog.error("Download failed due to some reason!!!")} 😫\n\nPlease try again later`);
                return;
            }
            case "FILE_NOT_FOUND": {
                console.error(`\n${ColorLog.error("File not found!!!")} 😫`);
                return;
            }
            case "PLAYLIST_FETCH_FAILED": {
                console.error(`\n${ColorLog.error("Failed to fetch playlist data!!!")} 😫\n\nPlease try again later`);
                return;
            }
        }
    } finally {
        process.stdout.write("\n\x1B[?25h");
    }
})();