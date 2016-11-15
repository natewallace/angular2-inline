'use strict';

const spec = require('./htmlSpec');
const Html = require('./htmlScanner'); 
const vscode = require('vscode');

/**
 * Parse the given text to get the element at the given position.
 * 
 * @param {string} text - The html text to parse.
 * @param {number} pos - The current zero based cursor position relative to the text parameter.
 * @return {object} - The element at the given position or null if there isn't one.
 */
function parseForElement(text, pos) {
    const scanner = Html.createScanner(text);

    while (scanner.scan() !== Html.TokenType.EOS) {        
        switch (scanner.getTokenType()) {

            // start tag
            case Html.TokenType.StartTag:
                if (pos >= scanner.getTokenOffset() && pos <= scanner.getTokenOffset() + scanner.getTokenText().length) {
                    return {
                        name: scanner.getTokenText(),
                        label: '<' + scanner.getTokenText() + '>',
                        offset: scanner.getTokenOffset(),
                        endOffset: scanner.getTokenOffset() + scanner.getTokenLength()
                    };
                }
                break;

            // end tag
            case Html.TokenType.EndTag:
                if (pos >= scanner.getTokenOffset() && pos <= scanner.getTokenOffset() + scanner.getTokenText().length) {
                    return {
                        name: scanner.getTokenText(),
                        label: '</' + scanner.getTokenText() + '>',
                        offset: scanner.getTokenOffset(),
                        endOffset: scanner.getTokenOffset() + scanner.getTokenLength()
                    };
                }
                break;             

            // check for bail out
            default:
                if (pos <= scanner.getTokenOffset()) {
                    return null;
                }
                break;
        }
    }

    return null;
}

/**
 * Escape any markdown syntax.  This function is taken from the VSCode project.
 * 
 * @param {string} text - The text to escape for markdown.
 * @return {string} - The markdown safe text.
 */
function textToMarkedString(text) {
    if (!text) {
        return '';
    }
	return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&'); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
}

/**
 * Create hover info based on position in the html text.
 * 
 * @param {string} text - The html text to create hover info for.
 * @param {number} pos - The position within the html text to create hover info for.
 * @param {number} textOffset - The offset of the text within the entire document.
 * @param {TextDocument} document - The document to create hover info for.
 * @return {Hover} - The hover info to display.
 */
module.exports.createHover = function createCompletions(text, pos, textOffset, document) {
    const element = parseForElement(text, pos);
    if (!element) {
        return null;
    }

    const tag = spec.getTag(element.name);
    if (tag) {
        return new vscode.Hover(
            [{ language: 'html', value: element.label }, textToMarkedString(tag.documentation)],
            new vscode.Range(document.positionAt(textOffset + element.offset), document.positionAt(textOffset + element.endOffset)));
    }

    return null;
}