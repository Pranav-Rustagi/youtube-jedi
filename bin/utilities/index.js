const fs = require("fs");
const os = require("os");
const path = require("path");
const { usage, options } = require("../constants");
const moduleData = require("../../package.json");

class ColorLog {
    static primaryCode = "\x1b[94m";
    static bgPrimaryCode = "\x1b[104m";
    static successCode = "\x1b[92m";
    static errorCode = "\x1b[91m";
    static bgGrayCode = "\x1b[100m";
    static resetCode = "\x1b[0m";
    static boldCode = "\x1b[1m";
    static warningCode = "\x1b[93m";

    static bold = (msg) => `${this.boldCode}${msg}${this.resetCode}`;
    static label = (msg) => `${this.bgPrimaryCode}${this.boldCode}${msg}${this.resetCode}`;
    static primary = (msg, bold = false) => `${this.primaryCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    static error = (msg, bold = false) => `${this.errorCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    static success = (msg, bold = false) => `${this.successCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    static warn = (msg) => `${this.warningCode}${msg}${this.resetCode}`;
    static bgGray = (msg) => `${this.bgGrayCode}${msg}${this.resetCode}`;
}

const parseArgv = () => {
    const args = { flags: { help: false, info: false, audioonly: false } };
    const argvLen = process.argv.length;

    if (argvLen == 2 || process.argv[2] === "-h" || process.argv[2] === "--help") {
        args.flags.help = true;
        return args;
    }

    if (process.argv[2] === "-v" || process.argv[2] === "--version") {
        args.flags.version = true;
        return args;
    }

    if (argvLen < 4 || (process.argv[2] !== "video" && process.argv[2] !== "playlist")) {
        throw new Error("INVALID_CMD");
    }

    args.type = process.argv[2];
    args.url = process.argv[argvLen - 1];

    for (let i = 3; i < argvLen - 1; i++) {
        const [flagName, flagValue] = process.argv[i].split("=");

        if (flagName === "-i" || flagName === "--info") {
            args.flags.info = true;
        } else if (flagName === "-q" || flagName === "--quality") {
            if (flagValue === undefined)
                throw new Error("INVALID_CMD");
            args.flags.quality = flagValue;
        } else if (flagName === "-ao" || flagName === "--audioonly") {
            args.flags.audioonly = true;
        }
    }

    return args;
}

const showHelp = () => {
    console.info(ColorLog.label("\n Usage   "));
    for (let u of usage)
        console.info(`   jedi ${u.cmd.padEnd(35)} ${u.desc}`);

    console.info(ColorLog.label("\n Options "));
    for (let o of options)
        console.info(`   ${o.option.padEnd(40)} ${o.desc}`);
}

const getFileName = (title) => {
    return title.replace(/[/\\:?*"<>|]/g, '_').trim().substring(0, 255);
}

const getUserInput = async (question) => {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

const getAvailableFormats = (formats) => {
    const availableFormats = formats.reduce((all, format) => {
        if (format.hasVideo && format.qualityLabel !== null && all.includes(format.qualityLabel) === false)
            all.push(format.qualityLabel);
        return all;
    }, []).sort((a, b) => +b.split("p")[0] - +a.split("p")[0]);

    return availableFormats;
}


const getLatestVersion = async () => {
    try {
        const res = await fetch("https://registry.npmjs.com/youtube-jedi/latest");
        const data = await res.json();
        return data.version;
    } catch (err) {
        // console.log(err);
        return null;
    }
}

const checkForUpdate = async () => {
    try {
        const userHomeDir = os.homedir();
        const timeStampFile = path.join(userHomeDir, ".youtube-jedi");
        let lastTimeStamp = 0;

        if (fs.existsSync(timeStampFile))
            lastTimeStamp = +fs.readFileSync(timeStampFile, "utf-8");

        const currentTimeStamp = Date.now();

        if (currentTimeStamp - lastTimeStamp < 86400000)
            return;

        const latestVersion = await getLatestVersion();
        const currentVersion = moduleData.version;

        fs.writeFileSync(timeStampFile, currentTimeStamp.toString());

        if (latestVersion !== null && latestVersion !== currentVersion)
            console.log(`\n${ColorLog.warn("A new version of youtube-jedi is available!!!")} 😎\n\nRun ${ColorLog.bold(" npm i -g youtube-jedi ")} to update\n`);
    } catch (err) {
        console.log(err);
    }
}


const plotProgress = (progress) => {
    const done = Math.round(progress);
    // process.stdout.write("\r\x1B[?25l");
    // process.stdout.write(ColorLog.label(" ".repeat(done)));
    // process.stdout.write(ColorLog.bgGray("▒".repeat(100 - done)));
    // process.stdout.write(ColorLog.bold(` ${progress.toFixed(2)}%`));
    process.stdout.write(`\r\x1B[?25l${ColorLog.label(" ".repeat(done))}${ColorLog.bgGray("▒".repeat(100 - done))}${ColorLog.bold(` ${progress.toFixed(2)}%`)}`);
}

module.exports = {
    parseArgv,
    getFileName,
    getUserInput,
    getAvailableFormats,
    checkForUpdate,
    showHelp,
    plotProgress,
    ColorLog,
};