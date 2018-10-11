"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        var cssSheet = this.stylesheet;
        var rules = Array.from(cssSheet.rules || cssSheet.cssRules);
        var metadataRule = rules.find(function (rule) {
            return (rule.selectorText === '-anthology-metadata::before');
        });
        if (!metadataRule) {
            throw new Error('Style sheet does not contain Anthology.scss metadata.');
        }
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
        // TODO: memoize and improve comments
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
        this.rules.find(function (rule) {
            // Search dynamically-responsive rules first
            if (!!options.breakpoint && rule.type === CSSRule.MEDIA_RULE) {
                var mediaRule = rule;
                if (mediaRule.conditionText.includes(_this.breakpoints[options.breakpoint])) {
                    selector = "" + shorthand + separator + adjective + important + theme + pseudo;
                    selectorEscaped = CSS.escape(selector);
                    return !!Array.from(mediaRule.cssRules).find(function (rule) {
                        styleRule = rule;
                        return styleRule.selectorText.includes(selectorEscaped);
                    });
                }
            }
            else if (rule.type === CSSRule.STYLE_RULE) {
                selector = "" + shorthand + separator + adjective + important + theme + breakpoint + pseudo;
                selectorEscaped = CSS.escape(selector);
                styleRule = rule;
                return styleRule.selectorText.includes(selectorEscaped);
            }
        });
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
