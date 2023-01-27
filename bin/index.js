#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Command } = require("commander");
const chalk = require("chalk");
const Conf = require("conf");
const program = new Command();
const config = new Conf({ projectName: "spotify-cli" });
config.set("Developer", "Surya Teja Reddy");
const utility_1 = __importDefault(require("./utility"));
const sp = new utility_1.default();
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
    .action((input) => {
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
    .action((options) => {
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
    .command("dev")
    .description("Developer Info")
    .action(() => {
    console.log(config.store);
    process.exit(0);
});
program.parse();
