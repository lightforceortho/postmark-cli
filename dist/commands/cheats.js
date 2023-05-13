"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var inquirer_1 = require("inquirer");
var lodash_1 = require("lodash");
exports.desc = false;
exports.builder = function () {
    ask();
};
var ask = function () {
    return cheatInput(enteredCode.length > 0).then(function (code) {
        checkAnswer(code);
    });
};
var enteredCode = [];
var lastEnteredCode = '⬆️';
var checkAnswer = function (code) {
    lastEnteredCode = code;
    enteredCode.push(code);
    if (code === 'START') {
        if (lodash_1.isEqual(enteredCode, superSecretAnswer)) {
            var title = chalk_1.default.yellow('PROMO CODE UNLOCKED!');
            var promoCode = chalk_1.default.bgCyan.black(superNotSoSecretPromoCode);
            console.log("\u2B50\uFE0F " + title + "\u2B50\uFE0F\nUse this promo code to receive $5 off at Postmark:\n\uD83D\uDC49 " + promoCode + " \uD83D\uDC48\n\nhttps://account.postmarkapp.com/subscription\nhttps://account.postmarkapp.com/billing_settings");
        }
        else {
            console.log('Sorry, try again!');
        }
    }
    else {
        ask();
    }
};
var cheatInput = function (hideMessage) {
    return new Promise(function (resolve) {
        var title = '🔥🔥 ENTER THY CHEAT CODE 🔥🔥\n';
        inquirer_1.prompt([
            {
                type: 'list',
                name: 'code',
                default: lastEnteredCode,
                choices: choices,
                message: hideMessage ? '\n' : title,
            },
        ]).then(function (answer) {
            return resolve(answer.code);
        });
    });
};
var choices = ['⬆️', '➡️', '⬇️', '⬅️', 'A', 'B', 'START'];
var superSecretAnswer = [
    '⬆️',
    '⬆️',
    '⬇️',
    '⬇️',
    '⬅️',
    '➡️',
    '⬅️',
    '➡️',
    'B',
    'A',
    'START',
];
var superSecretPromoCode = 'U1VQRVJDTEk1';
var superNotSoSecretPromoCode = Buffer.from(superSecretPromoCode, 'base64').toString();
//# sourceMappingURL=cheats.js.map