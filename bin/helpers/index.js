"use strict";


const formattedDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toDateString();
}

const secondsToTimeStr = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const hourStr = hours ? `${hours} hour${hours > 1 ? "s" : ""}, ` : "";
    seconds -= hours * 3600;

    const minutes = Math.floor(seconds / 60);
    const minuteStr = minutes ? `${minutes} ${minutes > 1 ? "minutes" : "minute"}, ` : "";
    seconds -= minutes * 60;

    const secondsStr = seconds ? `${seconds} seconds` : "";

    return hourStr + minuteStr + secondsStr;
}

module.exports = {
    formattedDate,
    secondsToTimeStr
};