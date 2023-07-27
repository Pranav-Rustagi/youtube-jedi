const { argv } = process;

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

module.exports = {
    parseArgv
};