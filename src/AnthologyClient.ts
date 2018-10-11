import chalk from 'chalk';
import { AnthologyRule, ExtractOptions } from './types';

// TODO: Improve doc comments...

export class AnthologyClient<BreakpointNames extends string> {
  // --- Properties --- //

  private metadata: any;
  private stylesheet: StyleSheet;
  private rules: CSSRule[];

  // --- Constructor --- //

  constructor(styleSheet: StyleSheet = AnthologyClient.styleSheets[0]) {
    if (!styleSheet && !AnthologyClient.styleSheets[0]) {
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
  public static get styleSheets(): StyleSheet[] {
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
    // TODO: add more functionality here (i.e.: media query helpers for JS).
    return this.metadata.config.breakpoints;
  }

  // --- Methods --- //

  /**
   * Parse metadata for this instance of `Anthology.scss`.
   */
  public parseMetadata(): this {
    if (!this.stylesheet['rules'] && !this.stylesheet['cssRules']) {
      throw new Error('Style sheet does not contain any CSS rules.');
    }

    // Grab the style sheet and cast to proper typing.
    const cssSheet = this.stylesheet as CSSStyleSheet;

    // Get an array of rules from the sheet.
    const rules = (Array.from(
      cssSheet.rules || cssSheet.cssRules,
    ) as unknown) as CSSRule[];

    // Find the metadata rule.
    const metadataRule: CSSStyleRule = rules.find(rule => {
      return (
        (rule as CSSStyleRule).selectorText === '-anthology-metadata::before'
      );
    }) as CSSStyleRule;

    // Raise an error if metadata is not found.
    if (!metadataRule) {
      throw new Error('Style sheet does not contain Anthology.scss metadata.');
    }

    // Parse metadata (parsing is done twice because the content is provided as a nested string).
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
    // TODO: memoize
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
    const isValidRule = !!this.rules.find(rule => {
      // Search through dynamically-responsive rules first.
      if (!!options.breakpoint && rule.type === CSSRule.MEDIA_RULE) {
        const mediaRule = rule as CSSMediaRule;

        // If we arrive at the desired breakpoint, search there next!
        if (
          mediaRule.conditionText.includes(this.breakpoints[options.breakpoint])
        ) {
          // Define selectors
          selector = `${shorthand}${separator}${adjective}${important}${theme}${pseudo}`;
          selectorEscaped = CSS.escape(selector);

          // Look through each internal rule...
          return !!Array.from(mediaRule.cssRules).find(rule => {
            // Define the rule (for inclusion in return value) and test for a potential match.
            styleRule = rule as CSSStyleRule;
            return styleRule.selectorText.includes(selectorEscaped);
          });
        }
      } else if (rule.type === CSSRule.STYLE_RULE) {
        // Define selectors
        selector = `${shorthand}${separator}${adjective}${important}${theme}${breakpoint}${pseudo}`;
        selectorEscaped = CSS.escape(selector);

        // Define the rule (for inclusion in return value) and test for a potential match.
        styleRule = rule as CSSStyleRule;
        return styleRule.selectorText.includes(selectorEscaped);
      }
    });

    // Throw if the rule is invalid or not found in this style sheet.
    if (!isValidRule) {
      throw new Error(
        `Could not find Anthology-generated rule associated with selector: ${chalk.cyan(
          selectorEscaped,
        )}`,
      );
    }

    // Define `property` and `value` for inclusion in return value.
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
