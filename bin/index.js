#!/usr/bin/env node

const { version, author } = require("./../package.json");
const chalk = require("chalk");
const { parseArgv } = require("./utilities");
const { usage, options } = require("./constants");

(async() => {
    console.info(`\n${chalk.bold.blue("Welcome to youtube-jedi")} ${chalk.bold.whiteBright("v" + version)} ${chalk.white("by")} ${chalk.bold.blue(author)} 😁\n`);
    
    const args = parseArgv();

    if(args === null) {
        console.error(`\n${chalk.bold.redBright("Invalid command!!!")} 😫\n\nRun ${chalk.bold.blue("jedi --help")} to know how to use youtube-jedi\n`);
        return;
    } 
    
    if (args.flags.help) {
        console.info(`${chalk.bold.magentaBright("Usage:")}`);
        for(let u of usage) {
            console.info(`   ${chalk.italic("jedi " + u.cmd.padEnd(50))} (${u.desc})`);
        }

        console.info(`\n${chalk.bold.magentaBright("Options:")}`);
        for(let o of options) {
            console.info(`   ${chalk.italic(o.option.padEnd(20))} (${o.desc})`);
        }
        console.log();
        return;
    }

})();