#!/usr/bin/env node

require('dotenv').config();
const { version, author } = require("./../package.json");
const chalk = require("chalk");
const { parseArgv } = require("./utilities");
const { usage, options } = require("./constants");
const { displayVideoInfo, downloadVideo } = require("./download");

(async () => {
    // console.info(`\n${chalk.bold.blue("Welcome to youtube-jedi")} ${chalk.bold.whiteBright("v" + version)} ${chalk.white("by")} ${chalk.bold.blue(author)} 😁\n`);
    try {
        const args = parseArgv();

        if (args.flags.help) {
            console.info(`${chalk.bold.bgBlueBright("\n Usage   ")}`);
            for (let u of usage) {
                console.info(`   ${chalk.white("jedi " + u.cmd.padEnd(30))} ${u.desc}`);
            }

            console.info(`\n${chalk.bold.bgBlueBright(" Options ")}`);
            for (let o of options) {
                console.info(`   ${chalk.white(o.option.padEnd(35))} ${o.desc}`);
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
                console.error(`\n${chalk.bold.redBright("Invalid command!!!")} 😫\n\nRun ${chalk.bold(" jedi --help ")} to know how to use youtube-jedi\n`);
                return;
            }
            case "RESOLUTION_NOT_SUPPORTED": {
                console.error(`\n${chalk.bold.redBright("Resolution not supported!!!")} 😫\n\nRun ${chalk.bold("jedi --help")} to know how to use youtube-jedi\n`);
                return;
            }
            case "ENOTFOUND": {
                console.error(`\n${chalk.bold.redBright("Internet connection unavailable!!!")} 😫\n\nPlease try again later\n`);
                return;
            }
            case "INVALID_URL": {
                console.error(`\n${chalk.bold.redBright("Invalid URL!!!")} 😫\n\nPlease try with a valid URL\n`);
                return;
            }
        }
    }
})();