#!/usr/bin/env node

"use strict";

const Jedi = require("./Jedi");

const execJedi = async () => {
    try {
        process.env["YTDL_NO_UPDATE"] = true;
        process.stdout.write("\x1B[?25l");

        const jedi = await Jedi.emerge();
        await jedi.execute();

    } catch ({message}) {
        console.log(message);

    } finally {
        process.stdout.write("\x1B[?25h");
        process.exit();
    }
}

execJedi();