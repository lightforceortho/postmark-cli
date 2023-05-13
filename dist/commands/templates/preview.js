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
var fs_extra_1 = require("fs-extra");
var lodash_1 = require("lodash");
var untildify_1 = __importDefault(require("untildify"));
var express_1 = __importDefault(require("express"));
var watch_1 = require("watch");
var consolidate_1 = __importDefault(require("consolidate"));
var postmark_1 = require("postmark");
var helpers_1 = require("./helpers");
var utils_1 = require("../../utils");
var path_1 = __importDefault(require("path"));
var previewPath = path_1.default.join(__dirname, 'preview');
var templateLinks = '<base target="_blank" />';
exports.command = 'preview  <templates directory> [options]';
exports.desc = 'Preview your templates and layouts';
exports.builder = {
    'server-token': {
        type: 'string',
        hidden: true,
    },
    port: {
        type: 'number',
        describe: 'The port to open up the preview server on',
        default: 3005,
        alias: 'p',
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
var validateDirectory = function (serverToken, args) {
    var templatesdirectory = args.templatesdirectory;
    var rootPath = untildify_1.default(templatesdirectory);
    // Check if path exists
    if (!fs_extra_1.existsSync(rootPath)) {
        utils_1.log('The provided path does not exist', { error: true });
        return process.exit(1);
    }
    return preview(serverToken, args);
};
/**
 * Preview
 */
var preview = function (serverToken, args) {
    var port = args.port, templatesdirectory = args.templatesdirectory;
    utils_1.log(title + " Starting template preview server...");
    // Start server
    var app = express_1.default();
    var server = require('http').createServer(app);
    var io = require('socket.io')(server);
    // Cache manifest and Postmark server
    var client = new postmark_1.ServerClient(serverToken);
    var manifest = helpers_1.createManifest(templatesdirectory);
    // Static assets
    app.use(express_1.default.static(previewPath + "/assets"));
    var updateEvent = function () {
        // Generate new manifest
        manifest = helpers_1.createManifest(templatesdirectory);
        // Trigger reload on client
        utils_1.log(title + " File changed. Reloading browser...");
        io.emit('change');
    };
    // Watch for file changes
    watch_1.createMonitor(untildify_1.default(templatesdirectory), { interval: 2 }, function (monitor) {
        monitor.on('created', lodash_1.debounce(updateEvent, 1000));
        monitor.on('changed', lodash_1.debounce(updateEvent, 1000));
        monitor.on('removed', lodash_1.debounce(updateEvent, 1000));
    });
    // Template listing
    app.get('/', function (req, res) {
        manifest = helpers_1.createManifest(templatesdirectory);
        var templates = lodash_1.filter(manifest, { TemplateType: 'Standard' });
        var layouts = lodash_1.filter(manifest, { TemplateType: 'Layout' });
        var path = untildify_1.default(templatesdirectory).replace(/\/$/, '');
        consolidate_1.default.ejs(previewPath + "/index.ejs", { templates: templates, layouts: layouts, path: path }, function (err, html) { return renderTemplateContents(res, err, html); });
    });
    /**
     * Get template by alias
     */
    app.get('/:alias', function (req, res) {
        var template = lodash_1.find(manifest, { Alias: req.params.alias });
        if (template) {
            consolidate_1.default.ejs(previewPath + "/template.ejs", { template: template }, function (err, html) { return renderTemplateContents(res, err, html); });
        }
        else {
            // Redirect to index
            return res.redirect(301, '/');
        }
    });
    /**
     * Get template HTML version by alias
     */
    app.get('/html/:alias', function (req, res) {
        var template = lodash_1.find(manifest, { Alias: req.params.alias });
        if (template && template.HtmlBody) {
            var layout = lodash_1.find(manifest, { Alias: template.LayoutTemplate });
            // Render error if layout is specified, but HtmlBody is empty
            if (layout && !layout.HtmlBody)
                return renderTemplateInvalid(res, layoutError);
            var TemplateType = template.TemplateType, TestRenderModel = template.TestRenderModel;
            var payload = {
                HtmlBody: getSource('html', template, layout),
                TemplateType: TemplateType,
                TestRenderModel: TestRenderModel,
                Subject: template.Subject,
            };
            return validateTemplateRequest('html', payload, res);
        }
        else {
            return renderTemplate404(res, 'HTML');
        }
    });
    /**
     * Get template text version by alias
     */
    app.get('/text/:alias', function (req, res) {
        var template = lodash_1.find(manifest, { Alias: req.params.alias });
        if (template && template.TextBody) {
            var layout = lodash_1.find(manifest, { Alias: template.LayoutTemplate });
            // Render error if layout is specified, but HtmlBody is empty
            if (layout && !layout.TextBody)
                return renderTemplateInvalid(res, layoutError);
            var TemplateType = template.TemplateType, TestRenderModel = template.TestRenderModel;
            var payload = {
                TextBody: getSource('text', template, layout),
                TemplateType: TemplateType,
                TestRenderModel: TestRenderModel,
            };
            return validateTemplateRequest('text', payload, res);
        }
        else {
            return renderTemplate404(res, 'Text');
        }
    });
    server.listen(port, function () {
        var url = "http://localhost:" + port;
        utils_1.log(title + " Template preview server ready. Happy coding!");
        utils_1.log(divider);
        utils_1.log("URL: " + chalk_1.default.green(url));
        utils_1.log(divider);
    });
    var validateTemplateRequest = function (version, payload, res) {
        var versionKey = version === 'html' ? 'HtmlBody' : 'TextBody';
        // Make request to Postmark
        client
            .validateTemplate(payload)
            .then(function (result) {
            if (result[versionKey].ContentIsValid) {
                var renderedContent = result[versionKey].RenderedContent + templateLinks;
                io.emit('subject', __assign({}, result.Subject, { rawSubject: payload.Subject }));
                // Render raw source if HTML
                if (version === 'html') {
                    return res.send(renderedContent);
                }
                else {
                    // Render specific EJS with text content
                    return renderTemplateText(res, renderedContent);
                }
            }
            return renderTemplateInvalid(res, result[versionKey].ValidationErrors);
        })
            .catch(function (error) {
            return res.status(500).send(error);
        });
    };
};
var combineTemplate = function (layout, template) {
    return lodash_1.replace(layout, /({{{)(.?@content.?)(}}})/g, template);
};
/* Console helpers */
var title = "" + chalk_1.default.yellow('ﾐ▢ Postmark') + chalk_1.default.gray(':');
var divider = chalk_1.default.gray('-'.repeat(34));
/* Render Templates */
var getSource = function (version, template, layout) {
    var versionKey = version === 'html' ? 'HtmlBody' : 'TextBody';
    if (layout)
        return combineTemplate(layout[versionKey], template[versionKey]);
    return template[versionKey];
};
var renderTemplateText = function (res, body) {
    return consolidate_1.default.ejs(previewPath + "/templateText.ejs", { body: body }, function (err, html) {
        return renderTemplateContents(res, err, html);
    });
};
var renderTemplateInvalid = function (res, errors) {
    return consolidate_1.default.ejs(previewPath + "/templateInvalid.ejs", { errors: errors }, function (err, html) { return renderTemplateContents(res, err, html); });
};
var renderTemplate404 = function (res, version) {
    return consolidate_1.default.ejs(previewPath + "/template404.ejs", { version: version }, function (err, html) {
        return renderTemplateContents(res, err, html);
    });
};
var renderTemplateContents = function (res, err, html) {
    if (err)
        return res.send(err);
    return res.send(html);
};
var layoutError = [
    {
        Message: 'A TemplateLayout is specified, but it is either empty or missing.',
    },
];
//# sourceMappingURL=preview.js.map