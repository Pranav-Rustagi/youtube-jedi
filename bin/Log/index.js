"use strict";

class Log {
    static codes = {
        "BLD": "\x1b[1m",
        "RST": "\x1b[0m",
        "BGP": "\x1b[104m",
        "BGS": "\x1b[100m",
        "PRM": "\x1b[94m",
        "SCS": "\x1b[92m",
        "ERR": "\x1b[91m",
        "WRN": "\x1b[93m"
    };

    static style(msg, ...styles) {
        const codes = styles.map(styleCode => Log.codes[styleCode]).join("");
        return `${codes}${msg}${Log.codes["RST"]}`;
    }
}

module.exports = Log;