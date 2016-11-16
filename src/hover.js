'use strict';

const vscode = require('vscode');
const html = require('./htmlHover');

/**
 * Class used for hover info that implements HoverProvider.
 */
module.exports = (function () {
    /**
     * Constructor.
     */
    function Hover() {
    }

    /**
     * Provide hover info for the given position within the document.
     * 
     * @param {TextDocument} document - The document in which the command was invoked.
     * @param {Position} position - The position at which the command was invoked.
     * @param {CancellationToken} - A cancelation token.
     * @return {Promise} - A promise that resolves to a Hover object.
     */
    Hover.prototype.provideHover = function provideHover(document, position, token) {
        return new Promise(function (resolve, reject) {
            
            // find containing template string if one exists
            const templateRegExp = /(template\s*:\s*`)([^`]*)`/g;
            const text = document.getText();
            const pos = document.offsetAt(position);
            let match = null;
            let resolved = false;

            while ((match = templateRegExp.exec(text)) !== null) {
                if (pos > match.index + match[1].length && pos < match.index + match[0].length) {
                    resolve(html.createHover(
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

    return Hover;
}());