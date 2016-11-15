'use strict';

const spec = require('./htmlSpec');
const Html = require('./htmlScanner'); 
const vscode = require('vscode');

/**
 * Parse the given text to get the ranges for open and close elements.
 * 
 * @param {string} text - The html text to parse.
 * @param {number} pos - The current zero based cursor position relative to the text parameter.
 * @return {object} - An object that contains the ranges for open and closing elements.
 */
function parseForElement(text, pos) {
    const scanner = Html.createScanner(text);
    const elementStack = [];
    let found = false;
    let pop = false;

    while (scanner.scan() !== Html.TokenType.EOS) {        
        switch (scanner.getTokenType()) {

            // start tag
            case Html.TokenType.StartTag:
                const element = {
                    name: scanner.getTokenText(),
                    offset: scanner.getTokenOffset(),
                    endOffset: scanner.getTokenOffset() + scanner.getTokenLength()
                };
                element.isHighlight = pos >= element.offset && pos <= element.endOffset;
                if (element.isHighlight) {
                    found = true;
                }
                elementStack.push(element);
                break;

            // start tag closed
            case Html.TokenType.StartTagClose:
                if (elementStack.length > 0) {                
                    pop = spec.isEmptyTag(elementStack[elementStack.length - 1].name);
                }
                break;        

            // end tag
            case Html.TokenType.EndTag:
                pop = true;
                break;     

            // check for bail out
            default:
                if (!found && pos <= scanner.getTokenOffset()) {
                    return null;
                }
                break;
        }

        // remove the last added element and set top element to latest
        if (pop) {
            pop = false;
            if (elementStack.length > 0) {

                // check for matching tag
                const element = elementStack[elementStack.length - 1];
                const tokenText = scanner.getTokenText();
                const tokenOffset = scanner.getTokenOffset();
                const isHighlight = element.isHighlight || (pos >= tokenOffset && pos <= tokenOffset + tokenText.length);    
                if (isHighlight && (element.name === tokenText || tokenText === '>')) {
                    return {
                        openStart: element.offset,
                        openEnd: element.endOffset,
                        closeStart: scanner.getTokenOffset(),
                        closeEnd: scanner.getTokenOffset() + scanner.getTokenText().length
                    }
                }

                elementStack.splice(elementStack.length - 1);
            }
        }
    }

    return null;
}

/**
 * Create list of highlights based on position in the html text.
 * 
 * @param {string} text - The html text to create highlights for.
 * @param {number} pos - The position within the html text to create highlights for.
 * @param {number} textOffset - The offset of the text within the entire document.
 * @param {TextDocument} document - The document to create highlights for.
 * @return {DocumentHighlight[]} - The highlights to display.
 */
module.exports.createHighlights = function createCompletions(text, pos, textOffset, document) {
    const range = parseForElement(text, pos);
    if (!range) {
        return null;
    }

    return [
        new vscode.DocumentHighlight(
            new vscode.Range(document.positionAt(textOffset + range.openStart), document.positionAt(textOffset + range.openEnd)),
            vscode.DocumentHighlightKind.Read
        ),
        new vscode.DocumentHighlight(
            new vscode.Range(document.positionAt(textOffset + range.closeStart), document.positionAt(textOffset + range.closeEnd)),
            vscode.DocumentHighlightKind.Read
        )
    ];
}