import { Command } from "commander";
import chalk from 'chalk';

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



program.parse();
