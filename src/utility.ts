const openB = require("open");
const chalk = require("chalk");
const Conf = require("conf");
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

const config = new Conf({ projectName: "spotify-cli" });

export default class SpotifyCLI {
	constructor() {}
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
}
