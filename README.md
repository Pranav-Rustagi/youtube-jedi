# youtube-jedi

## About youtube-jedi
**youtube-jedi** is a command line interface (CLI) tool for downloading videos from Youtube. 

Want to choose the quality of the video you download? Want to download only the audio? 

**youtube-jedi** got you!

## Prerequisites
- [Node.js](https://nodejs.org/en/) 

## Installation

**For NPM:**
```bash
npm i -g youtube-jedi
```

**For Yarn:**
```bash
yarn global add youtube-jedi
```

## Usage
- **View details of a youtube video**

    ```bash
    jedi --info <youtube-video-url>
    ```
- **Download a youtube video**

    ```bash
    jedi video <youtube-video-url>
    ```
- **Download a youtube video with a specific quality**

    ```bash
    jedi video --quality=<quality> <youtube-video-url>
    ```
- **Download just the audio of a youtube video**

    ```bash
    jedi video --audioonly <youtube-video-url>
    ```
- **View help**

    ```bash
    jedi --help
    ```

## youtube-jedi options

| Option | Use | Command syntax |
| ---- | ---- | ---- |
| --info, -i | View details of a youtube video | jedi --info <video_url> |
| --quality, -q | Download a youtube video with a specific quality | jedi video --quality=\<quality> <video_url> |
| --audioonly, -ao | Download just the audio of a youtube video | jedi video --audioonly <video_url> |
| --help, -h | View help | jedi --help |

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Author
[Pranav Rustagi](https://github.com/pranav-rustagi)