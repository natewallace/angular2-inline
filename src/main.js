'use strict';

const vscode = require('vscode');
const Completion = require('./completion');
const Highlight = require('./highlight');
const Hover = require('./hover');

/**
 * Entry point for extension.
 * 
 * @param {ExtensionContext} context - The extension context object.
 */
module.exports.activate = function activate(context) {
    vscode.languages.registerCompletionItemProvider(['typescript', 'javascript'], new Completion(), '<');
    vscode.languages.registerDocumentHighlightProvider(['typescript', 'javascript'], new Highlight());
    vscode.languages.registerHoverProvider(['typescript', 'javascript'], new Hover());
}