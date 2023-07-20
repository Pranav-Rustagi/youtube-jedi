const usage = [{
    cmd: "video [options] <url>",
    desc: "To download a youtube video"
// }, {
//     cmd: "playlist [options] <youtube playlist url>",
//     desc: "To download entire youtube playlist"
}, {
    cmd: "[-h | --help]",
    desc: "To view all youtube-jedi commands and options"
}];

const options = [{
    option: "-i, --info",
    desc: "To view information about specified youtube content (video/playlist)"
}, {
    option: "-h, --help",
    desc: "To view all youtube-jedi commands and flags"
}];

module.exports = { usage, options };