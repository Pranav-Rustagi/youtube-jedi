const usage = [{
    cmd: "video --info <video_url>",
    desc: "View details of a youtube video"
}, {
    cmd: "video <video_url>",
    desc: "View details of a youtube video"
}, {
    cmd: "video --quality=<quality> <youtube-video-url>",
    desc: "Download a youtube video with a specific quality"
}, {
    cmd: "video --audioonly <youtube-video-url>",
    desc: "Download just the audio of a youtube video"
}, {
    cmd: "--help",
    desc: "View help"
}];

const options = [{
    option: "[-i | --info]",
    desc: "View details of a youtube video",
}, {
    option: "[-q | --quality]",
    desc: "Download a youtube video with a specific quality"
}, {
    option: "[-ao | --audioonly]",
    desc: "Download just the audio of a youtube video"
}, {
    option: "[-h | --help]",
    desc: "View help"
}];

module.exports = { usage, options };