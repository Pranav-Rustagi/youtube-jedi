"use strict";

const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const Log = require('../Log');
const Stdio = require('../Stdio');
const Error = require('../Error');
const { getLatestVersion } = require('../helpers');
const { version: localVersion } = require('./../../package.json');

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
        const yt_video_regex = /^https:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11}).*$/;
        const yt_playlist_regex = /^https:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)(?:playlist\?|.*?[?&]list=)([a-zA-Z0-9_-]{34}).*$/;

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


    // Performs check whether jedi version on local system is up to date with the latest version available on NPM
    // Displays update message if not found up to date
    async #checkForUpdate() {
        try {
            const userHomeDir = os.homedir();
            const timeStampFile = path.join(userHomeDir, ".youtube-jedi");
            const lastTimeStamp = Stdio.readFromFile(timeStampFile, parseInt) ?? 0;
            const currentTime = Date.now();

            if (currentTime - lastTimeStamp > 86400000) {
                const latestVersion = await getLatestVersion();

                Stdio.writeToFile(timeStampFile, currentTime.toString(), { mode: 0o400 });

                if (latestVersion !== null && latestVersion !== localVersion) {
                    Stdio.print(`\n${Log.style(`A new version of youtube-jedi is available: v${latestVersion}`, "WRN")}\n\nRun  ${Log.style("jedi update", "PRM", "BLD")}  command to update to the latest version\n\n`);
                }
            }
        } catch (err) {
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
    // async #displayInfo () {

    // }


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
            // case "info":
            //     this.#displayInfo();
            //     break;
            // case "download":
            //     this.#download();
            //     break;
        }
    }
}

module.exports = Jedi;