import { program } from "commander";

const openB = require("open");
const chalk = require("chalk");
const Conf = require("conf");

const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});
const link = require("terminal-link");
const config = new Conf({ projectName: "spotify-cli" });

export default class SpotifyCLI {
	constructor() {}
	scopes = [
		"user-read-private",
		"user-read-email",
		"user-read-playback-state",
		"user-modify-playback-state",
		"user-read-currently-playing",
		"user-read-recently-played",
		"user-read-playback-position",
		"user-top-read",
	];

	private headers = {
		Authorization: `Bearer ${config.get("access-token")}`,
		"Content-Type": "application/json",
	};

	private async requiresLogin() {
		if (!config.get("access-token")) {
			console.log(chalk.red("You are not logged in!"));
			console.log(chalk.blue("Login to continue..."));
			// return false;
			process.exit(0);
		}
		if (config.get("expires-in") < Date.now()) {
			const re = await this.getNewAccessToken().then(() => {
				return true;
			});
		}
	}
	async browse(input: string) {
		console.log(`Opening ${input} in Spotify Web Browser...`);
		await openB(`https://open.spotify.com/search/${input}`);

		console.log(
			chalk.green(
				"If your browser doesn't open automatically, please open the following link manually:"
			)
		);
		console.log(
			chalk.underline.blue(`https://open.spotify.com/search/${input}`)
		);
	}

	async login() {
		console.log("Logging in...");
		const url =
			"https://accounts.spotify.com/authorize?" +
			new URLSearchParams({
				response_type: "code",
				client_id: process.env.CLIENT_ID as string,
				redirect_uri: process.env.REDIRECT_URI as string,
				scope: this.scopes.join(" "),
			});
		await openB(url);

		console.log(
			`If your browser doesn't open automatically, please open the following link manually:`
		);
		console.log(chalk.underline.blue(url));

		// Input from user
		await readline.question(
			"Enter the code from browser to continue: ",
			(code: string) => {
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
						Authorization:
							"Basic " +
							new Buffer(
								process.env.CLIENT_ID +
									":" +
									process.env.CLIENT_SECRET
							).toString("base64"),
						"Content-Type": "application/x-www-form-urlencoded",
					},
				})
					.then(async (response) => {
						const re = await response.json();
						config.set("access-token", re.access_token);
						config.set("refresh-token", re.refresh_token);
						config.set("expires-in", re.expires_in + Date.now());
						console.log(
							chalk.green(
								"Successfully logged in! You can now continue to use Spotify from your terminal."
							)
						);
					})
					.catch((err) => {
						console.log("Failed to log in! Try again later.");
					});
			}
		);
	}

	async getNewAccessToken() {
		const refresh_token = config.get("refresh-token");
		if (refresh_token) {
			await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				// @ts-ignore
				body: new URLSearchParams({
					refresh_token: refresh_token,
					grant_type: "refresh_token",
				}),
				headers: {
					Authorization:
						"Basic " +
						new Buffer(
							process.env.CLIENT_ID +
								":" +
								process.env.CLIENT_SECRET
						).toString("base64"),
					"Content-Type": "application/x-www-form-urlencoded",
				},
			})
				.then((r) => r.json())
				.then((response) => {
					config.set("access-token", response.access_token);
					config.set(
						"expires-in",
						response.expires_in * 1000 + Date.now()
					);
					// ! TODO: REMOVE NEXT LINE
					console.warn("Access token refreshed!");
				})
				.catch((err) => {
					console.error("Failed to log in! Try again later.");
				});
		} else {
			console.log(chalk.red("You are not logged in!"));
			console.log(chalk.blue("Login to continue..."));
		}
	}
	async currentlyPlaying() {
		await this.requiresLogin();

		fetch("https://api.spotify.com/v1/me/player/currently-playing", {
			headers: this.headers,
		})
			.then(async (response) => {
				const re = await response.json();
				const tLink = link(re.item.name, re.item.external_urls.spotify);
				console.log(chalk.magenta.bold(`Currently playing: ${tLink} `));
				console.log(
					chalk.green(
						`By ` +
							chalk.blue(re.item.artists[0].name) +
							` from album `
					) + chalk.blue(re.item.album.name)
				);

				var currentTime =
					Math.floor((re.progress_ms / 1000 / 60) % 60) +
					":" +
					Math.floor((re.progress_ms / 1000) % 60);
				var totalTime =
					Math.floor((re.item.duration_ms / 1000 / 60) % 60) +
					":" +
					Math.floor((re.item.duration_ms / 1000) % 60);

				console.log(
					chalk.green(
						`\n` +
							`Progress: ` +
							chalk.blue(currentTime) +
							`/` +
							chalk.blue(totalTime)
					)
				);
				process.exit(0);
			})
			.catch((err) => {
				console.log(chalk.red("Nothing is currently playing!"));
				console.log(
					"To play a song, use play <song name> or play <song name> <artist name>"
				);
				process.exit(0);
			});
	}

	async devices(flag: number = 0) {
		await this.requiresLogin();

		const res = await fetch(
			"https://api.spotify.com/v1/me/player/devices",
			{
				headers: this.headers,
			}
		);

		const re = await res.json();

		console.log(chalk.green("Available devices:"));
		re.devices.forEach((device: any, index: number) => {
			if (device.is_active) {
				console.log(
					index + 1 + ") " + chalk.blue.bgGreen(`${device.name}`)
				);
			} else {
				console.log(index + 1 + ") " + chalk.blue(`${device.name}`));
			}
		});
		config.set("devices", re.devices);

		if (flag == 0) {
			console.log(
				`\n` +
					chalk.green(
						`To play a song, use play <song name> or play <song name> <artist name>`
					)
			);
			process.exit(0);
		}

		return re.devices;
	}

	async switchDevice(device?: number, flag: number = 0) {
		await this.requiresLogin();
		if (!device) {
			const k = await this.devices(1).then(async () => {
				await readline.question(
					"Pick a device to switch to: (press q to quit): ",
					async (num: string) => {
						if (num == "q" || num == "Q") {
							process.exit(0);
						}
						if (isNaN(parseInt(num))) {
							console.log(chalk.red("Invalid device!"));
							process.exit(0);
						}
						await this.switchDevice(parseInt(num), 1);
					}
				);
			});
		} else if (device && flag == 1) {
			const re = await fetch("https://api.spotify.com/v1/me/player", {
				method: "PUT",
				headers: this.headers,
				body: JSON.stringify({
					device_ids: [config.get("devices")[device - 1].id],
				}),
			});
			if (re.status == 204) {
				console.log(chalk.green("Switched device!"));
				process.exit(0);
			} else {
				console.log(chalk.red("Failed to switch device!"));
				process.exit(0);
			}
		} else {
			const re = await fetch("https://api.spotify.com/v1/me/player", {
				method: "PUT",
				headers: this.headers,
				body: JSON.stringify({
					device_ids: [device],
				}),
			});
			if (re.status == 204) {
				console.log(chalk.green("Switched device!"));
				process.exit(0);
			} else {
				console.log(chalk.red("Failed to switch device!"));
				process.exit(0);
			}
		}
	}

	async recentlyPlayed() {
		await this.requiresLogin();

		const re = await this.getRecentlyPlayed();

		console.log(chalk.green("Recently played:"));
		re.forEach((item: any) => {
			console.log(
				chalk.blue(item.track.name) +
					" by " +
					chalk.blue(item.track.artists[0].name)
			);
		});

		process.exit(0);
	}

	private async getRecentlyPlayed() {
		await this.requiresLogin();

		const res = await fetch(
			"https://api.spotify.com/v1/me/player/recently-played",
			{
				headers: this.headers,
			}
		);

		const re = await res.json();

		return re.items;
	}

	
}
