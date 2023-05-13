"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var ora_1 = __importDefault(require("ora"));
var lodash_1 = require("lodash");
var inquirer_1 = require("inquirer");
var table_1 = require("table");
var untildify_1 = __importDefault(require("untildify"));
var fs_extra_1 = require("fs-extra");
var helpers_1 = require("./helpers");
var postmark_1 = require("postmark");
var utils_1 = require("../../utils");
var pushManifest = [];
exports.command = 'push <templates directory> [options]';
exports.desc = 'Push templates from <templates directory> to a Postmark server';
exports.builder = {
    'server-token': {
        type: 'string',
        hidden: true,
    },
    'request-host': {
        type: 'string',
        hidden: true,
    },
    force: {
        type: 'boolean',
        describe: 'Disable confirmation before pushing templates',
        alias: 'f',
    },
    all: {
        type: 'boolean',
        describe: 'Push all local templates up to Postmark regardless of whether they changed',
        alias: 'a',
    },
};
exports.handler = function (args) { return exec(args); };
/**
 * Execute the command
 */
var exec = function (args) {
    var serverToken = args.serverToken;
    return utils_1.validateToken(serverToken).then(function (token) {
        validateDirectory(token, args);
    });
};
/**
 * Check if directory exists before pushing
 */
var validateDirectory = function (serverToken, args) {
    var rootPath = untildify_1.default(args.templatesdirectory);
    // Check if path exists
    if (!fs_extra_1.existsSync(rootPath)) {
        utils_1.log('The provided path does not exist', { error: true });
        return process.exit(1);
    }
    return push(serverToken, args);
};
/**
 * Begin pushing the templates
 */
var push = function (serverToken, args) {
    var templatesdirectory = args.templatesdirectory, force = args.force, requestHost = args.requestHost, all = args.all;
    var spinner = ora_1.default('Fetching templates...').start();
    var manifest = helpers_1.createManifest(templatesdirectory);
    var client = new postmark_1.ServerClient(serverToken);
    if (requestHost !== undefined && requestHost !== '') {
        client.clientOptions.requestHost = requestHost;
    }
    // Make sure manifest isn't empty
    if (manifest.length > 0) {
        // Get template list from Postmark
        client
            .getTemplates({ count: 300 })
            .then(function (response) {
            // Check if there are templates on the server
            if (response.TotalCount === 0) {
                processTemplates({
                    templates: {
                        Templates: [],
                        TotalCount: 0
                    },
                    manifest: manifest,
                    all: all,
                    force: force,
                    spinner: spinner,
                    client: client,
                });
            }
            else {
                processTemplates({
                    templates: response,
                    manifest: manifest,
                    all: all,
                    force: force,
                    spinner: spinner,
                    client: client,
                });
            }
        })
            .catch(function (error) {
            spinner.stop();
            utils_1.log(error, { error: true });
            process.exit(1);
        });
    }
    else {
        spinner.stop();
        utils_1.log('No templates or layouts were found.', { error: true });
        process.exit(1);
    }
};
/**
 * Compare templates and CLI flow
 */
var processTemplates = function (config) {
    var templates = config.templates, manifest = config.manifest, all = config.all, force = config.force, spinner = config.spinner, client = config.client;
    compareTemplates(templates, manifest, all);
    spinner.stop();
    if (pushManifest.length === 0)
        return utils_1.log('There are no changes to push.');
    // Show which templates are changing
    printReview(review);
    // Push templates if force arg is present
    if (force) {
        spinner.text = 'Pushing templates to Postmark...';
        spinner.start();
        return pushTemplates(spinner, client, pushManifest);
    }
    // Ask for user confirmation
    confirmation().then(function (answer) {
        if (answer.confirm) {
            spinner.text = 'Pushing templates to Postmark...';
            spinner.start();
            pushTemplates(spinner, client, pushManifest);
        }
        else {
            utils_1.log('Canceling push. Have a good day!');
        }
    });
};
/**
 * Ask user to confirm the push
 */
var confirmation = function () {
    return new Promise(function (resolve, reject) {
        inquirer_1.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                default: false,
                message: "Would you like to continue?",
            },
        ])
            .then(function (answer) { return resolve(answer); })
            .catch(function (err) { return reject(err); });
    });
};
/**
 * Compare templates on server against local
 */
var compareTemplates = function (response, manifest, pushAll) {
    // Iterate through manifest
    manifest.forEach(function (template) {
        // See if this local template exists on the server
        var match = lodash_1.find(response.Templates, { Alias: template.Alias });
        template.New = !match;
        // New template
        if (!match) {
            template.Status = chalk_1.default.green('Added');
            return pushTemplatePreview(match, template);
        }
        // Push all templates if --all argument is present,
        // regardless of whether templates were modified
        if (pushAll) {
            return pushTemplatePreview(match, template);
        }
    });
};
/**
 * Push template details to review table
 */
var pushTemplatePreview = function (match, template) {
    pushManifest.push(template);
    var reviewData = [template.Status, template.Name, template.Alias];
    // Push layout to review table
    if (template.TemplateType === 'Layout')
        return review.layouts.push(reviewData);
    // Push template to review table
    // Add layout used column
    reviewData.push(layoutUsedLabel(template.LayoutTemplate, match ? match.LayoutTemplate : template.LayoutTemplate));
    return review.templates.push(reviewData);
};
/**
 * Render the "Layout used" column for Standard templates
 */
var layoutUsedLabel = function (localLayout, serverLayout) {
    var label = localLayout ? localLayout : chalk_1.default.gray('None');
    // If layout template on server doesn't match local template
    if (localLayout !== serverLayout) {
        serverLayout = serverLayout ? serverLayout : 'None';
        // Append old server layout to label
        label += chalk_1.default.red("  \u2718 " + serverLayout);
    }
    return label;
};
/**
 * Show which templates will change after the publish
 */
var printReview = function (review) {
    var templates = review.templates, layouts = review.layouts;
    // Table headers
    var header = [chalk_1.default.gray('Status'), chalk_1.default.gray('Name'), chalk_1.default.gray('Alias')];
    var templatesHeader = header.concat([chalk_1.default.gray('Layout used')]);
    // Labels
    var templatesLabel = templates.length > 0
        ? templates.length + " " + utils_1.pluralize(templates.length, 'template', 'templates')
        : '';
    var layoutsLabel = layouts.length > 0
        ? layouts.length + " " + utils_1.pluralize(layouts.length, 'layout', 'layouts')
        : '';
    // Log template and layout files
    if (templates.length > 0) {
        utils_1.log("\n" + templatesLabel);
        utils_1.log(table_1.table([templatesHeader].concat(templates), {
            border: table_1.getBorderCharacters('norc'),
        }));
    }
    if (layouts.length > 0) {
        utils_1.log("\n" + layoutsLabel);
        utils_1.log(table_1.table([header].concat(layouts), { border: table_1.getBorderCharacters('norc') }));
    }
    // Log summary
    utils_1.log(chalk_1.default.yellow("" + templatesLabel + (templates.length > 0 && layouts.length > 0 ? ' and ' : '') + layoutsLabel + " will be pushed to Postmark."));
};
/**
 * Push all local templates
 */
var pushTemplates = function (spinner, client, templates) {
    templates.forEach(function (template) {
        return pushTemplate(spinner, client, template, templates.length);
    });
};
/**
 * Determine whether to create a new template or edit an existing
 */
var pushTemplate = function (spinner, client, template, total) {
    if (template.New) {
        return client
            .createTemplate(template)
            .then(function (response) {
            return pushComplete(true, response, template, spinner, total);
        })
            .catch(function (response) {
            return pushComplete(false, response, template, spinner, total);
        });
    }
    return client
        .editTemplate(template.Alias, template)
        .then(function (response) {
        return pushComplete(true, response, template, spinner, total);
    })
        .catch(function (response) {
        return pushComplete(false, response, template, spinner, total);
    });
};
/**
 * Run each time a push has been completed
 */
var pushComplete = function (success, response, template, spinner, total) {
    // Update counters
    results[success ? 'success' : 'failed']++;
    var completed = results.success + results.failed;
    // Log any errors to the console
    if (!success) {
        spinner.stop();
        utils_1.log("\n" + template.Alias + ": " + response.toString(), { error: true });
        spinner.start();
    }
    if (completed === total) {
        spinner.stop();
        utils_1.log('✅ All finished!', { color: 'green' });
        // Show failures
        if (results.failed) {
            utils_1.log("\u26A0\uFE0F Failed to push " + results.failed + " " + utils_1.pluralize(results.failed, 'template', 'templates') + ". Please see the output above for more details.", { error: true });
        }
    }
};
var results = {
    success: 0,
    failed: 0,
};
var review = {
    layouts: [],
    templates: [],
};
//# sourceMappingURL=push.js.map