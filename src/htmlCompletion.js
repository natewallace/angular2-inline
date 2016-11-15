'use strict';

const spec = require('./htmlSpec');
const Html = require('./htmlScanner'); 

/**
 * Parse the given text to get the open element that contains or preceeds the cursor position.
 * 
 * @param {string} text - The html text to parse.
 * @param {number} pos - The current zero based cursor position relative to the text parameter.
 * @return {object} - An object that describes the parsed element.
 */
function parseForElement(text, pos) {
    const scanner = Html.createScanner(text);
    const elementStack = [];
    let element = null;
    let attributeName = null;
    let done = false;
    let pop = false;

    while (!done && scanner.scan() !== Html.TokenType.EOS) {        
        switch (scanner.getTokenType()) {

            // start tag open
            case Html.TokenType.StartTagOpen:
                done = pos <= scanner.getTokenOffset();
                break;

            // start tag
            case Html.TokenType.StartTag:
                element = {
                    name: scanner.getTokenText(),
                    offset: scanner.getTokenOffset(),
                    endOffset: scanner.getTokenOffset() + scanner.getTokenLength(),
                    attributeValues: []
                };
                elementStack.push(element);
                break;
            
            // attribute name
            case Html.TokenType.AttributeName:
                attributeName = scanner.getTokenText();
                break;

            // attribute value
            case Html.TokenType.AttributeValue:
                if (element) {
                    element.attributeValues.push({
                        attributeName: attributeName,
                        offset: scanner.getTokenOffset(),
                        endOffset: scanner.getTokenOffset() + scanner.getTokenLength()
                    })
                }
                break;
            
            // start tag self closed
            case Html.TokenType.StartTagSelfClose:
                if (element) {
                    element.endTagOffset = scanner.getTokenOffset();
                    done = pos <= scanner.getTokenOffset();
                    pop = !done;
                }            
                break;

            // start tag closed
            case Html.TokenType.StartTagClose:
                done = pos <= scanner.getTokenOffset();
                if (!done && element) {
                    element.endTagOffset = scanner.getTokenOffset();                    
                    pop = spec.isEmptyTag(element.name);
                }
                break;        

            // end tag
            case Html.TokenType.EndTagOpen:
                pop = true;
                break;     

            default:
                done = pos <= scanner.getTokenOffset();
                break;
        }

        // remove the last added element and set top element to latest
        if (pop) {
            pop = false;
            if (elementStack.length > 0) {
                elementStack.splice(elementStack.length - 1);
                if (elementStack.length > 0) {
                    element = elementStack[elementStack.length - 1];
                }
            }
        }
    }

    // determine if we are inside the element, an attribute, or an attribute value
    if (element) {
        if (typeof element.endTagOffset === 'undefined') {
            element.endTagOffset = text.length;
        }
        element.isInsideElement = pos <= element.endTagOffset;
        element.isInsideElementName = (pos >= element.offset && pos <= element.endOffset);
        element.isInsideAttributeValue = false;
        element.attributeName = null;
        for (let i = 0; i < element.attributeValues.length; i++) {
            if (pos >= element.attributeValues[i].offset && pos <= element.attributeValues[i].endOffset) {
                element.isInsideAttributeValue = true;
                element.attributeName = element.attributeValues[i].attributeName;
            }
        }
    }

    return element;
}

/**
 * Get the first occurance of an invalid element name character that proceeds the current position.
 * 
 * @param {string} text - The full text that the cursor appears in.
 * @param {number} pos - The current zero based cursor position within the text parameter to start the search from.
 * @return {string} - The first occurance of an invalid element name character that proceeds the current position.  If there isn't an invalid character
 *                    found before reaching the beginning of the text, null will be returned.
 */
function firstNonNameCharacter(text, pos) {
    const nameRegExp = /[_$@a-zA-Z*#()\[\]]/;
    for (let i = pos - 1; i >= 0; i--) {
        if (!nameRegExp.test(text[i])) {
            return text[i];
        }
    }

    return null;
}

/**
 * Get the opening characters that appear before an attribute name if there are any.
 * 
 * @param {string} text - The full text that the cursor appears in.
 * @param {number} pos - The current zero based cursor position within the text parameter to start the search from.
 * @return {string} - The opening characters found or an empty string if non are present.  The possible return values are: '[', '[(', '(', '([', '' 
 */
function getOpenAttributeCharacters(text, pos) {
    const termRegExp = /[\s"']/;
    const openRegExp = /\[|\(/;
    for (let i = pos - 1; i >= 0; i--) {
        if (termRegExp.test(text[i])) {
            const part0 = (i + 1 < text.length) ? text[i + 1] : '';
            const part1 = (i + 2 < text.length) ? text[i + 2] : '';
            return (openRegExp.test(part0) ? part0 : '') +
                   (openRegExp.test(part1) ? part1 : '')
        }
    }

    return '';
}

/**
 * Get the closing characters that appear after an attribute name if there are any.
 * 
 * @param {string} text - The full text that the cursor appears in.
 * @param {number} pos - The current zero based cursor position within the text parameter to start the search from.
 * @return {string} - The closing characters found or an empty string if non are present.  The possible return values are:
 *                    ']', ')]', ')', '])', ']<optional spaces>=', ')]<optional spaces>=', ')<optional spaces>=', '])<optional spaces>=', ''
 */
function getCloseAttributeCharacters(text, pos) {
    const nameRegExp = /[_$@a-zA-Z*#]/;
    const whitespaceRegExp = /[\s]/;
    let closeRegExp = /\]|\)/;
    let result = '';
    for (let i = pos; i < text.length; i++) {
        if (!nameRegExp.test(text[i])) {
            for (let j = i; j < text.length; j++) {
                if (closeRegExp && closeRegExp.test(text[j])) {
                    result += text[j];
                } else if (whitespaceRegExp.test(text[j])) {
                    closeRegExp = null;
                    result += text[j];
                } else if (text[j] === '=') {
                    result += '=';
                    break;
                } else {
                    break;
                }
            }

            return result.trim();
        }
    }

    return '';
}

/**
 * Create list of completions based on position in the html text.
 * 
 * @param {string} text - The html text to create completions for.
 * @param {number} pos - The position within the html text to create completions for.
 * @return {CompletionItem[]} - The completion items to display.
 */
module.exports.createCompletions = function createCompletions(text, pos) {
    const element = parseForElement(text, pos);        

    // return all tags if we are not following an element
    if (!element || element.isInsideElementName) {
        if (firstNonNameCharacter(text, pos) === '<') {
            return spec.getTags();
        }

        return [];
    }

    // return all tags plus closing tag if following an element but not inside of it
    if (!element.isInsideElement) {
        if (firstNonNameCharacter(text, pos) === '<') {
            return [spec.newCloseTag(element.name)].concat(spec.getTags());
        }

        return [];
    }

    // const elementAttribute = parseForAttribute(element, text, pos);
    const openCharacters = getOpenAttributeCharacters(text, pos);
    const closeCharacters = getCloseAttributeCharacters(text, pos);

    // return all attributes for element if there is no current attribute or we are not inside the value portion of an attribute
    if (!element.isInsideAttributeValue) {
        return spec.getAttributes(element.name, openCharacters, closeCharacters);
    }

    // return valid values for attribute we are inside
    return spec.getAttributeValues(element.name, element.attributeName);
}