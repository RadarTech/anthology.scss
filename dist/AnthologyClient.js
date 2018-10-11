"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
// TODO: Improve doc comments...
var AnthologyClient = /** @class */ (function () {
    // --- Constructor --- //
    function AnthologyClient(styleSheet) {
        if (styleSheet === void 0) { styleSheet = AnthologyClient.styleSheets[0]; }
        if (!styleSheet) {
            throw new Error('Could not find any style sheets containing Anthology.scss metadata.');
        }
        this.stylesheet = styleSheet;
        this.parseMetadata();
    }
    Object.defineProperty(AnthologyClient, "styleSheets", {
        // --- Getters --- //
        /**
         * Get all Anthology-compatible style sheets in the document.
         *
         * @readonly
         * @static
         * @memberof Anthology
         */
        get: function () {
            // TODO: memoize
            var styleSheets = Array.from(document.styleSheets);
            return styleSheets.filter(function (rawSheet) {
                if (!rawSheet['rules'] && !rawSheet['cssRules'])
                    return false;
                var cssSheet = rawSheet;
                var rules = Array.from(cssSheet.rules || cssSheet.cssRules);
                return !!rules.find(function (rule) { return rule.selectorText === '-anthology-metadata::before'; });
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnthologyClient.prototype, "breakpoints", {
        /**
         * Get breakpoints configured for this instance of `Anthology.scss`.
         *
         * @readonly
         * @type {{ [key in BreakpointNames]: string }}
         * @memberof Anthology
         */
        get: function () {
            // TODO: add more functionality here (i.e.: media query helpers for JS).
            return this.metadata.config.breakpoints;
        },
        enumerable: true,
        configurable: true
    });
    // --- Methods --- //
    /**
     * Parse metadata for this instance of `Anthology.scss`.
     */
    AnthologyClient.prototype.parseMetadata = function () {
        // TODO: better error messaging
        if (!this.stylesheet['cssRules']) {
            throw new Error('Style sheet does not contain any CSS rules.');
        }
        // Grab the style sheet and cast to proper typing.
        var cssSheet = this.stylesheet;
        // Get an array of rules from the sheet.
        var rules = Array.from(cssSheet.rules || cssSheet.cssRules);
        // Find the metadata rule.
        var metadataRule = rules.find(function (rule) {
            return (rule.selectorText === '-anthology-metadata::before');
        });
        // Raise an error if metadata is not found.
        if (!metadataRule) {
            throw new Error('Style sheet does not contain Anthology.scss metadata.');
        }
        // Parse metadata (parsing is done twice because the content is provided as a nested string).
        var metadata = JSON.parse(JSON.parse(metadataRule.style.content));
        this.metadata = metadata;
        this.rules = rules;
        return this;
    };
    /**
     * Extract a rule from within the `Anthology.scss` style sheet on this instance.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {AnthologyRule}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extract = function (shorthand, adjective, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        // TODO: memoize
        var separator = this.metadata.config.separator;
        var importantTag = this.metadata.config['important-tag'];
        var themeTag = this.metadata.config['theme-tag'];
        var responsiveTag = this.metadata.config['responsive-tag'];
        var important = !!options.important ? "" + separator + importantTag : '';
        var theme = !!options.theme
            ? "" + separator + themeTag + options.theme
            : '';
        var breakpoint = !!options.breakpoint
            ? "" + separator + responsiveTag + options.breakpoint
            : '';
        var pseudo = !!options.pseudo ? "" + separator + options.pseudo : '';
        var styleRule;
        var selector;
        var selectorEscaped;
        // Find the first matching CSS Rule
        var isValidRule = !!this.rules.find(function (rule) {
            // Search through dynamically-responsive rules first.
            if (!!options.breakpoint && rule.type === CSSRule.MEDIA_RULE) {
                var mediaRule = rule;
                // If we arrive at the desired breakpoint, search there next!
                if (mediaRule.conditionText.includes(_this.breakpoints[options.breakpoint])) {
                    // Define selectors
                    selector = "" + shorthand + separator + adjective + important + theme + pseudo;
                    selectorEscaped = CSS.escape(selector);
                    // Look through each internal rule...
                    return !!Array.from(mediaRule.cssRules).find(function (rule) {
                        // Define the rule (for inclusion in return value) and test for a potential match.
                        styleRule = rule;
                        return styleRule.selectorText.includes(selectorEscaped);
                    });
                }
            }
            else if (rule.type === CSSRule.STYLE_RULE) {
                // Define selectors
                selector = "" + shorthand + separator + adjective + important + theme + breakpoint + pseudo;
                selectorEscaped = CSS.escape(selector);
                // Define the rule (for inclusion in return value) and test for a potential match.
                styleRule = rule;
                return styleRule.selectorText.includes(selectorEscaped);
            }
        });
        // Throw if the rule is invalid or not found in this style sheet.
        if (!isValidRule) {
            throw new Error("Could not find Anthology-generated rule associated with selector: " + chalk_1.default.cyan(selectorEscaped));
        }
        // Define `property` and `value` for inclusion in return value.
        var property = styleRule.style[0];
        var value = styleRule.style[property];
        return {
            shorthand: shorthand,
            adjective: adjective,
            options: options,
            selector: selector,
            selectorEscaped: selectorEscaped,
            property: property,
            value: value,
            cssRule: styleRule,
        };
    };
    /**
     * A shortcut method to extract the `style` object from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {CSSStyleDeclaration}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extractStyle = function (shorthand, adjective, options) {
        if (options === void 0) { options = {}; }
        return this.extract(shorthand, adjective, options).cssRule.style;
    };
    /**
     * A shortcut method to extract the _unescaped_ selector string from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {CSSStyleDeclaration}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extractSelector = function (shorthand, adjective, options) {
        if (options === void 0) { options = {}; }
        return this.extract(shorthand, adjective, options).selector;
    };
    /**
     * A shortcut method to extract the _escaped_ selector string from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {CSSStyleDeclaration}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extractSelectorEscaped = function (shorthand, adjective, options) {
        if (options === void 0) { options = {}; }
        return this.extract(shorthand, adjective, options).selectorEscaped;
    };
    /**
     * A shortcut method to extract the `property` from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {CSSStyleDeclaration}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extractProperty = function (shorthand, adjective, options) {
        if (options === void 0) { options = {}; }
        return this.extract(shorthand, adjective, options).property;
    };
    /**
     * A shortcut method to extract the `value` from a `CSSRule` generated by `Anthology.scss`.
     *
     * @param {string} shorthand
     * @param {string} adjective
     * @param {ExtractOptions} [options={}]
     * @returns {CSSStyleDeclaration}
     * @memberof AnthologyClient
     */
    AnthologyClient.prototype.extractValue = function (shorthand, adjective, options) {
        if (options === void 0) { options = {}; }
        return this.extract(shorthand, adjective, options).value;
    };
    return AnthologyClient;
}());
exports.AnthologyClient = AnthologyClient;
