import { AnthologyRule, ExtractOptions } from './types';

export class AnthologyClient<BreakpointNames extends string> {
  // --- Properties --- //

  private metadata: any;
  private stylesheet: StyleSheet;
  private rules: CSSRule[];

  // --- Constructor --- //

  constructor(styleSheet: StyleSheet = AnthologyClient.styleSheets[0]) {
    if (!styleSheet) {
      throw new Error(
        'Could not find any style sheets containing Anthology.scss metadata.',
      );
    }

    this.stylesheet = styleSheet;
    this.parseMetadata();
  }

  // --- Getters --- //

  /**
   * Get all Anthology-compatible style sheets in the document.
   *
   * @readonly
   * @static
   * @memberof Anthology
   */
  public static get styleSheets() {
    // TODO: memoize
    const styleSheets = Array.from(document.styleSheets);

    return styleSheets.filter(rawSheet => {
      if (!rawSheet['rules'] && !rawSheet['cssRules']) return false;
      const cssSheet = rawSheet as CSSStyleSheet;
      const rules = (Array.from(
        cssSheet.rules || cssSheet.cssRules,
      ) as unknown) as CSSStyleRule[];
      return !!rules.find(
        rule => rule.selectorText === '-anthology-metadata::before',
      );
    });
  }

  /**
   * Get breakpoints configured for this instance of `Anthology.scss`.
   *
   * @readonly
   * @type {{ [key in BreakpointNames]: string }}
   * @memberof Anthology
   */
  public get breakpoints(): { [key in BreakpointNames]: string } {
    return this.metadata.config.breakpoints;
  }

  // --- Methods --- //

  /**
   * Parse metadata for this instance of `Anthology.scss`.
   */
  public parseMetadata() {
    // TODO: better error messaging
    if (!this.stylesheet['cssRules']) {
      throw new Error('Style sheet does not contain any CSS rules.');
    }

    const cssSheet = this.stylesheet as CSSStyleSheet;
    const rules = (Array.from(
      cssSheet.rules || cssSheet.cssRules,
    ) as unknown) as CSSRule[];
    const metadataRule: CSSStyleRule = rules.find(rule => {
      return (
        (rule as CSSStyleRule).selectorText === '-anthology-metadata::before'
      );
    }) as CSSStyleRule;

    if (!metadataRule) {
      throw new Error('Style sheet does not contain Anthology.scss metadata.');
    }

    const metadata = JSON.parse(JSON.parse(metadataRule.style.content));

    this.metadata = metadata;
    this.rules = rules;

    return this;
  }

  /**
   * Extract a rule from within the `Anthology.scss` style sheet on this instance.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {AnthologyRule}
   * @memberof AnthologyClient
   */
  public extract(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): AnthologyRule {
    // TODO: memoize and improve comments
    const separator = this.metadata.config.separator;
    const importantTag = this.metadata.config['important-tag'];
    const themeTag = this.metadata.config['theme-tag'];
    const responsiveTag = this.metadata.config['responsive-tag'];

    const important = !!options.important ? `${separator}${importantTag}` : '';
    const theme = !!options.theme
      ? `${separator}${themeTag}${options.theme}`
      : '';
    const breakpoint = !!options.breakpoint
      ? `${separator}${responsiveTag}${options.breakpoint}`
      : '';
    const pseudo = !!options.pseudo ? `${separator}${options.pseudo}` : '';

    let styleRule: CSSStyleRule;
    let selector: string;
    let selectorEscaped: string;

    // Find the first matching CSS Rule
    this.rules.find(rule => {
      // Search dynamically-responsive rules first
      if (!!options.breakpoint && rule.type === CSSRule.MEDIA_RULE) {
        const mediaRule = rule as CSSMediaRule;
        if (
          mediaRule.conditionText.includes(this.breakpoints[options.breakpoint])
        ) {
          selector = `${shorthand}${separator}${adjective}${important}${theme}${pseudo}`;
          selectorEscaped = CSS.escape(selector);

          return !!Array.from(mediaRule.cssRules).find(rule => {
            styleRule = rule as CSSStyleRule;
            return styleRule.selectorText.includes(selectorEscaped);
          });
        }
      } else if (rule.type === CSSRule.STYLE_RULE) {
        selector = `${shorthand}${separator}${adjective}${important}${theme}${breakpoint}${pseudo}`;
        selectorEscaped = CSS.escape(selector);

        styleRule = rule as CSSStyleRule;
        return styleRule.selectorText.includes(selectorEscaped);
      }
    });

    const property = styleRule.style[0];
    const value = styleRule.style[property];

    return {
      shorthand,
      adjective,
      options,
      selector,
      selectorEscaped,
      property,
      value,
      cssRule: styleRule,
    };
  }

  /**
   * A shortcut method to extract the `style` object from a `CSSRule` generated by `Anthology.scss`.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {CSSStyleDeclaration}
   * @memberof AnthologyClient
   */
  public extractStyle(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): CSSStyleDeclaration {
    return this.extract(shorthand, adjective, options).cssRule.style;
  }

  /**
   * A shortcut method to extract the _unescaped_ selector string from a `CSSRule` generated by `Anthology.scss`.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {CSSStyleDeclaration}
   * @memberof AnthologyClient
   */
  public extractSelector(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): string {
    return this.extract(shorthand, adjective, options).selector;
  }

  /**
   * A shortcut method to extract the _escaped_ selector string from a `CSSRule` generated by `Anthology.scss`.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {CSSStyleDeclaration}
   * @memberof AnthologyClient
   */
  public extractSelectorEscaped(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): string {
    return this.extract(shorthand, adjective, options).selectorEscaped;
  }

  /**
   * A shortcut method to extract the `property` from a `CSSRule` generated by `Anthology.scss`.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {CSSStyleDeclaration}
   * @memberof AnthologyClient
   */
  public extractProperty(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): string {
    return this.extract(shorthand, adjective, options).property;
  }

  /**
   * A shortcut method to extract the `value` from a `CSSRule` generated by `Anthology.scss`.
   *
   * @param {string} shorthand
   * @param {string} adjective
   * @param {ExtractOptions} [options={}]
   * @returns {CSSStyleDeclaration}
   * @memberof AnthologyClient
   */
  public extractValue(
    shorthand: string,
    adjective: string,
    options: ExtractOptions = {},
  ): string {
    return this.extract(shorthand, adjective, options).value;
  }
}
