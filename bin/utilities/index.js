const fs = require("fs");
const os = require("os");
const path = require("path");
const { argv } = process;
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

    static bold(msg) {
        return `${this.boldCode}${msg}${this.resetCode}`;
    }

    static label(msg) {
        return `${this.bgPrimaryCode}${this.boldCode}${msg}${this.resetCode}`;
    }

    static primary(msg, bold = false) {
        return `${this.primaryCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static error(msg, bold = false) {
        return `${this.errorCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static success(msg, bold = false) {
        return `${this.successCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static warn(msg) {
        return `${this.warningCode}${msg}${this.resetCode}`;
    }

    static bgGray(msg) {
        return `${this.bgGrayCode}${msg}${this.resetCode}`;
    }
}

const parseArgv = () => {
    const args = { flags: { help: false, info: false, audioonly: false } };
    const argvLen = argv.length;

    if (argvLen == 2 || argv[2] === "-h" || argv[2] === "--help") {
        args.flags.help = true;
        return args;
    }

    if (argvLen < 4) {
        throw new Error("INVALID_CMD");
    }

    if (argv[2] !== "video" && argv[2] !== "playlist") {
        throw new Error("INVALID_CMD");
    }

    args.type = argv[2];
    args.url = argv[argvLen - 1];

    for (let i = 3; i < argvLen - 1; i++) {
        const [flagName, flagValue] = argv[i].split("=");

        if (flagName === "-i" || flagName === "--info") {
            if (flagValue === undefined) {
                args.flags.info = true;
                return args;
            }
            throw new Error("INVALID_CMD");
        } else if (flagName === "-q" || flagName === "--quality") {
            if (flagValue === undefined) {
                throw new Error("INVALID_CMD");
            }
            args.flags.quality = flagValue;
        } else if (flagName === "-ao" || flagName === "--audioonly") {
            args.flags.audioonly = true;
        }
    }

    return args;
}

const showHelp = () => {
    console.info(ColorLog.label("\n Usage   "));
    for (let u of usage) {
        console.info(`   jedi ${u.cmd.padEnd(35)} ${u.desc}`);
    }

    console.info(ColorLog.label("\n Options "));
    for (let o of options) {
        console.info(`   ${o.option.padEnd(40)} ${o.desc}`);
    }
}

const getFileName = (title) => {
    const invalidCharsRegex = /[/\\:?*"<>|]/g;
    const fileName = title.replace(invalidCharsRegex, "_").trim().substring(0, 255);
    return fileName;
}

const getUserInput = async (question) => {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

const getAvailableFormats = (formats) => {
    const availableFormats = formats.reduce((resultant, format) => {
        if (format.hasVideo && format.qualityLabel !== null && resultant.includes(format.qualityLabel) === false) {
            resultant.push(format.qualityLabel);
        }
        return resultant;
    }, []);

    availableFormats.sort((a, b) => {
        const aRes = a.split("p")[0];
        const bRes = b.split("p")[0];
        return +bRes - +aRes;
    });
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
        if (fs.existsSync(timeStampFile)) {
            const timeStampData = fs.readFileSync(timeStampFile, "utf-8");
            lastTimeStamp = JSON.parse(timeStampData).timeStamp;
        }

        const currentTimeStamp = Date.now();

        if (currentTimeStamp - lastTimeStamp < 86400000) {
            return;
        }

        const latestVersion = await getLatestVersion();
        const currentVersion = moduleData.version;

        fs.writeFileSync(timeStampFile, currentTimeStamp.toString());

        if (latestVersion !== null && latestVersion !== currentVersion) {
            console.log(`\n${ColorLog.warn("A new version of youtube-jedi is available!!!")} 😎\n\nRun ${ColorLog.bold(" npm i -g youtube-jedi ")} to update\n`);
        }
    } catch (err) {
        console.log(err);
    }
}


const plotProgress = (progress) => {
    const done = Math.round(progress);
    process.stdout.write("\r\x1B[?25l");
    process.stdout.write(ColorLog.label(" ".repeat(done)));
    process.stdout.write(ColorLog.bgGray("▒".repeat(100 - done)));
    process.stdout.write(ColorLog.bold(` ${progress.toFixed(2)}%`));
}

module.exports = {
    parseArgv,
    getFileName,
    getUserInput,
    getAvailableFormats,
    getLatestVersion,
    checkForUpdate,
    showHelp,
    plotProgress,
    ColorLog,
};