const usage = [{
    cmd: "[video/playlist] --info <url>",
    desc: "View details of a youtube video/playlist"
}, {
    cmd: "[video/playlist] [options] <url>",
    desc: "Download a youtube video/playlist"
}, {
    cmd: "--help",
    desc: "View help"
}];

const options = [{
    option: "-h, --help",
    desc: "View help"
}, {
    option: "-i, --info",
    desc: "View details of a youtube video/playlist",
}, {
    option: "-q, --quality",
    desc: "Download a youtube video/playlist with a specific quality"
}, {
    option: "-ao, --audioonly",
    desc: "Download a youtube video/playlist as audio/s"
}];

module.exports = { usage, options };