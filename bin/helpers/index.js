"use strict";

const getLatestVersion = async () => {
    try {
        const res = await fetch("https://registry.npmjs.com/youtube-jedi/latest");
        const data = await res.json();
        return data.version;
    } catch (err) {
        return null;
    }
}

module.exports = {
    getLatestVersion,
};