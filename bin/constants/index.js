const usage = [{
    cmd: "video [options] <video_url>",
    desc: "Download a youtube video"
}, {
    cmd: "--help",
    desc: "View help"
}];

const options = [{
    option: "-h, --help",
    desc: "View help"
}, {
    option: "-i, --info",
    desc: "View details of a youtube video",
}, {
    option: "-q, --quality",
    desc: "Download a youtube video with a specific quality"
}, {
    option: "-ao, --audioonly",
    desc: "Download a youtube video as audio"
}];

module.exports = { usage, options };