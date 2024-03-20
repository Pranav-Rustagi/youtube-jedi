const { validateURL, validateID, getVideoID, getBasicInfo, getInfo } = require("ytdl-core");
const Error = require("../Error");

class Scraper {
    #media_type;
    #media_src;

    constructor(type, src) {
        this.#media_type = type;
        this.#media_src = src;
    }

    async #fetchVideoInfo () {
        try {
            if (validateURL(this.#media_src)) {
                if(validateID(getVideoID(this.#media_src))) {
                    const info_obj = await getBasicInfo(this.#media_src);
                    return info_obj.videoDetails;
                } else {
                    throw new Error("VID_NOT_FOUND", null, "URL does not belong to any youtube video")
                }
            } else {
                throw new Error("INVALID_URL", null, "Provided URL is not valid");
            }
        } catch (e) {
            throw e;
        }
    }

    async fetchMediaInfo () {
        if (this.#media_type === "video") {
            return await this.#fetchVideoInfo();
        }
    }
}


module.exports = Scraper;