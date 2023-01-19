#! /usr/bin/env node

const { Command } = require("commander");
const chalk = require('chalk');
const open = require('open');

const program = new Command();

program
    .name("Spotify CLI Utility")
    .description(chalk.green("Control Your Spotify Client from your Terminal."))
    .version("1.0.0");

program
    .command("version")
    .description("Get current version")
    .action(() => {
        console.log("Version 1.0.0");
    });

program
    .command("login")
    .description("Authenticate with Spotify")
    .action(() => {
        console.log("Authenticating with Spotify...");
        // TODO: Implement Authentication
    });

program
    .command("browse")
    .description("Open the search term in spotify web browser")
    .argument("<input>")
    .action(async (input) => {
        console.log(`Opening ${input} in Spotify Web Browser...`);
        await open(`https://open.spotify.com/search/${input}`);
        
        console.log(chalk.green("If your browser doesn't open automatically, please open the following link manually:"));
        console.log(chalk.underline.blue(`https://open.spotify.com/search/${input}`));
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


program.parse();
