"use strict";

const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const Log = require('../Log');
const Stdio = require('../Stdio');
const Error = require('../Error');
const { version: localVersion } = require('./../../package.json');
const Scraper = require('../Scraper');
const { secondsToTimeStr, formattedDate } = require('../helpers');

class Jedi {
    #type;
    #params;

    constructor(type = "help", params = {}) {
        this.#type = type;
        this.#params = { ...params };
    }

    // Validates provided command, and returns jedi object initialized accordingly 
    static async emerge() {
        const args = process.argv.slice(2);
        const availableCommands = ["help", "version", "update", "info", "download"];

        if (args.length === 0) {
            return new Jedi();
        } else if (!availableCommands.includes(args[0])) {
            throw new Error("INVALID_CMD", "QUERY_NOT_EXIST", "The query passed does not exist");
        }


        if (["help", "version", "update"].includes(args[0])) {
            if (args.length > 1) {
                throw new Error("INVALID_CMD", "ARG_COUNT_MORE", "Too many arguments were passed");
            } else {
                return new Jedi(args[0]);
            }
        }

        if (args.length < 2) {
            throw new Error("INVALID_CMD", "ARG_COUNT_LESS", "Too few arguments were passed");
        }

        const query_params = {};

        const url = args[1];
        const yt_video_regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
        const yt_playlist_regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/playlist\?list=|youtu\.be\/)([a-zA-Z0-9_-]+)(?:&\S*)?$/;

        if (yt_video_regex.test(url) || yt_playlist_regex.test(url)) {
            query_params.url = url;
            query_params.type = yt_video_regex.test(url) ? "video" : "playlist";
        } else {
            throw new Error("INVALID_CMD", "INVALID_URL", "The URL passed is not a valid  URL");
        }

        if (args[0] === "info") {
            if (args.length > 2) {
                throw new Error("INVALID_CMD", "ARG_COUNT_MORE", "Too many arguments were passed");
            } else {
                return new Jedi(args[0], query_params);
            }
        }

        for (let i = 2; i < args.length; i++) {
            const [option_name, option_val] = args[i].split("=");

            if (option_name === "audioonly") {
                if (option_val === undefined || option_val === "true" || option_val === "false") {
                    query_params.audioonly = option_val || true;
                } else {
                    throw new Error("INVALID_CMD", "INVALID_PARAM", "The value passed for the option is invalid");
                }
            } else if (option_name === "quality" || option_name === "format") {
                if (option_val === undefined) {
                    throw new Error("INVALID_PARAM", "NO_VALUE", "No value was passed for the option");
                } else {
                    query_params[option_name] = option_val;
                }
            } else {
                throw new Error("INVALID_OPTION", null, "The option passed is invalid");
            }
        }

        return new Jedi(query_type, query_params);
    }


    // Fetches latest version available on NPM
    async #getLatestVersion () {
        try {
            const res = await fetch("https://registry.npmjs.com/youtube-jedi/latest");
            const data = await res.json();
            return data.version;
        } catch (err) {
            return null;
        }
    }


    // Performs check whether jedi version on local system is up to date with the latest version available on NPM
    // Displays update message if not found up to date
    async #checkForUpdate() {
        try {
            const userHomeDir = os.homedir();
            const timeStampFile = path.join(userHomeDir, ".youtube-jedi");
            const lastTimeStamp = Stdio.readFromFile(timeStampFile, parseInt) ?? 0;
            const currentTime = Date.now();
            
            if (currentTime - lastTimeStamp > 86400000) {
                const latestVersion = await this.#getLatestVersion();

                Stdio.writeToFile(timeStampFile, currentTime.toString());

                if (latestVersion !== null && latestVersion !== localVersion) {
                    Stdio.print(`\n${Log.style(`A new version of youtube-jedi is available: v${latestVersion}`, "WRN")}\n\nRun  ${Log.style("jedi update", "PRM", "BLD")}  command to update to the latest version\n\n`);
                }
            }
        } catch (err) {
            console.log(err)
            throw new Error("UPDATE_CHECK_FAILED", null, "Something went wrong");
        }
    }


    // Displays the variety of executible commands available along with description of each
    #displayHelp() {

        const helpText = `
${Log.style("Usage:", "BLD", "WRN")} 
    
    jedi <command> [options] <url>

${Log.style("Commands:", "BLD", "WRN")}

    help            Displays all the commands and options available
    version         Displays version of youtube-jedi present in your system
    update          Updates youtube-jedi to the latest version
    info            Displays information about the video/playlist
    download        Downloads the audio/video/playlist

${Log.style("Options:", "BLD", "WRN")}

    audio           Download audio only
    quality         Download video of specified quality
    format          Download video in specified format

    `;
        Stdio.print(helpText);
    }


    // Displays version of youtube-jedi available on system locally 
    #displayVersion() {
        Stdio.print(`\n${Log.style("youtube-jedi", "BLD")} ${Log.style(`v${localVersion}`, "PRM", "BLD")}\n\n`);
    }


    // Updates youtube-jedi to the latest version available on NPM
    async #updateJedi() {
        try {
            Stdio.print("\nUpdating youtube-jedi...\n\n");
            await new Promise((resolve, reject) => {
                const updateProcess = spawn("npm i -g youtube-jedi", { shell: true, stdio: "inherit" });

                updateProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });

            Stdio.print("\nSuccessfully updated youtube-jedi\n\n");

        } catch (err) {
            Stdio.print("\nFailed to update youtube-jedi\n\n");
        }
    }


    // Displays information about the video/playlist URL of which is provided
    async #displayInfo () {
        const scraper = new Scraper(this.#params.type, this.#params.url);
        const data = await scraper.fetchMediaInfo()

        if (this.#params.type === "video") {

            let video_details = `
${Log.style("Title: ", "BLD", "PRM")} 
${data.title}\n
${Log.style("Description: ", "BLD", "PRM")}
${data.description}\n
${Log.style("Category: ", "BLD", "PRM")}
${data.category}\n
${Log.style("Channel name: ", "BLD", "PRM")}
${data.author.name}\n
${Log.style("Channel link: ", "BLD", "PRM")}
${data.author.channel_url}\n
${Log.style("Upload date: ", "BLD", "PRM")}
${formattedDate(data.uploadDate)}\n
${Log.style("Length: ", "BLD", "PRM")}
${secondsToTimeStr(data.lengthSeconds)}\n
`;

            if (data.likes !== null) {
                video_details += `${Log.style("Likes: ", "BLD", "PRM")}
${data.likes} likes\n\n`;

                if(data.dislikes !== null) {
                    video_details += `${Log.style("Dislikes: ", "BLD", "PRM")}${data.dislikes} dislikes\n\n`;
                }
            }

            video_details += `${Log.style("Views: ", "BLD", "PRM")}
${data.viewCount}\n\n`;
            
            Stdio.print(video_details);

        } else if (this.#params.type === "playlist") {
            // const playlistInfo = await scraper_obj.getPlaylistInfo();
            // Stdio.print(playlistInfo);
        }
    }


    async execute() {
        await this.#checkForUpdate();

        switch (this.#type) {
            case "help":
                this.#displayHelp();
                break;
            case "version":
                this.#displayVersion();
                break;
            case "update":
                await this.#updateJedi();
                break;
            case "info":
                await this.#displayInfo();
                break;
            // case "download":
            //     this.#download();
            //     break;
        }
    }
}

module.exports = Jedi;