const htmlparser = require('htmlparser2');
const spec = require('./htmlSpec');

/**
 * Parse the given text to get the open element that contains or preceeds the cursor position.
 * 
 * @param {string} text - The html text to parse.
 * @param {number} pos - The current zero based cursor position relative to the text parameter.
 * @return {object} - An object that describes the parsed element with the following properties: name, startIndex, endIndex, isInside.
 *                    If the cursor doesn't have an associated element null will be returned.
 */
function parseForElement(text, pos) {
    const elementStack = [];
    let element = null;

    const parser = new htmlparser.Parser({
        // put open element on stack
        onopentag: function (name, attribs) {
            const e = {
                name: name,
                startIndex: parser.startIndex,
                endIndex: parser.endIndex
            };
            // position inside element
            if (pos > e.startIndex && pos < e.endIndex) {
                element = e;
                element.isInside = true;
                parser.reset();
            // position after element
            } else if (pos > e.endIndex) {
                element = e;
                elementStack.push(e);
            // position before element
            } else {
                parser.reset();
            }
        },
        // remove closed element from stack
        onclosetag: function(name) {
            if (elementStack.length > 0 && elementStack[elementStack.length - 1].name === name) {
                elementStack.splice(elementStack.length - 1);
                if (elementStack.length === 0 && pos > parser.endIndex) {
                    element = null;
                } else if (pos > parser.endIndex && elementStack.length > 0) {
                    element = elementStack[elementStack.length - 1];
                }
            }
        }
    });
    
    parser.write(text);
    parser.end();

    return element;
};

/**
 * Parse the given element and its text to get the attribute the cursor is positioned in.
 * 
 * @param {object} element - An element object created from a call to the parseForElement function.
 * @param {string} text - The full html text the element was parsed from.
 * @param {number} pos - The current zero based cursor position relative to the text parameter.
 * @return {object} - An object that describes the parsed attributed with the following properties: attributeName, isInsideValue.
 *                    If the cursor doesn't have an associated attribute null will be returned.
 */
function parseForAttribute(element, text, pos) {
    if (!element) {
        return null;
    }
    const attributeRegExp = /\s+([^=]*)="([^"]*)"/g;
    const tagText = text.substring(element.startIndex, element.endIndex);
    const relPos = pos - element.startIndex;

    let match = null;
    while ((match = attributeRegExp.exec(tagText)) !== null) {
        if (relPos > match.index && relPos < match.index + match[0].length) {
            return {
                attributeName: match[1].toLowerCase(),
                isInsideValue: (relPos > (match.index + match[1].length + 2) && relPos < (match.index + match[1].length + 2 + match[2].length + 2))
            };
        }
    }

    return null;
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
    const nonNameRegExp = /[A-Za-z0-9_-]/;
    for (let i = pos - 1; i >= 0; i--) {
        if (!nonNameRegExp.test(text[i])) {
            return text[i];
        }
    }

    return null;
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
    if (!element) {
        if (firstNonNameCharacter(text, pos) === '<') {
            return spec.getTags();
        }

        return [];
    }

    // return all tags plus closing tag if following an element but not inside of it
    if (!element.isInside) {
        if (firstNonNameCharacter(text, pos) === '<') {
            return [spec.newCloseTag(element.name)].concat(spec.getTags());
        }

        return spec.empty;
    }

    const elementAttribute = parseForAttribute(element, text, pos);    

    // return all attributes for element if there is no current attribute or we are not inside the value portion of an attribute
    if (!elementAttribute || !elementAttribute.isInsideValue) {
        return spec.getAttributes(element.name);
    }

    // return valid values for attribute we are inside
    return spec.getAttributeValues(element.name, elementAttribute.attributeName);
}