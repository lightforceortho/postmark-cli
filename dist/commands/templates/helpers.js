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
var traverse_1 = __importDefault(require("traverse"));
var directory_tree_1 = __importDefault(require("directory-tree"));
/**
 * Parses templates folder and files
 */
exports.createManifest = function (path) {
    var manifest = [];
    // Return empty array if path does not exist
    if (!fs_extra_1.existsSync(path))
        return manifest;
    // Find meta files and flatten into collection
    var list = exports.findMetaFiles(path);
    // Parse each directory
    list.forEach(function (file) {
        var item = exports.createManifestItem(file);
        if (item)
            manifest.push(item);
    });
    return manifest;
};
/**
 * Searches for all metadata files and flattens into a collection
 */
exports.findMetaFiles = function (path) {
    return traverse_1.default(directory_tree_1.default(path)).reduce(function (acc, file) {
        if (file.name === 'meta.json')
            acc.push(file);
        return acc;
    }, []);
};
/**
 * Gathers the template's content and metadata based on the metadata file location
 */
exports.createManifestItem = function (file) {
    var path = file.path; // Path to meta file
    var rootPath = path_1.dirname(path); // Folder path
    var htmlPath = path_1.join(rootPath, 'content.html'); // HTML path
    var textPath = path_1.join(rootPath, 'content.txt'); // Text path
    // Check if meta file exists
    if (fs_extra_1.existsSync(path)) {
        var metaFile = fs_extra_1.readJsonSync(path);
        var htmlFile = fs_extra_1.existsSync(htmlPath)
            ? fs_extra_1.readFileSync(htmlPath, 'utf-8')
            : '';
        var textFile = fs_extra_1.existsSync(textPath)
            ? fs_extra_1.readFileSync(textPath, 'utf-8')
            : '';
        return __assign({ HtmlBody: htmlFile, TextBody: textFile }, metaFile);
    }
    return null;
};
//# sourceMappingURL=helpers.js.map