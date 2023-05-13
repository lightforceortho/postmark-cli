"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var inquirer_1 = require("inquirer");
var ora = require("ora");
/**
 * Bootstrap commands
 * @returns yargs compatible command options
 */
exports.cmd = function (name, desc) { return ({
    name: name,
    command: name + " <command> [options]",
    desc: desc,
    builder: function (yargs) { return yargs.commandDir("commands/" + name); },
}); };
/**
 * Pluralize a string
 * @returns The proper string depending on the count
 */
exports.pluralize = function (count, singular, plural) { return (count > 1 || count === 0 ? plural : singular); };
/**
 * Log stuff to the console
 * @returns Logging with fancy colors
 */
exports.log = function (text, settings) {
    // Errors
    if (settings && settings.error) {
        return console.error(chalk_1.default.red(text));
    }
    // Warnings
    if (settings && settings.warn) {
        return console.warn(chalk_1.default.yellow(text));
    }
    // Custom colors
    if (settings && settings.color) {
        return console.log(chalk_1.default[settings.color](text));
    }
    // Default
    return console.log(text);
};
/**
 * Prompt for server or account tokens
 * @returns Promise
 */
exports.serverTokenPrompt = function (account) {
    return new Promise(function (resolve, reject) {
        var tokenType = account ? 'account' : 'server';
        inquirer_1.prompt([
            {
                type: 'password',
                name: 'token',
                message: "Please enter your " + tokenType + " token",
                mask: '•',
            },
        ]).then(function (answer) {
            var token = answer.token;
            if (!token) {
                exports.log("Invalid " + tokenType + " token", { error: true });
                process.exit(1);
                return reject();
            }
            return resolve(token);
        });
    });
};
/**
 * Validates the presence of a server or account token
 * @return Promise
 */
exports.validateToken = function (token, account) {
    if (account === void 0) { account = false; }
    return new Promise(function (resolve) {
        // Missing token
        if (!token) {
            return exports.serverTokenPrompt(account).then(function (tokenPrompt) {
                return resolve(tokenPrompt);
            });
        }
        return resolve(token);
    });
};
/**
 * Handle starting/stopping spinner and console output
 */
var CommandResponse = /** @class */ (function () {
    function CommandResponse() {
        this.spinner = ora().clear();
    }
    CommandResponse.prototype.initResponse = function (message) {
        this.spinner = ora(message).start();
    };
    CommandResponse.prototype.response = function (text, settings) {
        this.spinner.stop();
        exports.log(text, settings);
    };
    CommandResponse.prototype.errorResponse = function (error, showJsonError) {
        if (showJsonError === void 0) { showJsonError = false; }
        this.spinner.stop();
        if (showJsonError === true) {
            exports.log(JSON.stringify(error), { error: true });
        }
        exports.log(error, { error: true });
        process.exit(1);
    };
    return CommandResponse;
}());
exports.CommandResponse = CommandResponse;
//# sourceMappingURL=utils.js.map