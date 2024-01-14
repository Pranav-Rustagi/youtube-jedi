"use strict";

const fs = require("fs");
const readline = require("readline");

class Stdio {
    static #rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    static input(question) {
        return new Promise((resolve) => {
            Stdio.#rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    static print(message) {
        process.stdout.write(message);
    }

    static readFromFile(file, fileParser, encoding = "utf-8") {
        if (fs.existsSync(file)) {
            return fileParser(fs.readFileSync(file, encoding));
        }
        return null;
    }

    static writeToFile(file, data, options = {}) {
        try {
            fs.writeFileSync(file, data, options);
        } catch (err) {
            this.print(`\n${Log.style(`Error writing to file: ${file}`, "ERR", "BLD")}\n\n`);
        }
    }

    static close() {
        this.rl.close();
    }
}

module.exports = Stdio;