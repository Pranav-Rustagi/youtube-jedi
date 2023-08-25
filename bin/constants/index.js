const usage = [{
    cmd: "[video/playlist] --info <url>",
    desc: "View details of a youtube video/playlist"
}, {
    cmd: "[video/playlist] [options] <url>",
    desc: "Download a youtube video/playlist"
}, {
    cmd: "--version",
    desc: "View version"
}, {
    cmd: "--help",
    desc: "View help"
}];

const options = [{
    option: "-i, --info",
    desc: "View details of a youtube video/playlist",
}, {
    option: "-q, --quality",
    desc: "Download a youtube video/playlist with a specific quality"
}, {
    option: "-ao, --audioonly",
    desc: "Download a youtube video/playlist as audio/s"
}, {
    option: "-v, --version",
    desc: "View version"
}, {
    option: "-h, --help",
    desc: "View help"
}];

module.exports = { usage, options };