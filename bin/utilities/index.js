const { argv } = process;

class ColorLog {
    static primaryCode = "\x1b[94m";
    static bgPrimaryCode = "\x1b[104m";
    static successCode = "\x1b[92m";
    static errorCode = "\x1b[91m";
    static bgGrayCode = "\x1b[100m";
    static resetCode = "\x1b[0m";
    static boldCode = "\x1b[1m";

    static error(msg, bold) {
        return `${this.errorCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static success(msg, bold) {
        return `${this.successCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static label(msg) {
        return `${this.bgPrimaryCode}${this.boldCode}${msg}${this.resetCode}`;
    }

    static primary(msg, bold) {
        return `${this.primaryCode}${bold ? this.boldCode : ""}${msg}${this.resetCode}`;
    }

    static bold(msg) {
        return `${this.boldCode}${msg}${this.resetCode}`;
    }

    static bgGray(msg) {
        return `${this.bgGrayCode}${msg}${this.resetCode}`;
    }
}

const parseArgv = () => {
    const args = { flags: { help: false, info: false } };
    const argvLen = argv.length;

    if (argvLen == 2 || argv[2] === "-h" || argv[2] === "--help") {
        args.flags.help = true;
        return args;
    }

    if (argvLen < 4) {
        throw new Error("INVALID_CMD");
    }

    if (argv[2] !== "video" && argv[2] !== "playlist") {
        throw new JediError("INVALID_CMD");
    }

    args.type = argv[2];
    args.url = argv[argvLen - 1];

    for (let i = 3; i < argvLen - 1; i++) {
        const [flagName, flagValue] = argv[i].split("=");

        if(flagName === "-i" || flagName === "--info") {
            if(flagValue === undefined) {
                args.flags.info = true;
                return args;
            }
            throw new Error("INVALID_CMD");
        } else if(flagName === "-q" || flagName === "quality") {
            if(flagValue === undefined) {
                throw new Error("INVALID_CMD");
            } else if(!flagValue in ["1080p", "720p", "480p", "360p", "240p", "144p"]) {
                throw new Error("RESOLUTION_NOT_SUPPORTED");
            }
            args.flags.quality = flagValue;
        }
    }

    return args;
}

const getFileName = (title) => {
    const invalidCharsRegex = /[/\\:?*"<>|]/g;
    const fileName = title.replace(invalidCharsRegex, "_").trim().substring(0, 255);
    return fileName;
}

module.exports = {
    parseArgv,
    ColorLog,
    getFileName
};