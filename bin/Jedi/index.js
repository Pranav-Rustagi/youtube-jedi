"use strict";

const path = require('path');
const os = require('os');
const Log = require('../Log');
const Stdio = require('../Stdio');
const { getLatestVersion } = require('../helpers');
const { version: localVersion } = require('./../../package.json');

class Jedi {
    #args;
    #operation;
    #media_type;
    #flags;
    #url;

    constructor(args = null, operation = null, media_type = null, flags = null, url = null) {
        this.#args = args;
        this.#operation = operation;
        this.#media_type = media_type;
        this.#flags = flags;
        this.#url = url;
    }

    static async emerge () {
        const jedi_cmd_args = process.argv.slice(2);

        const jedi_operations = ["help", "update", "info", "download"];
        const cmd_operation = jedi_cmd_args[0];

        if (jedi_operations.includes(cmd_operation) === false) {
            throw new Error("INVALID_CMD");
        }

        if (cmd_operation === "download" || cmd_operation === "info") {
            const url = jedi_cmd_args[jedi_cmd_args.length - 1];
        }



        return new Jedi(jedi_cmd_args, cmd_operation);
    }

    async checkForUpdate(bypassCheck = false) {
        const userHomeDir = os.homedir();
        const timeStampFile = path.join(userHomeDir, ".youtube-jedi");
        const lastTimeStamp = Stdio.readFromFile(timeStampFile, parseInt) ?? 0;
        const currentTime = Date.now();

        if (bypassCheck || currentTime - lastTimeStamp > 86400000) {
            const latestVersion = await getLatestVersion();
    
            Stdio.writeToFile(timeStampFile, currentTime.toString(), { mode: 0o400 });

            if (latestVersion !== null && latestVersion !== localVersion) {
                Stdio.print(`\n${Log.style(`A new version of youtube-jedi is available: v${latestVersion}`, "WRN", "BLD")}\n\nRun command given below to update\n\n=============================\nǁ   ${Log.style("npm i -g youtube-jedi", "PRM", "BLD")}   ǁ\n=============================\n\n`);
            }
        }
    }

    async execute() {
        await this.checkForUpdate();
    }
}

module.exports = Jedi;