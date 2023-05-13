"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var postmark_1 = require("postmark");
var table_1 = require("table");
var utils_1 = require("../../utils");
exports.command = 'list [options]';
exports.desc = 'List the servers on your account';
exports.builder = {
    'account-token': {
        type: 'string',
        hidden: true,
    },
    'request-host': {
        type: 'string',
        hidden: true,
    },
    count: {
        type: 'number',
        describe: 'Number of servers to return',
        alias: ['c'],
    },
    offset: {
        type: 'number',
        describe: 'Number of servers to skip',
        alias: ['o'],
    },
    name: {
        type: 'string',
        describe: 'Filter servers by name',
        alias: ['n'],
    },
    json: {
        type: 'boolean',
        describe: 'Return server list as JSON',
        alias: ['j'],
    },
    'show-tokens': {
        type: 'boolean',
        describe: 'Show server tokens with server info',
        alias: ['t'],
    },
};
exports.handler = function (args) { return exec(args); };
/**
 * Execute the command
 */
var exec = function (args) {
    var accountToken = args.accountToken;
    return utils_1.validateToken(accountToken, true).then(function (token) {
        listCommand(token, args);
    });
};
/**
 * Get list of servers
 */
var listCommand = function (accountToken, args) {
    var count = args.count, offset = args.offset, name = args.name, showTokens = args.showTokens, requestHost = args.requestHost;
    var command = new utils_1.CommandResponse();
    command.initResponse('Fetching servers...');
    var client = new postmark_1.AccountClient(accountToken);
    if (requestHost !== undefined && requestHost !== '') {
        client.clientOptions.requestHost = requestHost;
    }
    getServers(client, count, offset, name)
        .then(function (response) {
        if (args.json) {
            return command.response(serverJson(response, showTokens));
        }
        return command.response(serverTable(response, showTokens));
    })
        .catch(function (error) {
        return command.errorResponse(error);
    });
};
/**
 * Fetch servers from Postmark
 */
var getServers = function (client, count, offset, name) {
    var options = __assign({}, (count && { count: count }), (offset && { offset: offset }), (name && { name: name }));
    return client.getServers(options);
};
/**
 * Return server as JSON
 */
var serverJson = function (servers, showTokens) {
    if (showTokens)
        return JSON.stringify(servers, null, 2);
    servers.Servers.forEach(function (item) {
        item.ApiTokens.forEach(function (token, index) { return (item.ApiTokens[index] = tokenMask()); });
        return item;
    });
    return JSON.stringify(servers, null, 2);
};
/**
 * Create a table with server info
 */
var serverTable = function (servers, showTokens) {
    var headings = ['Server', 'Settings'];
    var serverTable = [headings];
    // Create server rows
    servers.Servers.forEach(function (server) {
        return serverTable.push(serverRow(server, showTokens));
    });
    return table_1.table(serverTable, { border: table_1.getBorderCharacters('norc') });
};
/**
 * Create server row
 */
var serverRow = function (server, showTokens) {
    var row = [];
    var tokens = '';
    server.ApiTokens.forEach(function (token, index) {
        tokens += showTokens ? token : tokenMask();
        if (server.ApiTokens.length > index + 1)
            tokens += '\n';
    });
    // Name column
    var name = chalk_1.default.white.bgHex(colorMap[server.Color])('  ') +
        (" " + chalk_1.default.bold.white(server.Name)) +
        chalk_1.default.gray("\nID: " + server.ID) +
        ("\n" + chalk_1.default.gray(server.ServerLink)) +
        ("\n\n" + chalk_1.default.bold.white('Server API Tokens') + "\n") +
        tokens;
    row.push(name);
    // Settings column
    var settings = "SMTP: " + exports.stateLabel(server.SmtpApiActivated) +
        ("\nOpen Tracking: " + exports.stateLabel(server.TrackOpens)) +
        ("\nLink Tracking: " + exports.linkTrackingStateLabel(server.TrackLinks)) +
        ("\nInbound: " + exports.stateLabel(server.InboundHookUrl !== ''));
    row.push(settings);
    return row;
};
var tokenMask = function () { return '•'.repeat(36); };
exports.stateLabel = function (state) {
    return state ? chalk_1.default.green('Enabled') : chalk_1.default.gray('Disabled');
};
exports.linkTrackingStateLabel = function (state) {
    switch (state) {
        case 'TextOnly':
            return chalk_1.default.green('Text');
        case 'HtmlOnly':
            return chalk_1.default.green('HTML');
        case 'HtmlAndText':
            return chalk_1.default.green('HTML and Text');
        default:
            return chalk_1.default.gray('Disabled');
    }
};
var colorMap = {
    purple: '#9C73D2',
    blue: '#21CDFE',
    turquoise: '#52F3ED',
    green: '#3BE380',
    red: '#F35A3D',
    orange: '#FE8421',
    yellow: '#FFDE00',
    grey: '#929292',
};
//# sourceMappingURL=list.js.map