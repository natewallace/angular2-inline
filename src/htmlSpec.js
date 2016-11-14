const vscode = require('vscode');

/** 
 * Holds all tags that get defined.
 */
const allTags = [];

/**
 * Create a new value completion.
 * 
 * @param {string} label - The label for the completion.
 * @return {CompletionItem} - A new CompletionItem for a value.
 */
function newValue(label) {
    return new vscode.CompletionItem(label, vscode.CompletionItemKind.Unit);
}

/**
 * Create a new attribute completion.
 * 
 * @param {string} label - The label for the completion.
 * @return {CompletionItem} - A new CompletionItem for an attribute.
 */
function newAttribute(label) {
    const parts = label.split(':');    
    const attributeItem = new vscode.CompletionItem(parts[0], vscode.CompletionItemKind.Enum);
    attributeItem.insertText = parts[0] + '=""';
    attributeItem.command = {
        command: 'cursorMove',
        arguments: [{
            to: 'left',
            by: 'character',
            value: 1,
            select: false
        }]
    };

    if (parts.length > 0) {
        attributeItem.valueType = parts[1];
    }

    return attributeItem;
}

/**
 * Create a new tag.  This function will return the new tag as well as add it to a global list of tags.
 * 
 * @param {string} label - A label for the tag.  To specify a mapping from tag to value set use the form 'name:key'' where key is a lookup property used with
 *                         the valueSets object and name is the value to display as the label.
 * @param {string} documentation - A detailed description for the tag.
 * @param {string[]} attributes - Collection of attribute names specific to the tag.
 * @return {CompletionItem} - A new CompletionItem for a tag.
 */
function newTag(label, documentation, attributes) {
	const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Property);
	item.documentation = documentation;

	item.attributes = [];
    if (attributes) {
        for (let i = 0; i < attributes.length; i++) {
            item.attributes.push(newAttribute(attributes[i]));
        }
    }

	allTags.push(item);
	return item;
}

/**
 * Definition of html tags.  The descriptions here are taken from the VSCode project.
 */
const tags = {
    // The root element
    html: newTag('html', 'The html element represents the root of an HTML document.', ['manifest']),
    // Document metadata
    head: newTag('head', 'The head element represents a collection of metadata for the Document.'),
    title: newTag('title', 'The title element represents the document\'s title or name. Authors should use titles that identify their documents even when they are used out of context, for example in a user\'s history or bookmarks, or in search results. The document\'s title is often different from its first heading, since the first heading does not have to stand alone when taken out of context.'),
    base: newTag('base', 'The base element allows authors to specify the document base URL for the purposes of resolving relative URLs, and the name of the default browsing context for the purposes of following hyperlinks. The element does not represent any content beyond this information.', ['href', 'target']),
    link: newTag('link', 'The link element allows authors to link their document to other resources.', ['href', 'crossorigin:xo', 'rel', 'media', 'hreflang', 'type', 'sizes']),
    meta: newTag('meta', 'The meta element represents various kinds of metadata that cannot be expressed using the title, base, link, style, and script elements.', ['name', 'http-equiv', 'content', 'charset']),
    style: newTag('style', 'The style element allows authors to embed style information in their documents. The style element is one of several inputs to the styling processing model. The element does not represent content for the user.', ['media', 'nonce', 'type', 'scoped:v']),
    // Sections
    body: newTag('body', 'The body element represents the content of the document.', ['onafterprint', 'onbeforeprint', 'onbeforeunload', 'onhashchange', 'onlanguagechange', 'onmessage', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onstorage', 'onunload']),
    article: newTag('article', 'The article element represents a complete, or self-contained, composition in a document, page, application, or site and that is, in principle, independently distributable or reusable, e.g. in syndication. This could be a forum post, a magazine or newspaper article, a blog entry, a user-submitted comment, an interactive widget or gadget, or any other independent item of content. Each article should be identified, typically by including a heading (h1–h6 element) as a child of the article element.'),
    section: newTag('section', 'The section element represents a generic section of a document or application. A section, in this context, is a thematic grouping of content. Each section should be identified, typically by including a heading ( h1- h6 element) as a child of the section element.'),
    nav: newTag('nav', 'The nav element represents a section of a page that links to other pages or to parts within the page: a section with navigation links.'),
    aside: newTag('aside', 'The aside element represents a section of a page that consists of content that is tangentially related to the content around the aside element, and which could be considered separate from that content. Such sections are often represented as sidebars in printed typography.'),
    h1: newTag('h1', 'The h1 element represents a section heading.'),
    h2: newTag('h2', 'The h2 element represents a section heading.'),
    h3: newTag('h3', 'The h3 element represents a section heading.'),
    h4: newTag('h4', 'The h4 element represents a section heading.'),
    h5: newTag('h5', 'The h5 element represents a section heading.'),
    h6: newTag('h6', 'The h6 element represents a section heading.'),
    header: newTag('header', 'The header element represents introductory content for its nearest ancestor sectioning content or sectioning root element. A header typically contains a group of introductory or navigational aids. When the nearest ancestor sectioning content or sectioning root element is the body element, then it applies to the whole page.'),
    footer: newTag('footer', 'The footer element represents a footer for its nearest ancestor sectioning content or sectioning root element. A footer typically contains information about its section such as who wrote it, links to related documents, copyright data, and the like.'),
    address: newTag('address', 'The address element represents the contact information for its nearest article or body element ancestor. If that is the body element, then the contact information applies to the document as a whole.'),
    // Grouping content
    p: newTag('p', 'The p element represents a paragraph.'),
    hr: newTag('hr', 'The hr element represents a paragraph-level thematic break, e.g. a scene change in a story, or a transition to another topic within a section of a reference book.'),
    pre: newTag('pre', 'The pre element represents a block of preformatted text, in which structure is represented by typographic conventions rather than by elements.'),
    blockquote: newTag('blockquote', 'The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a footer or cite element, and optionally with in-line changes such as annotations and abbreviations.', ['cite']),
    ol: newTag('ol', 'The ol element represents a list of items, where the items have been intentionally ordered, such that changing the order would change the meaning of the document.', ['reversed:v', 'start', 'type:lt']),
    ul: newTag('ul', 'The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.'),
    li: newTag('li', 'The li element represents a list item. If its parent element is an ol, ul, or menu element, then the element is an item of the parent element\'s list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other li element.', ['value']),
    dl: newTag('dl', 'The dl element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements) followed by one or more values (dd elements), ignoring any nodes other than dt and dd elements. Within a single dl element, there should not be more than one dt element for each name.'),
    dt: newTag('dt', 'The dt element represents the term, or name, part of a term-description group in a description list (dl element).'),
    dd: newTag('dd', 'The dd element represents the description, definition, or value, part of a term-description group in a description list (dl element).'),
    figure: newTag('figure', 'The figure element represents some flow content, optionally with a caption, that is self-contained (like a complete sentence) and is typically referenced as a single unit from the main flow of the document.'),
    figcaption: newTag('figcaption', 'The figcaption element represents a caption or legend for the rest of the contents of the figcaption element\'s parent figure element, if any.'),
    main: newTag('main', 'The main element represents the main content of the body of a document or application. The main content area consists of content that is directly related to or expands upon the central topic of a document or central functionality of an application.'),
    div: newTag('div', 'The div element has no special meaning at all. It represents its children. It can be used with the class, lang, and title attributes to mark up semantics common to a group of consecutive elements.'),
    // Text-level semantics
    a: newTag('a', 'If the a element has an href attribute, then it represents a hyperlink (a hypertext anchor) labeled by its contents.', ['href', 'target', 'download', 'ping', 'rel', 'hreflang', 'type']),
    em: newTag('em', 'The em element represents stress emphasis of its contents.'),
    strong: newTag('strong', 'The strong element represents strong importance, seriousness, or urgency for its contents.'),
    small: newTag('small', 'The small element represents side comments such as small print.'),
    s: newTag('s', 'The s element represents contents that are no longer accurate or no longer relevant.'),
    cite: newTag('cite', 'The cite element represents a reference to a creative work. It must include the title of the work or the name of the author(person, people or organization) or an URL reference, or a reference in abbreviated form as per the conventions used for the addition of citation metadata.'),
    q: newTag('q', 'The q element represents some phrasing content quoted from another source.', ['cite']),
    dfn: newTag('dfn', 'The dfn element represents the defining instance of a term. The paragraph, description list group, or section that is the nearest ancestor of the dfn element must also contain the definition(s) for the term given by the dfn element.'),
    abbr: newTag('abbr', 'The abbr element represents an abbreviation or acronym, optionally with its expansion. The title attribute may be used to provide an expansion of the abbreviation. The attribute, if specified, must contain an expansion of the abbreviation, and nothing else.'),
    ruby: newTag('ruby', 'The ruby element allows one or more spans of phrasing content to be marked with ruby annotations. Ruby annotations are short runs of text presented alongside base text, primarily used in East Asian typography as a guide for pronunciation or to include other annotations. In Japanese, this form of typography is also known as furigana. Ruby text can appear on either side, and sometimes both sides, of the base text, and it is possible to control its position using CSS. A more complete introduction to ruby can be found in the Use Cases & Exploratory Approaches for Ruby Markup document as well as in CSS Ruby Module Level 1. [RUBY-UC] [CSSRUBY]'),
    rb: newTag('rb', 'The rb element marks the base text component of a ruby annotation. When it is the child of a ruby element, it doesn\'t represent anything itself, but its parent ruby element uses it as part of determining what it represents.'),
    rt: newTag('rt', 'The rt element marks the ruby text component of a ruby annotation. When it is the child of a ruby element or of an rtc element that is itself the child of a ruby element, it doesn\'t represent anything itself, but its ancestor ruby element uses it as part of determining what it represents.'),
    rp: newTag('rp', 'The rp element is used to provide fallback text to be shown by user agents that don\'t support ruby annotations. One widespread convention is to provide parentheses around the ruby text component of a ruby annotation.'),
    time: newTag('time', 'The time element represents its contents, along with a machine-readable form of those contents in the datetime attribute. The kind of content is limited to various kinds of dates, times, time-zone offsets, and durations, as described below.', ['datetime']),
    code: newTag('code', 'The code element represents a fragment of computer code. This could be an XML element name, a file name, a computer program, or any other string that a computer would recognize.'),
    var: newTag('var', 'The var element represents a variable. This could be an actual variable in a mathematical expression or programming context, an identifier representing a constant, a symbol identifying a physical quantity, a function parameter, or just be a term used as a placeholder in prose.'),
    samp: newTag('samp', 'The samp element represents sample or quoted output from another program or computing system.'),
    kbd: newTag('kbd', 'The kbd element represents user input (typically keyboard input, although it may also be used to represent other input, such as voice commands).'),
    sub: newTag('sub', 'The sub element represents a subscript.'),
    sup: newTag('sup', 'The sup element represents a superscript.'),
    i: newTag('i', 'The i element represents a span of text in an alternate voice or mood, or otherwise offset from the normal prose in a manner indicating a different quality of text, such as a taxonomic designation, a technical term, an idiomatic phrase from another language, transliteration, a thought, or a ship name in Western texts.'),
    b: newTag('b', 'The b element represents a span of text to which attention is being drawn for utilitarian purposes without conveying any extra importance and with no implication of an alternate voice or mood, such as key words in a document abstract, product names in a review, actionable words in interactive text-driven software, or an article lede.'),
    u: newTag('u', 'The u element represents a span of text with an unarticulated, though explicitly rendered, non-textual annotation, such as labeling the text as being a proper name in Chinese text (a Chinese proper name mark), or labeling the text as being misspelt.'),
    mark: newTag('mark', 'The mark element represents a run of text in one document marked or highlighted for reference purposes, due to its relevance in another context. When used in a quotation or other block of text referred to from the prose, it indicates a highlight that was not originally present but which has been added to bring the reader\'s attention to a part of the text that might not have been considered important by the original author when the block was originally written, but which is now under previously unexpected scrutiny. When used in the main prose of a document, it indicates a part of the document that has been highlighted due to its likely relevance to the user\'s current activity.'),
    bdi: newTag('bdi', 'The bdi element represents a span of text that is to be isolated from its surroundings for the purposes of bidirectional text formatting. [BIDI]'),
    bdo: newTag('dbo', 'The bdo element represents explicit text directionality formatting control for its children. It allows authors to override the Unicode bidirectional algorithm by explicitly specifying a direction override. [BIDI]'),
    span: newTag('span', 'The span element doesn\'t mean anything on its own, but can be useful when used together with the global attributes, e.g. class, lang, or dir. It represents its children.'),
    br: newTag('br', 'The br element represents a line break.'),
    wbr: newTag('wbr', 'The wbr element represents a line break opportunity.'),
    // Edits
    ins: newTag('ins', 'The ins element represents an addition to the document.'),
    del: newTag('del', 'The del element represents a removal from the document.', ['cite', 'datetime']),
    // Embedded content
    picture: newTag('picture', 'The picture element is a container which provides multiple sources to its contained img element to allow authors to declaratively control or give hints to the user agent about which image resource to use, based on the screen pixel density, viewport size, image format, and other factors. It represents its children.'),
    img: newTag('img', 'An img element represents an image.', ['alt', 'src', 'srcset', 'crossorigin:xo', 'usemap', 'ismap:v', 'width', 'height']),
    iframe: newTag('iframe', 'The iframe element represents a nested browsing context.', ['src', 'srcdoc', 'name', 'sandbox:sb', 'seamless:v', 'allowfullscreen:v', 'width', 'height']),
    embed: newTag('embed', 'The embed element provides an integration point for an external (typically non-HTML) application or interactive content.', ['src', 'type', 'width', 'height']),
    object: newTag('object', 'The object element can represent an external resource, which, depending on the type of the resource, will either be treated as an image, as a nested browsing context, or as an external resource to be processed by a plugin.', ['data', 'type', 'typemustmatch:v', 'name', 'usemap', 'form', 'width', 'height']),
    param: newTag('param', 'The param element defines parameters for plugins invoked by object elements. It does not represent anything on its own.', ['name', 'value']),
    video: newTag('video', 'A video element is used for playing videos or movies, and audio files with captions.', ['src', 'crossorigin:xo', 'poster', 'preload:pl', 'autoplay:v', 'mediagroup', 'loop:v', 'muted:v', 'controls:v', 'width', 'height']),
    audio: newTag('audio', 'An audio element represents a sound or audio stream.', ['src', 'crossorigin:xo', 'preload:pl', 'autoplay:v', 'mediagroup', 'loop:v', 'muted:v', 'controls:v']),
    source: newTag('source', 'The source element allows authors to specify multiple alternative media resources for media elements. It does not represent anything on its own.', ['src', 'type']),
    track: newTag('track', 'The track element allows authors to specify explicit external timed text tracks for media elements. It does not represent anything on its own.', ['default:v', 'kind:tk', 'label', 'src', 'srclang']),
    map: newTag('map', 'The map element, in conjunction with an img element and any area element descendants, defines an image map. The element represents its children.', ['name']),
    area: newTag('area', 'The area element represents either a hyperlink with some text and a corresponding area on an image map, or a dead area on an image map.', ['alt', 'coords', 'shape:sh', 'href', 'target', 'download', 'ping', 'rel', 'hreflang', 'type']),
    // Tabular data
    table: newTag('table', 'The table element represents data with more than one dimension, in the form of a table.', ['sortable:v', 'border']),
    caption: newTag('caption', 'The caption element represents the title of the table that is its parent, if it has a parent and that is a table element.'),
    colgroup: newTag('colgroup', 'The colgroup element represents a group of one or more columns in the table that is its parent, if it has a parent and that is a table element.', ['span']),
    col: newTag('col', 'If a col element has a parent and that is a colgroup element that itself has a parent that is a table element, then the col element represents one or more columns in the column group represented by that colgroup.', ['span']),
    tbody: newTag('tbody', 'The tbody element represents a block of rows that consist of a body of data for the parent table element, if the tbody element has a parent and it is a table.'),
    thead: newTag('thead', 'The thead element represents the block of rows that consist of the column labels (headers) for the parent table element, if the thead element has a parent and it is a table.'),
    tfoot: newTag('tfoot', 'The tfoot element represents the block of rows that consist of the column summaries (footers) for the parent table element, if the tfoot element has a parent and it is a table.'),
    tr: newTag('tr', 'The tr element represents a row of cells in a table.'),
    td: newTag('td', 'The td element represents a data cell in a table.', ['colspan', 'rowspan', 'headers']),
    th: newTag('th', 'The th element represents a header cell in a table.', ['colspan', 'rowspan', 'headers', 'scope:s', 'sorted', 'abbr']),
    // Forms
    form: newTag('form', 'The form element represents a collection of form-associated elements, some of which can represent editable values that can be submitted to a server for processing.', ['accept-charset', 'action', 'autocomplete:o', 'enctype:et', 'method:m', 'name', 'novalidate:v', 'target']),
    label: newTag('label', 'The label element represents a caption in a user interface. The caption can be associated with a specific form control, known as the label element\'s labeled control, either using the for attribute, or by putting the form control inside the label element itself.', ['form', 'for']),
    input: newTag('input', 'The input element represents a typed data field, usually with a form control to allow the user to edit the data.', ['accept', 'alt', 'autocomplete:inputautocomplete', 'autofocus:v', 'checked:v', 'dirname', 'disabled:v', 'form', 'formaction', 'formenctype:et', 'formmethod:fm', 'formnovalidate:v', 'formtarget', 'height', 'inputmode:im', 'list', 'max', 'maxlength', 'min', 'minlength', 'multiple:v', 'name', 'pattern', 'placeholder', 'readonly:v', 'required:v', 'size', 'src', 'step', 'type:t', 'value', 'width']),
    button: newTag('button', 'The button element represents a button labeled by its contents.', ['autofocus:v', 'disabled:v', 'form', 'formaction', 'formenctype:et', 'formmethod:fm', 'formnovalidate:v', 'formtarget', 'name', 'type:bt', 'value']),
    select: newTag('select', 'The select element represents a control for selecting amongst a set of options.', ['autocomplete:inputautocomplete', 'autofocus:v', 'disabled:v', 'form', 'multiple:v', 'name', 'required:v', 'size']),
    datalist: newTag('datalist', 'The datalist element represents a set of option elements that represent predefined options for other controls. In the rendering, the datalist element represents nothing and it, along with its children, should be hidden.'),
    optgroup: newTag('optgroup', 'The optgroup element represents a group of option elements with a common label.', ['disabled:v', 'label']),
    option: newTag('option', 'The option element represents an option in a select element or as part of a list of suggestions in a datalist element.', ['disabled:v', 'label', 'selected:v', 'value']),
    textarea: newTag('textarea', 'The textarea element represents a multiline plain text edit control for the element\'s raw value. The contents of the control represent the control\'s default value.', ['autocomplete:inputautocomplete', 'autofocus:v', 'cols', 'dirname', 'disabled:v', 'form', 'inputmode:im', 'maxlength', 'minlength', 'name', 'placeholder', 'readonly:v', 'required:v', 'rows', 'wrap:w']),
    output: newTag('output', 'The output element represents the result of a calculation performed by the application, or the result of a user action.', ['for', 'form', 'name']),
    progress: newTag('progress', 'The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a number in the range zero to a maximum, giving the fraction of work that has so far been completed.', ['value', 'max']),
    meter: newTag('meter', 'The meter element represents a scalar measurement within a known range, or a fractional value; for example disk usage, the relevance of a query result, or the fraction of a voting population to have selected a particular candidate.', ['value', 'min', 'max', 'low', 'high', 'optimum']),
    fieldset: newTag('fieldset', 'The fieldset element represents a set of form controls optionally grouped under a common name.', ['disabled:v', 'form', 'name']),
    legend: newTag('legend', 'The legend element represents a caption for the rest of the contents of the legend element\'s parent fieldset element, if any.'),
    details: newTag('details', 'The details element represents a disclosure widget from which the user can obtain additional information or controls.', ['open:v']),
    summary: newTag('summary', 'The summary element represents a summary, caption, or legend for the rest of the contents of the summary element\'s parent details element, if any.'),
    dialog: newTag('dialog', 'The dialog element represents a part of an application that a user interacts with to perform a task, for example a dialog box, inspector, or window.'),
    script: newTag('script', 'The script element allows authors to include dynamic script and data blocks in their documents. The element does not represent content for the user.', ['src', 'type', 'charset', 'async:v', 'defer:v', 'crossorigin:xo', 'nonce']),
    noscript: newTag('noscript', 'The noscript element represents nothing if scripting is enabled, and represents its children if scripting is disabled. It is used to present different markup to user agents that support scripting and those that don\'t support scripting, by affecting how the document is parsed.'),
    template: newTag('template', 'The template element is used to declare fragments of HTML that can be cloned and inserted in the document by script.'),
    canvas: newTag('canvas', 'The canvas element provides scripts with a resolution-dependent bitmap canvas, which can be used for rendering graphs, game graphics, art, or other visual images on the fly.', ['width', 'height'])
};

/**
 * Definition of common attributes.
 */
const commonAttributes = [
	newAttribute('aria-activedescendant'),
	newAttribute('aria-atomic:b'),
	newAttribute('aria-autocomplete:autocomplete'),
	newAttribute('aria-busy:b'),
	newAttribute('aria-checked:tristate'),
	newAttribute('aria-colcount'),
	newAttribute('aria-colindex'),
	newAttribute('aria-colspan'),
	newAttribute('aria-controls'),
	newAttribute('aria-current:current'),
	newAttribute('aria-describedat'),
	newAttribute('aria-describedby'),
	newAttribute('aria-disabled:b'),
	newAttribute('aria-dropeffect:dropeffect'),
	newAttribute('aria-errormessage'),
	newAttribute('aria-expanded:u'),
	newAttribute('aria-flowto'),
	newAttribute('aria-grabbed:u'),
	newAttribute('aria-haspopup:b'),
	newAttribute('aria-hidden:b'),
	newAttribute('aria-invalid:invalid'),
	newAttribute('aria-kbdshortcuts'),
	newAttribute('aria-label'),
	newAttribute('aria-labelledby'),
	newAttribute('aria-level'),
	newAttribute('aria-live:live'),
	newAttribute('aria-modal:b'),
	newAttribute('aria-multiline:b'),
	newAttribute('aria-multiselectable:b'),
	newAttribute('aria-orientation:orientation'),
	newAttribute('aria-owns'),
	newAttribute('aria-placeholder'),
	newAttribute('aria-posinset'),
	newAttribute('aria-pressed:tristate'),
	newAttribute('aria-readonly:b'),
	newAttribute('aria-relevant:relevant'),
	newAttribute('aria-required:b'),
	newAttribute('aria-roledescription'),
	newAttribute('aria-rowcount'),
	newAttribute('aria-rowindex'),
	newAttribute('aria-rowspan'),
	newAttribute('aria-selected:u'),
	newAttribute('aria-setsize'),
	newAttribute('aria-sort:sort'),
	newAttribute('aria-valuemax'),
	newAttribute('aria-valuemin'),
	newAttribute('aria-valuenow'),
	newAttribute('aria-valuetext'),
	newAttribute('accesskey'),
	newAttribute('class'),
	newAttribute('contenteditable:b'),
	newAttribute('contextmenu'),
	newAttribute('dir:d'),
	newAttribute('draggable:b'),
	newAttribute('dropzone'),
	newAttribute('hidden:v'),
	newAttribute('id'),
	newAttribute('itemid'),
	newAttribute('itemprop'),
	newAttribute('itemref'),
	newAttribute('itemscope:v'),
	newAttribute('itemtype'),
	newAttribute('lang'),
	newAttribute('role:roles'),
	newAttribute('spellcheck:b'),
	newAttribute('style'),
	newAttribute('tabindex'),
	newAttribute('title'),
	newAttribute('translate:y')
];

/**
 * Definition of common attributes.
 */
const eventHandlers = [
	newAttribute('onabort'),
	newAttribute('onblur'),
	newAttribute('oncanplay'),
	newAttribute('oncanplaythrough'),
	newAttribute('onchange'),
	newAttribute('onclick'),
	newAttribute('oncontextmenu'),
	newAttribute('ondblclick'),
	newAttribute('ondrag'),
	newAttribute('ondragend'),
	newAttribute('ondragenter'),
	newAttribute('ondragleave'),
	newAttribute('ondragover'),
	newAttribute('ondragstart'),
	newAttribute('ondrop'),
	newAttribute('ondurationchange'),
	newAttribute('onemptied'),
	newAttribute('onended'),
	newAttribute('onerror'),
	newAttribute('onfocus'),
	newAttribute('onformchange'),
	newAttribute('onforminput'),
	newAttribute('oninput'),
	newAttribute('oninvalid'),
	newAttribute('onkeydown'),
	newAttribute('onkeypress'),
	newAttribute('onkeyup'),
	newAttribute('onload'),
	newAttribute('onloadeddata'),
	newAttribute('onloadedmetadata'),
	newAttribute('onloadstart'),
	newAttribute('onmousedown'),
	newAttribute('onmousemove'),
	newAttribute('onmouseout'),
	newAttribute('onmouseover'),
	newAttribute('onmouseup'),
	newAttribute('onmousewheel'),
	newAttribute('onpause'),
	newAttribute('onplay'),
	newAttribute('onplaying'),
	newAttribute('onprogress'),
	newAttribute('onratechange'),
	newAttribute('onreset'),
	newAttribute('onresize'),
	newAttribute('onreadystatechange'),
	newAttribute('onscroll'),
	newAttribute('onseeked'),
	newAttribute('onseeking'),
	newAttribute('onselect'),
	newAttribute('onshow'),
	newAttribute('onstalled'),
	newAttribute('onsubmit'),
	newAttribute('onsuspend'),
	newAttribute('ontimeupdate'),
	newAttribute('onvolumechange'),
	newAttribute('onwaiting')
];

/**
 * Definition of all known attributes.
 */
const globalAttributes = [].concat(commonAttributes, eventHandlers);

/**
 * Map of value sets for specific tags.
 */
const valueSets = {
    b: [newValue('true'), newValue('false')],
    u: [newValue('true'), newValue('false'), newValue('undefined')],
    o: [newValue('on'), newValue('off')],
    y: [newValue('yes'), newValue('no')],
    w: [newValue('soft'), newValue('hard')],
    d: [newValue('ltr'), newValue('rtl'), newValue('auto')],
    m: [newValue('GET'), newValue('POST'), newValue('dialog')],
    fm: [newValue('GET'), newValue('POST')],
    s: [newValue('row'), newValue('col'), newValue('rowgroup'), newValue('colgroup')],
    t: [newValue('hidden'), newValue('text'), newValue('search'), newValue('tel'), newValue('url'), newValue('email'), newValue('password'), newValue('datetime'), newValue('date'), newValue('month'), 
        newValue('week'), newValue('time'), newValue('datetime-local'), newValue('number'), newValue('range'), newValue('color'), newValue('checkbox'), newValue('radio'), newValue('file'), newValue('submit'), newValue('image'), newValue('reset'), newValue('button')],
    im: [newValue('verbatim'), newValue('latin'), newValue('latin-name'), newValue('latin-prose'), newValue('full-width-latin'), newValue('kana'), newValue('kana-name'), newValue('katakana'), newValue('numeric'), newValue('tel'), newValue('email'), newValue('url')],
    bt: [newValue('button'), newValue('submit'), newValue('reset'), newValue('menu')],
    lt: [newValue('1'), newValue('a'), newValue('A'), newValue('i'), newValue('I')],
    mt: [newValue('context'), newValue('toolbar')],
    mit: [newValue('command'), newValue('checkbox'), newValue('radio')],
    et: [newValue('application/x-www-form-urlencoded'), newValue('multipart/form-data'), newValue('text/plain')],
    tk: [newValue('subtitles'), newValue('captions'), newValue('descriptions'), newValue('chapters'), newValue('metadata')],
    pl: [newValue('none'), newValue('metadata'), newValue('auto')],
    sh: [newValue('circle'), newValue('default'), newValue('poly'), newValue('rect')],
    xo: [newValue('anonymous'), newValue('use-credentials')],
    sb: [newValue('allow-forms'), newValue('allow-modals'), newValue('allow-pointer-lock'), newValue('allow-popups'), newValue('allow-popups-to-escape-sandbox'), newValue('allow-same-origin'), newValue('allow-scripts'), newValue('allow-top-navigation')],
    tristate: [newValue('true'), newValue('false'), newValue('mixed'), newValue('undefined')],
    inputautocomplete: [newValue('additional-name'), newValue('address-level1'), newValue('address-level2'), newValue('address-level3'), newValue('address-level4'), newValue('address-line1'), 
                        newValue('address-line2'), newValue('address-line3'), newValue('bday'), newValue('bday-year'), newValue('bday-day'), newValue('bday-month'), newValue('billing'), 
                        newValue('cc-additional-name'), newValue('cc-csc'), newValue('cc-exp'), newValue('cc-exp-month'), newValue('cc-exp-year'), newValue('cc-family-name'), newValue('cc-given-name'), 
                        newValue('cc-name'), newValue('cc-number'), newValue('cc-type'), newValue('country'), newValue('country-name'), newValue('current-password'), newValue('email'), 
                        newValue('family-name'), newValue('fax'), newValue('given-name'), newValue('home'), newValue('honorific-prefix'), newValue('honorific-suffix'), newValue('impp'), 
                        newValue('language'), newValue('mobile'), newValue('name'), newValue('new-password'), newValue('nickname'), newValue('organization'), newValue('organization-title'), 
                        newValue('pager'), newValue('photo'), newValue('postal-code'), newValue('sex'), newValue('shipping'), newValue('street-address'), newValue('tel-area-code'), newValue('tel'), 
                        newValue('tel-country-code'), newValue('tel-extension'), newValue('tel-local'), newValue('tel-local-prefix'), newValue('tel-local-suffix'), newValue('tel-national'), 
                        newValue('transaction-amount'), newValue('transaction-currency'), newValue('url'), newValue('username'), newValue('work')],
    autocomplete: [newValue('inline'), newValue('list'), newValue('both'), newValue('none')],
    current: [newValue('page'), newValue('step'), newValue('location'), newValue('date'), newValue('time'), newValue('true'), newValue('false')],
    dropeffect: [newValue('copy'), newValue('move'), newValue('link'), newValue('execute'), newValue('popup'), newValue('none')],
    invalid: [newValue('grammar'), newValue('false'), newValue('spelling'), newValue('true')],
    live: [newValue('off'), newValue('polite'), newValue('assertive')],
    orientation: [newValue('vertical'), newValue('horizontal'), newValue('undefined')],
    relevant: [newValue('additions'), newValue('removals'), newValue('text'), newValue('all'), newValue('additions text')],
    sort: [newValue('ascending'), newValue('descending'), newValue('none'), newValue('other')],
    roles: [newValue('alert'), newValue('alertdialog'), newValue('button'), newValue('checkbox'), newValue('dialog'), newValue('gridcell'), newValue('link'), newValue('log'), newValue('marquee'), 
            newValue('menuitem'), newValue('menuitemcheckbox'), newValue('menuitemradio'), newValue('option'), newValue('progressbar'), newValue('radio'), newValue('scrollbar'), newValue('searchbox'), 
            newValue('slider'), newValue('spinbutton'), newValue('status'), newValue('switch'), newValue('tab'), newValue('tabpanel'), newValue('textbox'), newValue('timer'), newValue('tooltip'), 
            newValue('treeitem'), newValue('combobox'), newValue('grid'), newValue('listbox'), newValue('menu'), newValue('menubar'), newValue('radiogroup'), newValue('tablist'), newValue('tree'), 
            newValue('treegrid'), newValue('application'), newValue('article'), newValue('cell'), newValue('columnheader'), newValue('definition'), newValue('directory'), newValue('document'), 
            newValue('feed'), newValue('figure'), newValue('group'), newValue('heading'), newValue('img'), newValue('list'), newValue('listitem'), newValue('math'), newValue('none'), newValue('note'), 
            newValue('presentation'), newValue('region'), newValue('row'), newValue('rowgroup'), newValue('rowheader'), newValue('separator'), newValue('table'), newValue('term'), newValue('text'), 
            newValue('toolbar'), newValue('banner'), newValue('complementary'), newValue('contentinfo'), newValue('form'), newValue('main'), newValue('navigation'), newValue('region'), newValue('search')]
};

/**
 * Get all defined tags.
 * 
 * @return {CompletionItem[]} - All of the tags defined by this module.
 */
module.exports.getTags = function getTags() {
    return allTags;
}

/**
 * Get the tag with the given name.
 * 
 * @param {string} name - The name of the tag to get.  The lookup is case-insensitive.
 * @return {CompletionItem|undefined} - The tag with the given name or undefined if not found.
 */
module.exports.getTag = function getTag(name) {
    const nameLower = name ? name.toLowerCase() : '';
    return tags[nameLower];
}

/**
 * Get all of the attributes for the given tag.
 * 
 * @param {string} tagName - The name of the tag to get attributes for.
 * @param {string} openCharacters - Characters that appear at the beginning of the attribute name.
 * @param {string} closeCharacters - Characters that appear at the end of the attribute name.
 * @return {CompletionItem[]} - The attributes for the given tag.  Even if the tag specified isn't found the global attributes will be returned.
 */
module.exports.getAttributes = function getAttributes(tagName, openCharacters, closeCharacters) {
    let result = null;
    const tag = module.exports.getTag(tagName);
    if (!tag) {
        result = globalAttributes;
    }
    result = tag.attributes.concat(globalAttributes);

    let nameClose = '';
    let moveLeft = 0;
    const oc = openCharacters ? openCharacters : '';
    const cc = closeCharacters ? closeCharacters : '';

    const hasAssign = cc.length && cc[cc.length - 1] === '=';
    if (hasAssign) {
        nameClose = '';
        moveLeft = 0;
    } else {
        const bindOpenRegExp = /\[|\(/;
        const bindCloseRegExp = /\]|\)/;

        // get open bind characters
        let bindoc = '';
        const bindoc0 = oc.length > 0 ? oc[0] : '';
        const bindoc1 = oc.length > 1 ? oc[1] : '';
        bindoc += bindOpenRegExp.test(bindoc0) ? bindoc0 : '';
        bindoc += bindOpenRegExp.test(bindoc1) ? bindoc1 : '';

        // get closing bind characters
        let bindcc = '';
        const bindcc0 = cc.length > 0 ? cc[0] : '';
        const bindcc1 = cc.length > 1 ? cc[1] : '';
        bindcc += bindCloseRegExp.test(bindcc0) ? bindcc0 : '';
        bindcc += bindCloseRegExp.test(bindcc1) ? bindcc1 : '';

        // complete binding and assignment
        if (bindcc === '') {
            switch (bindoc) {
                case '[':
                    nameClose = ']=""';
                    break;
                case '[(':
                    nameClose = ')]=""';
                    break;
                case '(':
                    nameClose = ')=""';
                    break;
                case '([':
                    nameClose = '])=""';
                    break;
                default:
                    nameClose = '=""';
                    break;
            }
            moveLeft = 1;
        } else {
            nameClose = '';
            moveLeft = -1 * bindcc.length;
        }
    }
    
    for (let i = 0; i < result.length; i++) {
        result[i].insertText = result[i].label + nameClose;
        result[i].command.arguments[0].value = moveLeft;
    }

    return result;
}

/**
 * Get the given attribute for the given tag.
 * 
 * @param {string} tagName - The name of the tag to get the attribute from.
 * @param {string} attributeName - The name of the attribute to get.
 * @return {CompletionItem} - The requested attribute from the tag or undefined if the tag or attribute isn't defined.
 */
module.exports.getAttribute = function getAttribute(tagName, attributeName) {
    const attributes = module.exports.getAttributes(tagName);
    const nameLower = attributeName ? attributeName.toLowerCase() : '';
    for (let i = 0; i < attributes.length; i++) {
        if (nameLower === attributes[i].label) {
            return attributes[i];
        }
    } 

    return undefined;
}

/**
 * Get the valid values for the given attribute.
 * 
 * @param {string} tagName - The name of the tag to get the attribute from.
 * @param {string} attributeName - The name of the attribute to get the valid values for.
 * @return {CompletionItem} - The valid values for the specified attribute or an empty array if the tag or attribute isn't defined or all values are valid.
 */
module.exports.getAttributeValues = function getAttributeValues(tagName, attributeName) {
    const attribute = module.exports.getAttribute(tagName, attributeName);
    if (!attribute || !attribute.valueType || !valueSets[attribute.valueType]) {
        return [];
    }

    return valueSets[attribute.valueType];
}

/**
 * Create a new closing tag.
 * 
 * @param {string} name - The name of the tag.
 * @return {CompletionItem} - A new CompletionItem for the close tag.  i.e. '/div>'.
 */
module.exports.newCloseTag = function newCloseTag(name) {
    const closeTag = new vscode.CompletionItem('/' + name, vscode.CompletionItemKind.Property);
    closeTag.insertText = '/' + name + '>';
    return closeTag;
}
