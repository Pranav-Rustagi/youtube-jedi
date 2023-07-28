#!/usr/bin/env node

require('dotenv').config();
const { parseArgv, ColorLog } = require("./utilities");
const { usage, options } = require("./constants");
const { displayVideoInfo, downloadVideo } = require("./download");

(async () => {
    try {
        const args = parseArgv();

        if (args.flags.help) {
            console.info(ColorLog.label("\n Usage   "));
            for (let u of usage) {
                console.info(`   jedi ${u.cmd.padEnd(30)} ${u.desc}`);
            }
            
            console.info(ColorLog.label("\n Options "));
            for (let o of options) {
                console.info(`   ${o.option.padEnd(35)} ${o.desc}`);
            }
            console.log();
            return;
        }

        if (args.type === "video") {
            if (args.flags.info) {
                await displayVideoInfo(args.url);
            } else {
                await downloadVideo(args.url, args.flags);
            }
        }
    } catch ({ message }) {
        switch (message) {
            case "INVALID_CMD": {
                console.log(`\n${ColorLog.error("Invalid command!!!")} 😫\n\nRun ${ColorLog.bold(" jedi --help ")} to know how to use youtube-jedi\n`);
                return;
            }
            case "RESOLUTION_NOT_SUPPORTED": {
                console.error(`\n${ColorLog.error("Resolution not supported!!!")} 😫\n\nChoose a valid resolution\n`);
                return;
            }
            case "ENOTFOUND": {
                console.error(`\n${ColorLog.error("Internet connection unavailable!!!")} 😫\n\nPlease try again later\n`);
                return;
            }
            case "INVALID_URL": {
                console.error(`\n${ColorLog.error("Invalid URL!!!")} 😫\n\nPlease try with a valid URL\n`);
                return;
            }
        }
    }
})();