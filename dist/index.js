#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
require('yargonaut')
    .style('yellow')
    .errorsStyle('red');
require('yargs')
    .env('POSTMARK')
    .commandDir('commands')
    .demandCommand()
    .help()
    .usage(chalk_1.default.yellow("\n              ____           _                        _    \n _________   |  _ \\ ___  ___| |_ _ __ ___   __ _ _ __| | __\n| \\     / |  | |_) / _ \\/ __| __| '_ ' _ \\ / _` | '__| |/ /\n|  '...'  |  |  __/ (_) \\__ \\ |_| | | | | | (_| | |  |   < \n|__/___\\__|  |_|   \\___/|___/\\__|_| |_| |_|\\__,_|_|  |_|\\_\\")).argv;
//# sourceMappingURL=index.js.map