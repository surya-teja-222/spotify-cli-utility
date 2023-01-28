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
const crypto_1 = require("crypto");
const openB = require("open");
const chalk = require("chalk");
const Conf = require("conf");
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
const link = require("terminal-link");
const config = new Conf({ projectName: "spotify-cli" });
class SpotifyCLI {
    constructor() {
        this.scopes = [
            "user-read-private",
            "user-read-email",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-read-currently-playing",
            "user-read-recently-played",
            "user-read-playback-position",
            "user-top-read",
            "user-read-playback-state",
            "playlist-read-collaborative",
            "playlist-modify-public",
            "playlist-modify-private",
            "playlist-read-private",
        ];
        this.headers = {
            Authorization: `Bearer ${config.get("access-token")}`,
            "Content-Type": "application/json",
        };
    }
    requiresLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config.get("access-token")) {
                console.log(chalk.red("You are not logged in!"));
                console.log(chalk.blue("Login to continue..."));
                // return false;
                process.exit(0);
            }
            if (config.get("expires-in") < Date.now() - 2000) {
                const re = yield this.getNewAccessToken().then(() => {
                    return true;
                });
            }
        });
    }
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
            // generate a random UUID
            const uuid = (0, crypto_1.randomUUID)();
            const url = "https://accounts.spotify.com/authorize?" +
                new URLSearchParams({
                    response_type: "code",
                    client_id: process.env.CLIENT_ID,
                    redirect_uri: process.env.REDIRECT_URI,
                    scope: this.scopes.join(" "),
                    state: uuid,
                });
            yield openB(url);
            console.log(`If your browser doesn't open automatically, please open the following link manually:`);
            console.log(chalk.underline.blue(url));
            // Input from user
            // await readline.question(
            // 	"Enter the code from browser to continue: ",
            // 	(code: string) => {
            // 		config.set("access-token", code);
            // 		readline.close();
            // 		fetch("https://accounts.spotify.com/api/token", {
            // 			method: "POST",
            // 			// @ts-ignore
            // 			body: new URLSearchParams({
            // 				code: code,
            // 				redirect_uri: process.env.REDIRECT_URI,
            // 				grant_type: "authorization_code",
            // 			}),
            // 			headers: {
            // 				Authorization:
            // 					"Basic " +
            // 					new Buffer(
            // 						process.env.CLIENT_ID +
            // 							":" +
            // 							process.env.CLIENT_SECRET
            // 					).toString("base64"),
            // 				"Content-Type": "application/x-www-form-urlencoded",
            // 			},
            // 		})
            // 			.then(async (response) => {
            // 				const re = await response.json();
            // 				config.set("access-token", re.access_token);
            // 				config.set("refresh-token", re.refresh_token);
            // 				config.set("expires-in", re.expires_in + Date.now());
            // 				console.log(
            // 					chalk.green(
            // 						"Successfully logged in! You can now continue to use Spotify from your terminal."
            // 					)
            // 				);
            // 			})
            // 			.catch((err) => {
            // 				console.log("Failed to log in! Try again later.");
            // 			});
            // 	}
            // );
            // Wait for 5 seconds
            yield new Promise((resolve) => setTimeout(resolve, 5000));
            const code = yield this.getFromServer(uuid);
            if (code) {
                config.set("access-token", code);
                const res = yield fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
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
                });
                if (res.status !== 200) {
                    console.log("Failed to log in! Try again later.");
                    process.exit(0);
                }
                const re = yield res.json();
                config.set("access-token", re.access_token);
                config.set("refresh-token", re.refresh_token);
                config.set("expires-in", re.expires_in + Date.now());
                console.log(chalk.green("Successfully logged in! You can now continue to use Spotify from your terminal."));
            }
            else {
                console.log("Failed to log in! Try again later.");
            }
            process.exit(0);
        });
    }
    getFromServer(state) {
        return __awaiter(this, void 0, void 0, function* () {
            const parms = new URLSearchParams({
                state: state,
            });
            const res = yield fetch(`${process.env.REDIRECT_URI}get?${parms.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "GET",
                credentials: "include",
            });
            const re = yield res.json();
            if (re.code) {
                return re.code;
            }
            else {
                yield new Promise((resolve) => setTimeout(resolve, 5000));
                return yield this.getFromServer(state);
            }
        });
    }
    getNewAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const refresh_token = config.get("refresh-token");
            if (refresh_token) {
                yield fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    // @ts-ignore
                    body: new URLSearchParams({
                        refresh_token: refresh_token,
                        grant_type: "refresh_token",
                    }),
                    headers: {
                        Authorization: "Basic " +
                            new Buffer(process.env.CLIENT_ID +
                                ":" +
                                process.env.CLIENT_SECRET).toString("base64"),
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                })
                    .then((r) => r.json())
                    .then((response) => {
                    config.set("access-token", response.access_token);
                    config.set("expires-in", response.expires_in * 1000 + Date.now());
                    // ! TODO: REMOVE NEXT LINE
                    console.warn("Access token refreshed!");
                })
                    .catch((err) => {
                    console.error("Failed to log in! Try again later.");
                });
            }
            else {
                console.log(chalk.red("You are not logged in!"));
                console.log(chalk.blue("Login to continue..."));
            }
        });
    }
    currentlyPlaying() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                headers: this.headers,
            })
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                const re = yield response.json();
                const tLink = link(re.item.name, re.item.external_urls.spotify);
                console.log(chalk.magenta.bold(`Currently playing: ${tLink} `));
                console.log(chalk.green(`By ` +
                    chalk.blue(re.item.artists[0].name) +
                    ` from album `) + chalk.blue(re.item.album.name));
                var currentTime = Math.floor((re.progress_ms / 1000 / 60) % 60) +
                    ":" +
                    Math.floor((re.progress_ms / 1000) % 60);
                var totalTime = Math.floor((re.item.duration_ms / 1000 / 60) % 60) +
                    ":" +
                    Math.floor((re.item.duration_ms / 1000) % 60);
                console.log(chalk.green(`\n` +
                    `Progress: ` +
                    chalk.blue(currentTime) +
                    `/` +
                    chalk.blue(totalTime)));
                process.exit(0);
            }))
                .catch((err) => {
                console.log(chalk.red("Nothing is currently playing!"));
                console.log("To play a song, use play <song name> or play <song name> <artist name>");
                process.exit(0);
            });
        });
    }
    devices(flag = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield fetch("https://api.spotify.com/v1/me/player/devices", {
                headers: this.headers,
            });
            const re = yield res.json();
            console.log(chalk.green("Available devices:"));
            re.devices.forEach((device, index) => {
                if (device.is_active) {
                    console.log(index + 1 + ") " + chalk.blue.bgGreen(`${device.name}`));
                }
                else {
                    console.log(index + 1 + ") " + chalk.blue(`${device.name}`));
                }
            });
            config.set("devices", re.devices);
            if (flag == 0) {
                console.log(`\n` +
                    chalk.green(`To play a song, use play <song name> or play <song name> <artist name>`));
                process.exit(0);
            }
            return re.devices;
        });
    }
    switchDevice(device, flag = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            if (!device) {
                const k = yield this.devices(1).then(() => __awaiter(this, void 0, void 0, function* () {
                    yield readline.question("Pick a device to switch to: (press q to quit): ", (num) => __awaiter(this, void 0, void 0, function* () {
                        if (num == "q" || num == "Q") {
                            process.exit(0);
                        }
                        if (isNaN(parseInt(num))) {
                            console.log(chalk.red("Invalid device!"));
                            process.exit(0);
                        }
                        yield this.switchDevice(parseInt(num), 1);
                    }));
                }));
            }
            else if (device && flag == 1) {
                const re = yield fetch("https://api.spotify.com/v1/me/player", {
                    method: "PUT",
                    headers: this.headers,
                    body: JSON.stringify({
                        device_ids: [config.get("devices")[device - 1].id],
                    }),
                });
                if (re.status == 204) {
                    console.log(chalk.green("Switched device!"));
                    process.exit(0);
                }
                else {
                    console.log(chalk.red("Failed to switch device!"));
                    process.exit(0);
                }
            }
            else {
                const re = yield fetch("https://api.spotify.com/v1/me/player", {
                    method: "PUT",
                    headers: this.headers,
                    body: JSON.stringify({
                        device_ids: [device],
                    }),
                });
                if (re.status == 204) {
                    console.log(chalk.green("Switched device!"));
                    process.exit(0);
                }
                else {
                    console.log(chalk.red("Failed to switch device! Incorrect device ID!"));
                    process.exit(0);
                }
            }
        });
    }
    recentlyPlayed() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const re = yield this.getRecentlyPlayed();
            console.log(chalk.green("Recently played:"));
            re.forEach((item) => {
                console.log(chalk.blue(item.track.name) +
                    " by " +
                    chalk.blue(item.track.artists[0].name));
            });
            process.exit(0);
        });
    }
    getRecentlyPlayed() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield fetch("https://api.spotify.com/v1/me/player/recently-played", {
                headers: this.headers,
            });
            const re = yield res.json();
            return re.items;
        });
    }
    play(track, artist, playlist, device, album) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            if (!track && !artist && !playlist && !device && !album) {
                const res = yield fetch("https://api.spotify.com/v1/me/player/play", {
                    method: "PUT",
                    headers: this.headers,
                });
                if (res.status == 204) {
                    console.log(chalk.green("Resumed playback!"));
                }
                else if (res.status == 403) {
                }
                else {
                    console.log(chalk.red("Failed to resume playback!"));
                }
            }
            else if (device && !track && !artist && !playlist) {
                yield this.switchDevice(device);
            }
            else {
                let id = yield this.search(track ? track : album, artist, playlist);
                if (id) {
                    if (id.status != 400) {
                        var query = null;
                        if (device) {
                            query = new URLSearchParams({
                                device_id: device.toString(),
                            });
                        }
                        var body = {};
                        if (id.trackId) {
                            body = {
                                context_uri: id.albumId
                                    ? id.albumId
                                    : id.artistId
                                        ? id.artistId
                                        : id.playlistId,
                                offset: {
                                    uri: id.trackId,
                                },
                            };
                        }
                        else {
                            body = {
                                context_uri: id.albumId
                                    ? id.albumId
                                    : id.artistId
                                        ? id.artistId
                                        : id.playlistId,
                            };
                        }
                        const res = yield fetch(`https://api.spotify.com/v1/me/player/play?${query ? query.toString() : ""}`, {
                            method: "PUT",
                            headers: this.headers,
                            body: JSON.stringify(body),
                        });
                        if (res.status == 204) {
                            var output;
                            if (id.trackName) {
                                output = `Playing ${id.trackName} by ${id.artistName}`;
                            }
                            else if (id.playlistName) {
                                output = `Playing ${id.playlistName}`;
                            }
                            else if (id.albumName) {
                                output = `Playing ${id.albumName}`;
                            }
                            console.log(chalk.green(output));
                        }
                        else {
                            console.log(chalk.red("Failed to play song!"));
                        }
                    }
                    else {
                        console.log(chalk.red("Invalid search!"));
                    }
                }
                else {
                    console.log(chalk.red("Failed to play song!"));
                }
            }
            process.exit(0);
        });
    }
    search(track, artist, playlist) {
        return __awaiter(this, void 0, void 0, function* () {
            if (track) {
                const body = new URLSearchParams({
                    q: `${track} ${artist ? artist : ""}`,
                    type: "track",
                });
                const res = yield fetch(`https://api.spotify.com/v1/search?${body}`, {
                    headers: this.headers,
                    method: "GET",
                });
                const re = yield res.json();
                if (re.tracks.items.length > 0) {
                    return {
                        status: 200,
                        trackId: re.tracks.items[0].uri,
                        albumId: re.tracks.items[0].album.uri,
                        artistName: re.tracks.items[0].artists[0].name,
                        trackName: re.tracks.items[0].name,
                    };
                }
            }
            else if (artist) {
                const qp = new URLSearchParams({
                    q: `${artist}`,
                    type: "artist",
                });
                const res = yield fetch(`https://api.spotify.com/v1/search?${qp}`, {
                    headers: this.headers,
                });
                const re = yield res.json();
                if (re.artists.items.length > 0) {
                    return {
                        status: 200,
                        artistId: re.artists.items[0].uri,
                        artistName: re.artists.items[0].name,
                    };
                }
            }
            else if (playlist) {
                const res = yield fetch("https://api.spotify.com/v1/me/playlists", {
                    headers: this.headers,
                });
                const re = yield res.json();
                if (re.items.length > 0) {
                    const match = re.items.find((item) => item.name.toLowerCase() === playlist.toLowerCase());
                    if (match) {
                        return {
                            status: 200,
                            playlistId: match.uri,
                            playlistName: match.name,
                        };
                    }
                }
            }
            return {
                status: 400,
            };
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield fetch("https://api.spotify.com/v1/me/player/pause", {
                method: "PUT",
                headers: this.headers,
            });
            if (res.status == 204) {
                console.log(chalk.green("Paused playback!"));
            }
            else {
                console.log(chalk.red("Failed to pause playback!"));
            }
            process.exit(0);
        });
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield fetch("https://api.spotify.com/v1/me/player/next", {
                method: "POST",
                headers: this.headers,
            });
            process.exit(0);
        });
    }
    previous() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield fetch("https://api.spotify.com/v1/me/player/previous", {
                method: "POST",
                headers: this.headers,
            });
            process.exit(0);
        });
    }
    queue(track) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const res = yield this.search(track, undefined, undefined);
            if (res.status == 200) {
                const body = new URLSearchParams({
                    uri: res.trackId,
                });
                const k = yield fetch(`https://api.spotify.com/v1/me/player/queue?${body}`, {
                    method: "POST",
                    headers: this.headers,
                });
                if (k.status == 204) {
                    console.log(chalk.green(`Queued ${res.trackName}!`));
                }
                else {
                    console.log(chalk.red("Failed to queue song!"));
                }
            }
            process.exit(0);
        });
    }
    repeat(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const body = new URLSearchParams({
                state: input,
            });
            const res = yield fetch(`https://api.spotify.com/v1/me/player/repeat?${body}`, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            if (res.status == 204) {
                console.log(chalk.green(`Set repeat to ${input}!`));
            }
            else {
                console.log(chalk.red("Failed to set repeat!"));
            }
            process.exit(0);
        });
    }
    shuffle(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.requiresLogin();
            const body = new URLSearchParams({
                state: input ? "true" : "false",
            });
            const res = yield fetch(`https://api.spotify.com/v1/me/player/shuffle?${body}`, {
                method: "PUT",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            if (res.status == 204) {
                console.log(chalk.green(`Set shuffle to ${input}!`));
            }
            else {
                console.log(chalk.red("Failed to set shuffle!"));
            }
            process.exit(0);
        });
    }
}
exports.default = SpotifyCLI;
