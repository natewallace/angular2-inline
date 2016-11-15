'use strict';

const vscode = require('vscode');
const html = require('./html');

/**
 * Class used for code completion that implements CompletionItemProvider.
 */
module.exports = (function () {
    /**
     * Constructor.
     */
    function Completion() {
    }

    /**
     * Provide completion items for the given position within the document.
     * 
     * @param {TextDocument} document - The document in which the command was invoked.
     * @param {Position} position - The position at which the command was invoked.
     * @param {CancellationToken} - A cancelation token.
     * @return {Promise} - A promise that resolves to an array of CompletionItem objects.
     */
    Completion.prototype.provideCompletionItems = function provideCompletionItems(document, position, token) {
        return new Promise(function (resolve, reject) {
            
            // find containing template string if one exists
            const templateRegExp = /(template\s*:\s*`)([^`]*)`/g;
            const text = document.getText();
            const pos = document.offsetAt(position);
            let match = null;

            while ((match = templateRegExp.exec(text)) !== null) {
                if (pos > match.index + match[1].length && pos < match.index + match[0].length) {
                    resolve(html.createCompletions(match[2], pos - match[1].length - match.index));
                }
                break;
            }
        });
    };

    /**
     * Given a completion item fill in more data, like doc-comment or details.
     * The editor will only resolve a completion item once.
     *
     * @param {CompletionItem} item - The document in which the command was invoked.
     * @param {CancellationToken} token - A cancelation token.
     * @return {CompletionItem} - The resolved completion item
     */
    Completion.prototype.resolveCompletionItem = function provideCompletionItems(item, token) {
        return item;
    };

    return Completion;
}());