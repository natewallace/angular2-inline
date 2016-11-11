const vscode = require('vscode');
const Completion = require('./completion');

/**
 * Entry point for extension.
 * 
 * @param {ExtensionContext} context - The extension context object.
 */
module.exports.activate = function activate(context) {
    vscode.languages.registerCompletionItemProvider('typescript', new Completion(), '<');
}