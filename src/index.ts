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
	});

program
	.command("login")
	.description("Authenticate with Spotify")
	.action(() => {
		// ! TODO: Implement Login
		sp.login();
	});

program
	.command("logout")
	.description("Logout from Spotify")
	.action(() => {
		config.clear();
		console.log(chalk.blue("Logged out successfully!"));
	});

program
	.command("browse")
	.description("Open the search term in spotify web browser")
	.argument("<input>")
	.action((input: string) => {
		sp.browse(input);
	});

program
	.command("devices")
	.description("List all available devices")
	.action(() => {
		console.log("Listing all available devices...");
		// TODO: Implement Listing Devices
	});

program
	.command("history")
	.description("List your recently played tracks.")
	.action(() => {
		// TODO: Implement Listing History
	});

program
	.command("dev")
	.description("Developer Info")
	.action(() => {
		console.log(config.store);
	});

program.parse();

export { config };
