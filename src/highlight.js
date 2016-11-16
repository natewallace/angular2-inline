'use strict';

const vscode = require('vscode');
const html = require('./htmlHighlight');

/**
 * Class used for highlights that implements DocumentHighlightProvider.
 */
module.exports = (function () {
    /**
     * Constructor.
     */
    function Highlight() {
    }

    /**
     * Provide highlights for the given position within the document.
     * 
     * @param {TextDocument} document - The document in which the command was invoked.
     * @param {Position} position - The position at which the command was invoked.
     * @param {CancellationToken} - A cancelation token.
     * @return {Promise} - A promise that resolves to an array of DocumentHighlight objects.
     */
    Highlight.prototype.provideDocumentHighlights = function provideDocumentHighlights(document, position, token) {
        return new Promise(function (resolve, reject) {
            
            // find containing template string if one exists
            const templateRegExp = /(template\s*:\s*`)([^`]*)`/g;
            const text = document.getText();
            const pos = document.offsetAt(position);
            let match = null;
            let resolved = false;

            while ((match = templateRegExp.exec(text)) !== null) {
                if (pos > match.index + match[1].length && pos < match.index + match[0].length) {
                    resolve(html.createHighlights(
                        match[2], 
                        pos - match[1].length - match.index, 
                        match.index + match[1].length,
                        document));
                    resolved = true;
                    break;
                }
            }

            if (!resolved) {
                resolve([]);
            }
        });
    };

    return Highlight;
}());