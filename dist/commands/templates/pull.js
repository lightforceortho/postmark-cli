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
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var inquirer_1 = require("inquirer");
var ora_1 = __importDefault(require("ora"));
var untildify_1 = __importDefault(require("untildify"));
var postmark_1 = require("postmark");
var utils_1 = require("../../utils");
exports.command = 'pull <output directory> [options]';
exports.desc = 'Pull templates from a server to <output directory>';
exports.builder = {
    'server-token': {
        type: 'string',
        hidden: true,
    },
    'request-host': {
        type: 'string',
        hidden: true,
    },
    overwrite: {
        type: 'boolean',
        alias: 'o',
        default: false,
        describe: 'Overwrite templates if they already exist',
    },
};
exports.handler = function (args) { return exec(args); };
/**
 * Execute the command
 */
var exec = function (args) {
    var serverToken = args.serverToken;
    return utils_1.validateToken(serverToken).then(function (token) {
        pull(token, args);
    });
};
/**
 * Begin pulling the templates
 */
var pull = function (serverToken, args) {
    var outputdirectory = args.outputdirectory, overwrite = args.overwrite, requestHost = args.requestHost;
    // Check if directory exists
    if (fs_extra_1.existsSync(untildify_1.default(outputdirectory)) && !overwrite) {
        return overwritePrompt(serverToken, outputdirectory, requestHost);
    }
    return fetchTemplateList({
        sourceServer: serverToken,
        outputDir: outputdirectory,
        requestHost: requestHost,
    });
};
/**
 * Ask user to confirm overwrite
 */
var overwritePrompt = function (serverToken, outputdirectory, requestHost) {
    return inquirer_1.prompt([
        {
            type: 'confirm',
            name: 'overwrite',
            default: false,
            message: "Overwrite the files in " + outputdirectory + "?",
        },
    ]).then(function (answer) {
        if (answer.overwrite) {
            return fetchTemplateList({
                sourceServer: serverToken,
                outputDir: outputdirectory,
                requestHost: requestHost,
            });
        }
    });
};
/**
 * Fetch template list from PM
 */
var fetchTemplateList = function (options) {
    var sourceServer = options.sourceServer, outputDir = options.outputDir, requestHost = options.requestHost;
    var spinner = ora_1.default('Pulling templates from Postmark...').start();
    var client = new postmark_1.ServerClient(sourceServer);
    if (requestHost !== undefined && requestHost !== '') {
        client.clientOptions.requestHost = requestHost;
    }
    client
        .getTemplates({ count: 300 })
        .then(function (response) {
        if (response.TotalCount === 0) {
            spinner.stop();
            utils_1.log('There are no templates on this server.', { error: true });
            process.exit(1);
        }
        else {
            processTemplates({
                spinner: spinner,
                client: client,
                outputDir: outputDir,
                totalCount: response.TotalCount,
                templates: response.Templates,
            });
        }
    })
        .catch(function (error) {
        spinner.stop();
        utils_1.log(error, { error: true });
        process.exit(1);
    });
};
/**
 * Fetch each template’s content from the server
 */
var processTemplates = function (options) {
    var spinner = options.spinner, client = options.client, outputDir = options.outputDir, totalCount = options.totalCount, templates = options.templates;
    // Keep track of requests
    var requestCount = 0;
    // keep track of templates downloaded
    var totalDownloaded = 0;
    // Iterate through each template and fetch content
    templates.forEach(function (template) {
        // Show warning if template doesn't have an alias
        if (!template.Alias) {
            requestCount++;
            utils_1.log("Template named \"" + template.Name + "\" will not be downloaded because it is missing an alias.", { warn: true });
            // If this is the last template
            if (requestCount === totalCount)
                spinner.stop();
            return;
        }
        client
            .getTemplate(template.Alias)
            .then(function (response) {
            requestCount++;
            // Save template to file system
            saveTemplate(outputDir, response, client);
            totalDownloaded++;
            // Show feedback when finished saving templates
            if (requestCount === totalCount) {
                spinner.stop();
                utils_1.log("All finished! " + totalDownloaded + " " + utils_1.pluralize(totalDownloaded, 'template has', 'templates have') + " been saved to " + outputDir + ".", { color: 'green' });
            }
        })
            .catch(function (error) {
            spinner.stop();
            utils_1.log(error, { error: true });
        });
    });
};
/**
 * Save template
 * @return An object containing the HTML and Text body
 */
var saveTemplate = function (outputDir, template, client) {
    outputDir =
        template.TemplateType === 'Layout' ? path_1.join(outputDir, '_layouts') : outputDir;
    var path = untildify_1.default(path_1.join(outputDir, template.Alias));
    fs_extra_1.ensureDirSync(path);
    // Save HTML version
    if (template.HtmlBody !== '') {
        fs_extra_1.outputFileSync(path_1.join(path, 'content.html'), template.HtmlBody);
    }
    // Save Text version
    if (template.TextBody !== '') {
        fs_extra_1.outputFileSync(path_1.join(path, 'content.txt'), template.TextBody);
    }
    var meta = __assign({ Name: template.Name, Alias: template.Alias }, (template.Subject && { Subject: template.Subject }), { TemplateType: template.TemplateType }, (template.TemplateType === 'Standard' && {
        LayoutTemplate: template.LayoutTemplate,
    }));
    // Save suggested template model
    client
        .validateTemplate(__assign({}, (template.HtmlBody && { HtmlBody: template.HtmlBody }), (template.TextBody && { TextBody: template.TextBody }), meta))
        .then(function (result) {
        meta.TestRenderModel = result.SuggestedTemplateModel;
    })
        .catch(function (error) {
        utils_1.log('Error fetching suggested template model', { error: true });
        utils_1.log(error, { error: true });
    })
        .then(function () {
        // Save the file regardless of success or error when fetching suggested model
        fs_extra_1.outputFileSync(path_1.join(path, 'meta.json'), JSON.stringify(meta, null, 2));
    });
};
//# sourceMappingURL=pull.js.map