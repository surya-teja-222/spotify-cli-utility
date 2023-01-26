"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openB = require("open");
const chalk = require("chalk");
const Conf = require("conf");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const config = new Conf({ projectName: "spotify-cli" });
class SpotifyCLI {
    constructor() { }
    browse(input) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Opening ${input} in Spotify Web Browser...`);
            yield openB(`https://open.spotify.com/search/${input}`);
            console.log(chalk.green("If your browser doesn't open automatically, please open the following link manually:"));
            console.log(chalk.underline.blue(`https://open.spotify.com/search/${input}`));
        });
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Logging in...");
            const url = "https://accounts.spotify.com/authorize?" +
                new URLSearchParams({
                    response_type: "code",
                    client_id: process.env.CLIENT_ID,
                    redirect_uri: process.env.REDIRECT_URI,
                });
            yield openB(url);
            console.log(`If your browser doesn't open automatically, please open the following link manually:`);
            console.log(chalk.underline.blue(url));
            // Input from user
            yield readline.question("Enter the code from browser to continue: ", (code) => {
                config.set("access-token", code);
                readline.close();
                fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    // @ts-ignore
                    body: new URLSearchParams({
                        code: code,
                        redirect_uri: process.env.REDIRECT_URI,
                        grant_type: "authorization_code",
                    }),
                    headers: {
                        Authorization: "Basic " +
                            new Buffer(process.env.CLIENT_ID +
                                ":" +
                                process.env.CLIENT_SECRET).toString("base64"),
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    const re = yield response.json();
                    config.set("access-token", re.access_token);
                    config.set("refresh-token", re.refresh_token);
                    config.set("expires-in", re.expires_in + Date.now());
                    console.log(chalk.green("Successfully logged in! You can now continue to use Spotify from your terminal."));
                }))
                    .catch((err) => {
                    console.log("Failed to log in! Try again later.");
                });
            });
        });
    }
}
exports.default = SpotifyCLI;
