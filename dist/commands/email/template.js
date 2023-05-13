"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var postmark_1 = require("postmark");
var utils_1 = require("../../utils");
exports.command = 'template [options]';
exports.desc = 'Send a templated email';
exports.builder = {
    'source-server': {
        type: 'string',
        hidden: true,
    },
    'request-host': {
        type: 'string',
        hidden: true,
    },
    id: {
        type: 'string',
        describe: 'Template ID. Required if a template alias is not specified.',
        alias: 'i',
    },
    alias: {
        type: 'string',
        describe: 'Template Alias. Required if a template ID is not specified.',
        alias: 'a',
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
    model: {
        type: 'string',
        describe: '',
        alias: 'm',
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
 * Execute templated email send command in shell
 */
var sendCommand = function (serverToken, args) {
    var id = args.id, alias = args.alias, from = args.from, to = args.to, model = args.model, requestHost = args.requestHost;
    var command = new utils_1.CommandResponse();
    command.initResponse('Sending an email');
    var client = new postmark_1.ServerClient(serverToken);
    if (requestHost !== undefined && requestHost !== '') {
        client.clientOptions.requestHost = requestHost;
    }
    sendEmailWithTemplate(client, id, alias, from, to, model)
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
var sendEmailWithTemplate = function (client, id, alias, from, to, model) {
    return client.sendEmailWithTemplate({
        TemplateId: id || undefined,
        TemplateAlias: alias || undefined,
        From: from,
        To: to,
        TemplateModel: model ? JSON.parse(model) : undefined,
    });
};
//# sourceMappingURL=template.js.map