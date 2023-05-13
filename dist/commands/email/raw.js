"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var postmark_1 = require("postmark");
var utils_1 = require("../../utils");
exports.command = 'raw [options]';
exports.desc = 'Send a raw email';
exports.builder = {
    'server-token': {
        type: 'string',
        hidden: true,
    },
    'request-host': {
        type: 'string',
        hidden: true,
    },
    from: {
        type: 'string',
        describe: 'Email address you are sending from. Must be an address on a verified domain or confirmed Sender Signature.',
        alias: 'f',
        required: true,
    },
    to: {
        type: 'string',
        describe: 'Email address you are sending to',
        alias: 't',
        required: true,
    },
    subject: {
        type: 'string',
        describe: 'The subject line of the email',
        required: true,
    },
    html: {
        type: 'string',
        describe: 'The HTML version of the email',
    },
    text: {
        type: 'string',
        describe: 'The text version of the email',
    },
};
exports.handler = function (args) { return exec(args); };
/**
 * Execute the command
 */
var exec = function (args) {
    var serverToken = args.serverToken;
    return utils_1.validateToken(serverToken).then(function (token) {
        sendCommand(token, args);
    });
};
/**
 * Execute send command in shell
 */
var sendCommand = function (serverToken, args) {
    var from = args.from, to = args.to, subject = args.subject, html = args.html, text = args.text, requestHost = args.requestHost;
    var command = new utils_1.CommandResponse();
    command.initResponse('Sending an email');
    var client = new postmark_1.ServerClient(serverToken);
    if (requestHost !== undefined && requestHost !== '') {
        client.clientOptions.requestHost = requestHost;
    }
    sendEmail(client, from, to, subject, html, text)
        .then(function (response) {
        command.response(JSON.stringify(response));
    })
        .catch(function (error) {
        command.errorResponse(error);
    });
};
/**
 * Send the email
 *
 * @return - Promised sending response
 */
var sendEmail = function (client, from, to, subject, html, text) {
    return client.sendEmail({
        From: from,
        To: to,
        Subject: subject,
        HtmlBody: html || undefined,
        TextBody: text || undefined,
    });
};
//# sourceMappingURL=raw.js.map