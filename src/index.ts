#! /usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const Conf = require("conf");
const program = new Command();

const config = new Conf({ projectName: "spotify-cli" });
config.set("Developer", "Surya Teja Reddy");
import SpotifyCLI from "./utility";
const sp = new SpotifyCLI();
// ! Import the version from package.json
const { version } = require("../package.json");
require("dotenv").config();

program
	.name("Spotify CLI Utility")
	.description(chalk.green("Control Your Spotify Client from your Terminal."))
	.version(version);

program
	.command("version")
	.description("Get current version")
	.action(() => {
		console.log(`Version ${version}`);
		process.exit(0);
	});

program
	.command("login")
	.description("Authenticate with Spotify")
	.action(() => {
		sp.login();
	});

program
	.command("logout")
	.description("Logout from Spotify")
	.action(() => {
		config.clear();
		console.log(chalk.blue("Logged out successfully!"));
		process.exit(0);
	});

program
	.command("browse")
	.description("Open the search term in spotify web browser")
	.argument("<input>")
	.action((input: string) => {
		sp.browse(input);
		process.exit(0);
	});

program
	.command("devices")
	.description("List all available devices")
	.action(() => {
		sp.devices();
	});

program
	.command("switch")
	.description("Switch to a different device")
	.option("-d, --device <device>", "Device ID")
	.action((options: { device?: number }) => {
		sp.switchDevice(options.device);
	});

program
	.command("current")
	.description("List the currently playing track with details.")
	.action(() => {
		sp.currentlyPlaying();
	});

program
	.command("history")
	.description("List your recently played tracks.")
	.action(() => {
		sp.recentlyPlayed();
	});

program
	.command("play")
	.description("Play a track")
	.option("-t, --track <track>", "Track Name")
	.option("-a, --artist <artist>", "Artist Name")
	.option("-al, --album <album>", "Album Name")
	.option(
		"-p, --playlist <playlist>",
		"Playlist Name to play current user's playlist"
	)
	.option("-d, --device <device>", "Device ID")
	.action(
		(options: {
			track?: string;
			artist?: string;
			playlist?: string;
			device?: number;
			album?: string;
		}) => {
			sp.play(
				options.track,
				options.artist,
				options.playlist,
				options.device,
				options.album
			);
		}
	);

program
	.command("pause")
	.description("Pause the currently playing track")
	.action(() => {
		sp.pause();
	});

program
	.command("dev")
	.description("Developer Info")
	.action(() => {
		console.log(config.store);
		process.exit(0);
	});

program
	.command("next")
	.description("Skip to the next track")
	.action(() => {
		sp.next();
	});

program
	.command("prev")
	.description("Skip to the previous track")
	.action(() => {
		sp.previous();
	});

program
	.command("queue")
	.description("Add a track to the queue")
	.argument("<input>")
	.action((input: string) => {
		sp.queue(input);
	});

program
	.command("repeat")
	.description("Set repeat mode")
	.argument("<input>")
	.action((input: string) => {
		const inputs = ["off", "track", "context"];
		if (!inputs.includes(input)) {
			console.log(
				chalk.red(
					"Invalid input. Please enter one of the following: off, track, context"
				)
			);
			process.exit(1);
		}
		// @ts-ignore
		sp.repeat(input);
	});

program
	.command("shuffle")
	.description("Toggle shuffle")
	.argument("<input>")
	.action((input: string) => {
		const inputs = ["on", "off"];
		if (!inputs.includes(input)) {
			console.log(
				chalk.red(
					"Invalid input. Please enter one of the following: on, off"
				)
			);
			process.exit(1);
		}
		// @ts-ignore
		sp.shuffle(input);
	});

program.parse();
