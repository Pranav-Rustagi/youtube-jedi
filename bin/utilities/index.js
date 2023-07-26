const { argv } = process;

const parseArgv = () => {
    const args = { flags: { help: false, info: false } };
    const argvLen = argv.length;

    if (argvLen == 2 || argv[2] === "-h" || argv[2] === "--help") {
        args.flags.help = true;
        return args;
    }

    if (argvLen < 4) {
        return null;
    }

    if (argv[2] !== "video" && argv[2] !== "playlist") {
        return null;
    }

    args.type = argv[2];
    args.url = argv[argvLen - 1];

    for (let i = 3; i < argvLen - 1; i++) {
        if (argv[i] === "-i" || argv[i] === "--info") {
            args.flags.info = true;
            return args;
        } else {
            return null;
        }
    }

    return args;
}


const getFileName = (title, id) => {
    if(title !== undefined) {
        return title;
    }
    return "jedi-" + id;
}

module.exports = {
    parseArgv,
    getFileName
};