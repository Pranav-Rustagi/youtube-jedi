# youtube-jedi

## Description
**youtube-jedi** is a command line interface (CLI) tool for downloading Youtube videos and playlists directly from your terminal. 

From downloading a single video to downloading a whole playlist alongside configuring options of downloads, **youtube-jedi** has got you covered!


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

    ```
    jedi video --info <video-url>
    ```

- **View details of a youtube playlist**

    ```
    jedi playlist --info <playlist-url>
    ```

- **Download a youtube video**

    ```
    jedi video <video-url>
    ```

- **Download a youtube playlist**

    ```
    jedi playlist <playlist-url>
    ```

- **Download a youtube video with a specific quality**

    ```
    jedi video --quality=<quality> <video-url>
    ```

- **Download a youtube playlist with a specific quality**

    ```
    jedi playlist --quality=<quality> <playlist-url>
    ```
- **Download youtube video as audio**

    ```
    jedi video --audioonly <video-url>
    ```

- **Download youtube playlist videos as audios**

    ```
    jedi playlist --audioonly <playlist-url>
    ```

- **View help**

    ```
    jedi --help
    ```

## youtube-jedi options

| Option | Alias | Use | Command syntax |
| ---- | ------- | ---- | ---- |
| --info | -i | View details of a youtube video/playlist | jedi [video/playlist] --info \<url\> |
| --quality | -q | Download a youtube video/playlist with a specific quality | jedi [video/playlist] --quality=\<quality\> \<url\> |
| --audioonly | -ao | Download youtube video/playlist as audio/s | jedi [video/playlist] --audioonly \<url\> |
| --help | -h | View help | jedi --help |

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Author
[Pranav Rustagi](https://github.com/pranav-rustagi)