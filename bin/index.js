#!/usr/bin/env node

const { version, author } = require("./../package.json");
const chalk = require("chalk");
const { parseArgv } = require("./utilities");
const { usage, options } = require("./constants");
const { displayVideoInfo } = require("./download");

(async() => {
    console.info(`\n${chalk.bold.blue("Welcome to youtube-jedi")} ${chalk.bold.whiteBright("v" + version)} ${chalk.white("by")} ${chalk.bold.blue(author)} 😁\n`);
    
    const args = parseArgv();

    if(args === null) {
        console.error(`\n${chalk.bold.redBright("Invalid command!!!")} 😫\n\nRun ${chalk.bold.blue("jedi --help")} to know how to use youtube-jedi\n`);
        return;
    } 
    
    if (args.flags.help) {
        console.info(`${chalk.bold.bgBlueBright(" Usage   ")}`);
        for(let u of usage) {
            console.info(`   ${chalk.white("jedi " + u.cmd.padEnd(30))} ${u.desc}`);
        }

        console.info(`\n${chalk.bold.bgBlueBright(" Options ")}`);
        for(let o of options) {
            console.info(`   ${chalk.white(o.option.padEnd(35))} ${o.desc}`);
        }
        console.log();
        return;
    }

    if(args.type === "video") {
        if(args.flags.info) {
            await displayVideoInfo(args.url);
        } else {
            
        }
        // call download info function from downloads
    }

})();